// app/api/news/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
// --- Importer Cloudinary og type ---

import type { UploadApiResponse } from 'cloudinary';
import cloudinary from '@/app/lib/cloudinary';

const prisma = new PrismaClient();

// Oppdatert Zod schema for data *etter* henting fra FormData
const CreateNewsDataSchema = z.object({
  title: z.string().min(3, { message: 'Tittel må ha minst 3 tegn' }),
  content: z.string().min(10, { message: 'Innhold må ha minst 10 tegn' }),
  isPublished: z.boolean(), // Nå en boolean
});


// GET-handler (uendret fra forrige versjon med new PrismaClient())
export async function GET(request: Request) {
  // ... (GET-koden forblir den samme som i forrige svar) ...
     const prisma = new PrismaClient(); // Opprett instans her
      try {
        const session = await getServerSession(authOptions); // Hent session
        const currentUser = session?.user; // Bruker fra session
        const isAdmin = currentUser?.role === UserRole.ADMIN;

        const { searchParams } = new URL(request.url);
        const publishedOnly = searchParams.get('publishedOnly') === 'true';

        // Admin ser alt med mindre publishedOnly=true, andre ser kun publiserte
        const whereClause = (publishedOnly || !isAdmin)
          ? { isPublished: true }
          : {};

        const newsArticles = await prisma.newsArticle.findMany({ // Bruk prisma
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { name: true, image: true } } },
        });

        return NextResponse.json(newsArticles);
      } catch (error) {
        console.error('[NEWS_GET_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
      } finally {
        await prisma.$disconnect(); // Koble fra i finally-blokken
      }
}

// --- OPPdatert POST-handler for FormData ---
export async function POST(request: Request) {
  const prisma = new PrismaClient();
  try {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    if (!currentUser || !currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // --- Les som FormData ---
    const formData = await request.formData();

    const title = formData.get('title') as string | null;
    const content = formData.get('content') as string | null;
    // isPublished sendes som streng 'true'/'false' fra FormData
    const isPublishedString = formData.get('isPublished') as string | null;
    const imageFile = formData.get('image') as File | null;

    // Konverter isPublished til boolean
    const isPublished = isPublishedString === 'true';

    // --- Validering med Zod (på de ekstraherte dataene) ---
    const validationInput = {
        title: title ?? '', // Gi Zod en streng, selv om den er tom
        content: content ?? '',
        isPublished: isPublished,
    }
    const validation = CreateNewsDataSchema.safeParse(validationInput);

    if (!validation.success) {
      // Returnerer Zod-feilmeldinger strukturert
      console.error("Validation errors:", validation.error.flatten().fieldErrors);
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // --- Bildeopplasting (hvis fil finnes) ---
    let imageUrl: string | null = null;
    if (imageFile) {
      try {
        // Valider filstørrelse og type (Backend-validering)
        if (imageFile.size > 10 * 1024 * 1024) { // 10MB grense
          return NextResponse.json({ error: "Filen er for stor (maks 10MB)." }, { status: 400 });
        }
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(imageFile.type)) {
            return NextResponse.json({ error: "Ugyldig filtype (kun JPG, PNG, WEBP, GIF)." }, { status: 400 });
        }

        // Les fil til buffer
        const buffer = await imageFile.arrayBuffer();

        // Last opp til Cloudinary
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: "discgolf/news", // Egen mappe for nyhetsbilder
              upload_preset: "discgolf_uploads", // Bruk din eksisterende preset
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary Upload Error:", error);
                reject(new Error(`Cloudinary feil: ${error.message}`));
                return;
              }
              // Sjekk for result og secure_url
              if (!result?.secure_url) {
                console.error("Cloudinary response missing secure_url:", result);
                reject(new Error("Mangler secure_url i Cloudinary-svar"));
                return;
              }
              resolve(result);
            }
          ).end(Buffer.from(buffer));
        });

        imageUrl = result.secure_url;
        console.log("✅ Nyhetsbilde lastet opp:", imageUrl);

      } catch (uploadError) {
        console.error("Error during image upload:", uploadError);
         // Returner mer spesifikk feilmelding hvis mulig
        const errorMessage = uploadError instanceof Error ? uploadError.message : "Ukjent feil under bildeopplasting";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
    }

    // --- Lagre i databasen ---
    // Bruk data fra validation.data for å sikre korrekte typer
    const { title: validatedTitle, content: validatedContent, isPublished: validatedIsPublished } = validation.data;

    const newArticle = await prisma.newsArticle.create({
      data: {
        title: validatedTitle,
        content: validatedContent,
        imageUrl: imageUrl, // Blir null hvis ingen fil ble lastet opp
        isPublished: validatedIsPublished,
        publishedAt: validatedIsPublished ? new Date() : null,
        authorId: currentUser.id,
      },
      include: { // Inkluder forfatterinfo for responsen
            author: { select: { name: true, image: true } }
      }
    });

    console.log("📰 Nyhetsartikkel opprettet:", newArticle.id);
    return NextResponse.json(newArticle, { status: 201 });

  } catch (error) {
    console.error('[NEWS_POST_ERROR]', error);
     if (error instanceof z.ZodError) {
       // Dette burde fanges av sjekken over, men for sikkerhets skyld
       return NextResponse.json( { errors: error.flatten().fieldErrors }, { status: 400 });
    }
    // Generell feilhåndtering
    return NextResponse.json('Internal Server Error', { status: 500 }); // Returner JSON-feil
  } finally {
    await prisma.$disconnect();
  }
}

// PUT og DELETE handlers må også oppdateres tilsvarende for å håndtere FormData hvis de skal støtte bildeendring/fjerning
// ... (PUT og DELETE handlers kommer her, se neste svar for oppdatering av PUT) ...