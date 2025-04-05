// src/app/api/clubs/route.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { currentUser } from "@/app/lib/auth"; // Bruk currentUser
import { z } from "zod";
import cloudinary from "@/app/lib/cloudinary"; // Importer Cloudinary config
import type { UploadApiResponse } from "cloudinary";

// Valider at Cloudinary er konfigurert (tidlig sjekk)
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn("WARN: Cloudinary environment variables are not fully set. File uploads might fail.");
    // Vurder å kaste en feil her hvis Cloudinary er kritisk for all funksjonalitet
    // throw new Error("Cloudinary environment variables are missing!");
}

const prisma = new PrismaClient();

// --- GET-FUNKSJON (uendret fra forrige fungerende versjon) ---
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
        _count: { select: { memberships: true } },
        // Viktig: Inkluder membershipPrice hvis det trengs i listen
        // select: { ..., membershipPrice: true } // Hvis du trenger prisen i listeoversikten
      }
      // Hvis du *ikke* har 'select' over, hentes alle basefelter inkl. membershipPrice
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


// --- POST-FUNKSJON (Fullstendig) ---

// Hjelpefunksjon for Cloudinary-opplasting
async function uploadFileToCloudinary(file: File, folder: string): Promise<string | null> {
    if (!file) return null;
    // Validering
    if (file.size > 10 * 1024 * 1024) throw new Error(`Filen "${file.name}" er for stor (maks 10MB).`);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) throw new Error(`Ugyldig filtype for "${file.name}" (kun JPG, PNG, WEBP).`);

    const buffer = await file.arrayBuffer();

    try {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            // Bruk en unik public_id for å unngå overskriving (valgfritt, men anbefalt)
            const timestamp = Date.now();
            const public_id = `${file.name.split('.')[0]}_${timestamp}`;

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    upload_preset: "discgolf_uploads", // Dobbeltsjekk navnet i Cloudinary
                    resource_type: "image",
                    public_id: public_id, // Gir et mer unikt navn
                },
                (error, result) => {
                    if (error) return reject(new Error(`Cloudinary feil: ${error.message}`));
                    if (!result?.secure_url) return reject(new Error("Mangler secure_url fra Cloudinary"));
                    resolve(result);
                }
            );
            stream.end(Buffer.from(buffer)); // Send buffer til stream
        });
        console.log(`✅ Fil (${file.name}) lastet opp til Cloudinary (${folder}): ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`❌ Cloudinary opplastingsfeil for ${file.name} (${folder}):`, error);
        throw error; // Kast feilen videre
    }
}

// Zod Schema for validering
const ClubApiSchema = z.object({
  name: z.string().min(3, "Navn må ha minst 3 tegn"),
  location: z.string().min(2, "Sted/Lokasjon må fylles ut"),
  description: z.string().trim().optional().nullish(), // Tillat tom streng, trim, gjør om til null
  email: z.string().email("Ugyldig epost").optional().or(z.literal('')).nullish(),
  address: z.string().trim().optional().nullish(),
  phone: z.string().trim().optional().nullish(),
  website: z.string().url("Ugyldig nettside URL").optional().or(z.literal('')).nullish(),
  postalCode: z.string().trim().optional().nullish(),
  membershipPrice: z.string()
    .optional()
    .transform((val) => {
        if (val === undefined || val === null || val.trim() === '') return null;
        const num = parseInt(val.trim(), 10);
        return isNaN(num) || num < 0 ? null : num;
    }),
}).refine(data => data.name !== undefined && data.location !== undefined, {
    message: "Navn og sted er påkrevd", // Ekstra sjekk
});


export async function POST(req: Request) {
  const endpoint = "/api/clubs (POST)";
  console.log(`[${endpoint}] Received request`);

  try {
    // Autentisering
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Brukeren er ikke autentisert." }, { status: 401 });
    }
    const userId = user.id;
    console.log(`[${endpoint}] User ${userId} authenticated.`);

    // Håndter FormData
    const formData = await req.formData();
    const logoFile = formData.get('logoUrl') as File | null;
    const imageFile = formData.get('imageUrl') as File | null;

    const rawData: { [key: string]: any } = {};
    formData.forEach((value, key) => { if (!(value instanceof File)) { rawData[key] = value; } });

    // Valider Tekstdata
    const validatedDataResult = ClubApiSchema.safeParse(rawData);
    if (!validatedDataResult.success) {
       console.error(`[${endpoint}] Validation errors:`, validatedDataResult.error.flatten().fieldErrors);
      return NextResponse.json({ error: "Ugyldig data sendt.", details: validatedDataResult.error.flatten().fieldErrors }, { status: 400 });
    }
    // Bruk .data for å få typet data, inkludert transformerte verdier
    const { name, location, membershipPrice, description, email, address, phone, website, postalCode } = validatedDataResult.data;

    // Sjekk Eksisterende Klubb
    const existingClub = await prisma.club.findUnique({ where: { name } });
    if (existingClub) {
        return NextResponse.json({ error: "En klubb med dette navnet finnes allerede." }, { status: 409 });
    }

    // Last opp bilder (hvis de finnes)
    console.log(`[${endpoint}] Uploading files (if any)...`);
    const [logoUploadUrl, imageUploadUrl] = await Promise.all([
        logoFile ? uploadFileToCloudinary(logoFile, 'discgolf/clubs/logos') : Promise.resolve(null),
        imageFile ? uploadFileToCloudinary(imageFile, 'discgolf/clubs/images') : Promise.resolve(null)
    ]);
    console.log(`[${endpoint}] File uploads done.`);

    // Opprett Klubb i DB
    console.log(`[${endpoint}] Creating club "${name}" in database...`);
    const newClub = await prisma.club.create({
      data: {
        name,
        location,
        membershipPrice, // Lagre pris i øre (eller null)
        description: description ?? null, // Bruk null hvis undefined
        email: email ?? null,
        address: address ?? null,
        phone: phone ?? null,
        website: website ?? null,
        postalCode: postalCode ?? null,
        logoUrl: logoUploadUrl,
        imageUrl: imageUploadUrl,
        established: new Date(),
        admins: { connect: { id: userId } }, // Koble admin
      },
       select: { id: true, name: true } // Returner kun nødvendig info
    });
    console.log(`[${endpoint}] Club "${newClub.name}" (ID: ${newClub.id}) created.`);

    // Returner Suksess
    return NextResponse.json({ message: "Klubb opprettet!", club: newClub }, { status: 201 });

  } catch (error) {
    console.error(`[${endpoint}] Error:`, error);
    const errorMessage = error instanceof Error ? error.message : "En ukjent feil oppstod.";
    // Sjekk for spesifikke feil, f.eks. Cloudinary rate limits eller config errors
    // if (error.message.includes("Cloudinary")) { ... }
    return NextResponse.json({ error: `Kunne ikke opprette klubben: ${errorMessage}` }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
// ===================================