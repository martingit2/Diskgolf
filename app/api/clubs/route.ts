// src/app/api/clubs/route.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { currentUser } from "@/app/lib/auth"; // Bruk currentUser
import { z } from "zod";
import cloudinary from "@/app/lib/cloudinary"; // Importer Cloudinary config
import type { UploadApiResponse } from "cloudinary";

// Valider Cloudinary config (valgfritt, men lurt)
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn("WARN: Cloudinary environment variables are not fully set.");
}

const prisma = new PrismaClient();

// --- GET-FUNKSJON (uendret) ---
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '6', 10);
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, limit);
  const endpoint = "/api/clubs (GET)";

  try {
    const skip = (validPage - 1) * validLimit;
    const clubs = await prisma.club.findMany({
      orderBy: { established: 'desc' },
      skip: skip,
      take: validLimit,
      include: {
        _count: { select: { memberships: true } }
        // Inkluderer alle basefelter som standard
      }
    });
    const totalCount = await prisma.club.count();
    const totalPages = Math.ceil(totalCount / validLimit);
    return NextResponse.json({ clubs, totalPages, currentPage: validPage }, { status: 200 });
  } catch (error) {
    console.error(`[${endpoint}] Error fetching clubs:`, error);
    return NextResponse.json({ error: "Noe gikk galt ved henting av klubber" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
// -----------------------------------------


// --- POST-FUNKSJON (Oppretter klubb, admin OG medlemskap) ---

// Hjelpefunksjon for Cloudinary
async function uploadFileToCloudinary(file: File, folder: string): Promise<string | null> {
    if (!file) return null;
    if (file.size > 10 * 1024 * 1024) throw new Error(`Filen "${file.name}" er for stor (maks 10MB).`);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) throw new Error(`Ugyldig filtype for "${file.name}".`);

    const buffer = await file.arrayBuffer();
    try {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const timestamp = Date.now();
            const public_id = `${file.name.split('.')[0]}_${timestamp}`;
            const stream = cloudinary.uploader.upload_stream( { folder: folder, upload_preset: "discgolf_uploads", resource_type: "image", public_id }, (error, result) => {
                    if (error) return reject(new Error(`Cloudinary feil: ${error.message}`));
                    if (!result?.secure_url) return reject(new Error("Mangler secure_url"));
                    resolve(result);
                });
            stream.end(Buffer.from(buffer));
        });
        return result.secure_url;
    } catch (error) { throw error; }
}

// Zod Schema
const ClubApiSchema = z.object({
  name: z.string().min(3, "Navn må ha minst 3 tegn"),
  location: z.string().min(2, "Sted/Lokasjon må fylles ut"),
  description: z.string().trim().optional().nullish(),
  email: z.string().email("Ugyldig epost").optional().or(z.literal('')).nullish(),
  address: z.string().trim().optional().nullish(),
  phone: z.string().trim().optional().nullish(),
  website: z.string().url("Ugyldig URL").optional().or(z.literal('')).nullish(),
  postalCode: z.string().trim().optional().nullish(),
  membershipPrice: z.string().optional().transform((val) => {
        if (val === undefined || val === null || val.trim() === '') return null;
        const num = parseInt(val.trim(), 10);
        return isNaN(num) || num < 0 ? null : num;
    }),
}).refine(data => data.name !== undefined && data.location !== undefined, { message: "Navn og sted er påkrevd" });


export async function POST(req: Request) {
  const endpoint = "/api/clubs (POST)";
  console.log(`[${endpoint}] Received request`);

  let createdClubId: string | null = null; // For å spore ID hvis noe feiler etter klubbopprettelse

  try {
    // Autentisering
    const user = await currentUser();
    if (!user?.id) return NextResponse.json({ error: "Brukeren er ikke autentisert." }, { status: 401 });
    const userId = user.id;

    // Håndter FormData
    const formData = await req.formData();
    const logoFile = formData.get('logoUrl') as File | null;
    const imageFile = formData.get('imageUrl') as File | null;
    const rawData: { [key: string]: any } = {};
    formData.forEach((value, key) => { if (!(value instanceof File)) { rawData[key] = value; } });

    // Valider Tekstdata
    const validatedDataResult = ClubApiSchema.safeParse(rawData);
    if (!validatedDataResult.success) {
      return NextResponse.json({ error: "Ugyldig data sendt.", details: validatedDataResult.error.flatten().fieldErrors }, { status: 400 });
    }
    const { name, location, membershipPrice, ...otherValidatedData } = validatedDataResult.data;

    // Sjekk Eksisterende Klubb
    const existingClub = await prisma.club.findUnique({ where: { name } });
    if (existingClub) return NextResponse.json({ error: "En klubb med dette navnet finnes allerede." }, { status: 409 });

    // Last opp bilder
    const [logoUploadUrl, imageUploadUrl] = await Promise.all([
        logoFile ? uploadFileToCloudinary(logoFile, 'discgolf/clubs/logos') : Promise.resolve(null),
        imageFile ? uploadFileToCloudinary(imageFile, 'discgolf/clubs/images') : Promise.resolve(null)
    ]);

    // --- Opprett Klubb i DB ---
    const newClub = await prisma.club.create({
      data: {
        name, location, membershipPrice, ...otherValidatedData,
        logoUrl: logoUploadUrl, imageUrl: imageUploadUrl,
        established: new Date(),
        admins: { connect: { id: userId } }, // Koble admin
      },
      select: { id: true, name: true } // Trenger kun ID her
    });
    createdClubId = newClub.id; // Lagre ID
    console.log(`[${endpoint}] Club "${newClub.name}" (ID: ${newClub.id}) created.`);
    // --------------------------

    // --- LEGG TIL MEDLEMSKAP AUTOMATISK ---
    try {
        console.log(`[${endpoint}] Adding user ${userId} as member to club ${createdClubId}...`);
        // Sjekk om brukeren skal være primærmedlem (f.eks. hvis det er deres første klubb)
        const existingMemberships = await prisma.membership.count({ where: { userId } });
        const makePrimary = existingMemberships === 0; // Gjør til primær hvis ingen andre finnes

        await prisma.membership.create({
            data: {
                userId: userId,
                clubId: createdClubId,
                status: 'active', // Sett som aktiv? Eller krever betaling?
                isPrimary: makePrimary,
            }
        });
        console.log(`[${endpoint}] User ${userId} added as member (isPrimary: ${makePrimary}).`);
    } catch (membershipError) {
         console.error(`[${endpoint}] Failed to automatically add user as member:`, membershipError);
         // Fortsett selv om dette feiler, klubben er opprettet. Logg feilen.
    }
    // -----------------------------------

    // --- Returner Suksess ---
    return NextResponse.json({ message: "Klubb opprettet! Du er lagt til som administrator og medlem.", club: newClub }, { status: 201 });

  } catch (error) {
    console.error(`[${endpoint}] Error:`, error);
    const errorMessage = error instanceof Error ? error.message : "En ukjent feil oppstod.";
    // Hvis klubben ble opprettet, men noe feilet etterpå, kan vi gi en annen melding?
    // (Krever mer kompleks logikk)
    return NextResponse.json({ error: `Kunne ikke opprette klubben: ${errorMessage}` }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}