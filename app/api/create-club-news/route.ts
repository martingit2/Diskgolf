// Fil: src/app/api/create-club-news/route.ts
// Formål: API-endepunkt (POST) for å opprette en ny klubbnyhet. Håndterer autentisering,
//         spesifikk klubb-autorisasjon, bildeopplasting og database-lagring.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import { currentUser } from "@/app/lib/auth";
import cloudinary from "@/app/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

const prisma = new PrismaClient();

async function uploadNewsImageToCloudinary(file: File): Promise<string | null> {

    if (!file) return null;
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) throw new Error(`Bilde er for stort (maks ${MAX_SIZE_MB}MB).`);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) throw new Error("Ugyldig filtype (kun JPG, PNG, WEBP).");
    const buffer = await file.arrayBuffer();
    try {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const timestamp = Date.now();
            const safeFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
            const public_id = `news_${timestamp}_${safeFilename.split('.')[0]}`;
            const stream = cloudinary.uploader.upload_stream({ folder: "discgolf/club_news", upload_preset: "discgolf_uploads", resource_type: "image", public_id: public_id, }, (error, result) => { if (error) { console.error("Cloudinary stream error:", error); return reject(new Error(`Cloudinary feil: ${error.message}`)); } if (!result?.secure_url) { console.error("Cloudinary result missing secure_url:", result); return reject(new Error("Mangler secure_url fra Cloudinary")); } resolve(result); });
            stream.end(Buffer.from(buffer));
        });
        console.log(`[API] Nyhetsbilde lastet opp: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) { console.error(`[API] Cloudinary opplastingsfeil for nyhetsbilde:`, error); throw error; }
}

export async function POST(req: NextRequest) {
  const endpoint = "/api/create-club-news";
  console.log(`[${endpoint}] --- START Request ---`);

  try {
    // 1. Autentisering & Generell Autorisering
    console.log(`[${endpoint}] Sjekker autentisering og generell rolle...`);
    const user = await currentUser();
    const userId = user?.id;
    const userRole = user?.role as UserRole | undefined;

    if (!userId || !userRole) { /* ... feilhåndtering ... */ return NextResponse.json({ error: "Uautorisert: Vennligst logg inn." }, { status: 401 }); }
    console.log(`[${endpoint}] OK: Bruker ID: ${userId}, Rolle: ${userRole}`);

    if (userRole !== UserRole.ADMIN && userRole !== UserRole.CLUB_LEADER) { /* ... feilhåndtering ... */ return NextResponse.json({ error: "Ingen tilgang til å opprette nyheter." }, { status: 403 }); }
    console.log(`[${endpoint}] OK: Generell rolle autorisert.`);

    // 2. Hent og Valider FormData
    console.log(`[${endpoint}] Henter FormData...`);
    let formData: FormData;
    try { formData = await req.formData(); }
    catch (e) { /* ... feilhåndtering ... */ return NextResponse.json({ error: "Kunne ikke behandle skjemadata." }, { status: 400 }); }
    console.log(`[${endpoint}] OK: FormData hentet.`);

    const clubId = formData.get("clubId") as string | null;
    const title = formData.get("title") as string | null;
    const content = formData.get("content") as string | null;
    const imageFile = formData.get("image") as File | null;

    console.log(`[${endpoint}] Validerer felter: clubId=${clubId}, title=${!!title}, content=${!!content}, imageFile=${!!imageFile}`);
    if (!clubId || !title?.trim() || !content?.trim()) { /* ... feilhåndtering ... */ return NextResponse.json({ error: "Mangler klubb-ID, tittel eller innhold." }, { status: 400 }); }
    console.log(`[${endpoint}] OK: Påkrevde felter validert.`);

    // 3. Autoriser for Spesifikk Klubb
    console.log(`[${endpoint}] Sjekker autorisasjon for klubb ID: ${clubId}...`);
    let isAuthorizedForClub = false;
    if (userRole === UserRole.ADMIN) {
      isAuthorizedForClub = true;
      console.log(`[${endpoint}] OK: Bruker er ADMIN.`);
    } else if (userRole === UserRole.CLUB_LEADER) {
      // --- KORRIGERT SJEKK HER ---
      // Sjekk KUN om brukeren er medlem av klubben (siden vi allerede vet rollen er CLUB_LEADER)
      const membership = await prisma.membership.findUnique({
        where: {
          userId_clubId: { userId: userId, clubId: clubId },
        }
      });
      // Hvis et medlemskap finnes for denne brukeren i denne klubben,
      // og vi vet fra før at brukerens rolle ER CLUB_LEADER, så er de autorisert.
      if (membership) {
        isAuthorizedForClub = true;
        console.log(`[${endpoint}] OK: Bruker (CLUB_LEADER) er medlem av klubb ${clubId}.`);
      } else {
        console.log(`[${endpoint}] FEIL: Bruker (CLUB_LEADER) er IKKE medlem av klubb ${clubId}.`);
      }
      // -----------------------------
    }

    if (!isAuthorizedForClub) {
      return NextResponse.json({ error: "Du har ikke tilgang til å poste nyheter for den valgte klubben." }, { status: 403 });
    }
    console.log(`[${endpoint}] OK: Spesifikk klubbautorisasjon godkjent.`);

    // 4. Bildeopplasting
    let imageUrl: string | null = null;
    if (imageFile) { /* ... */ }
    else { console.log(`[${endpoint}] Ingen bilde valgt for opplasting.`); }

    // 5. Lagre Nyhet i Databasen
    console.log(`[${endpoint}] Oppretter nyhet i databasen...`);
    let newClubNews;
    try {
      newClubNews = await prisma.clubNews.create({
        data: {
          clubId: clubId,
          title: title.trim(),
          content: content.trim(),
          imageUrl: imageUrl,
        },
        select: { id: true, title: true }
      });
      console.log(`[${endpoint}] OK: Nyhet opprettet med ID: ${newClubNews.id}`);
    } catch (dbError) { /* ... feilhåndtering ... */ return NextResponse.json({ error: "Databasefeil: Kunne ikke lagre nyheten." }, { status: 500 }); }

    // 6. Suksessrespons
    console.log(`[${endpoint}] Sender suksessrespons.`);
    return NextResponse.json(newClubNews, { status: 201 });

  } catch (error) {
    // Generell feilhåndtering
    console.error(`[${endpoint}] UHANDLED SERVER ERROR:`, error);
    const errorMsg = error instanceof Error ? error.message : "En ukjent feil oppstod";
    return NextResponse.json({ error: `Serverfeil: ${errorMsg}` }, { status: 500 });
  } finally {
    // Frakobling fra DB
    try { await prisma.$disconnect(); console.log(`[${endpoint}] --- END Request (Prisma disconnected) ---`); }
    catch (disconnectError) { console.error(`[${endpoint}] Feil ved frakobling av Prisma:`, disconnectError); }
  }
}