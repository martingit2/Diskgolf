// Fil: src/app/api/create-club-news/route.ts
// Formål: API-endepunkt (POST) for å opprette en ny klubbnyhet. Håndterer autentisering/autorisasjon,
//         tar imot tittel, innhold, klubb-ID og eventuelt et bilde via FormData, laster opp bildet
//         til Cloudinary, og lagrer nyhetsdataen i databasen.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { currentUser, currentRole } from "@/app/lib/auth";
import cloudinary from "@/app/lib/cloudinary"; // <-- Sjekk denne stien
import type { UploadApiResponse } from "cloudinary";

const prisma = new PrismaClient();

// === DEFINISJON AV HJELPEFUNKSJONEN ===
async function uploadNewsImageToCloudinary(file: File): Promise<string | null> {
    if (!file) return null;
    // Validering
    if (file.size > 5 * 1024 * 1024) throw new Error(`Bilde er for stort (maks 5MB).`);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) throw new Error("Ugyldig filtype (kun JPG, PNG, WEBP).");

    const buffer = await file.arrayBuffer();
    try {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const timestamp = Date.now();
            const safeFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
            const public_id = `news_${timestamp}_${safeFilename.split('.')[0]}`;
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "discgolf/club_news", // Egen mappe
                    upload_preset: "discgolf_uploads", // Sjekk denne
                    resource_type: "image",
                    public_id: public_id,
                },
                (error, result) => {
                    if (error) return reject(new Error(`Cloudinary feil: ${error.message}`));
                    if (!result?.secure_url) return reject(new Error("Mangler secure_url fra Cloudinary"));
                    resolve(result);
                }
            );
            stream.end(Buffer.from(buffer));
        });
        console.log(`✅ Nyhetsbilde lastet opp: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`❌ Cloudinary opplastingsfeil for nyhetsbilde:`, error);
        throw error; // Kast feilen videre
    }
}
// ======================================


export async function POST(req: NextRequest) {
  const endpoint = "/api/create-club-news";
  console.log(`[${endpoint}] --- START Request ---`);

  try {
    // --- Autentisering & Autorisering ---
    console.log(`[${endpoint}] 1. Checking auth...`);
    const user = await currentUser();
    const role = user?.role;
    const userId = user?.id;
    if (!userId) { /* ... feilhåndtering ... */ return NextResponse.json({ error: "Bruker ikke autentisert" }, { status: 401 }); }
    console.log(`[${endpoint}] 1. OK: User ${userId}. Role: ${role}`);
    if (role !== "ADMIN" && role !== "CLUB_LEADER") { /* ... feilhåndtering ... */ return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 }); }
    console.log(`[${endpoint}] 2. OK: User authorized.`);
    // ------------------------------------

    // --- Hent & Valider FormData ---
    console.log(`[${endpoint}] 3. Getting FormData...`);
    let formData: FormData;
    try { formData = await req.formData(); } catch (e) { /* ... feilhåndtering ... */ return NextResponse.json({ error: "Kunne ikke lese skjemadata." }, { status: 400 }); }
    console.log(`[${endpoint}] 3. OK.`);

    console.log(`[${endpoint}] 4. Extracting fields...`);
    const clubId = formData.get("clubId") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File | null;
    console.log(`[${endpoint}] 4. OK: (clubId: ${clubId}, title: ${!!title}, content: ${!!content}, imageFile: ${!!imageFile})`);

    console.log(`[${endpoint}] 5. Validating fields...`);
    if (!clubId || !title || !content) { /* ... feilhåndtering ... */ return NextResponse.json({ error: "Mangler påkrevde felter." }, { status: 400 }); }
    console.log(`[${endpoint}] 5. OK.`);
    // -------------------------------

    // --- TODO: Autoriser for spesifikk klubb ---
    console.log(`[${endpoint}] 6. Skipping specific club auth check (TODO).`);
    // ------------------------------------------

    // --- Bildeopplasting ---
    let imageUrl: string | null = null;
    if (imageFile) {
        console.log(`[${endpoint}] 7. Uploading image...`);
        try {
            // Bruker hjelpefunksjonen vi definerte over
            imageUrl = await uploadNewsImageToCloudinary(imageFile);
            console.log(`[${endpoint}] 7. OK: Image uploaded: ${imageUrl}`);
        } catch (uploadError) { /* ... feilhåndtering ... */ const errorMsg = uploadError instanceof Error ? uploadError.message : "Cloudinary feil"; return NextResponse.json({ error: `Bildeopplasting feilet: ${errorMsg}` }, { status: 500 }); }
    } else {
        console.log(`[${endpoint}] 7. No image file.`);
    }
    // -----------------------

    // --- Databaseoppretting ---
    console.log(`[${endpoint}] 8. Creating news in DB...`);
    let newClubNews;
    try {
        newClubNews = await prisma.clubNews.create({
          data: { clubId, title: title.trim(), content: content.trim(), imageUrl },
          select: { id: true, title: true }
        });
        console.log(`[${endpoint}] 8. OK: News created:`, newClubNews);
    } catch (dbError) { /* ... feilhåndtering ... */ console.error(`[${endpoint}] 8. FAIL: DB create failed:`, dbError); return NextResponse.json({ error: "Kunne ikke lagre nyhet." }, { status: 500 }); }
    // --------------------------

    // --- Suksessrespons ---
    console.log(`[${endpoint}] 9. Returning success.`);
    return NextResponse.json(newClubNews, { status: 201 });
    // ---------------------

  } catch (error) {
    // Generell feil
    console.error(`[${endpoint}] UNHANDLED Error:`, error);
    const errorMsg = error instanceof Error ? error.message : "Ukjent serverfeil";
    return NextResponse.json({ error: `Serverfeil: ${errorMsg}` }, { status: 500 });
  } finally {
      // Koble fra DB
      try { await prisma.$disconnect(); console.log(`[${endpoint}] --- END Request (DB disconnected) ---`); }
      catch (disconnectError) { console.error(`[${endpoint}] Error disconnecting DB:`, disconnectError); }
  }
}