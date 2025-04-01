// app/api/news/[newsId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import cloudinary from '@/app/lib/cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';

const prisma = new PrismaClient();

const UpdateNewsDataSchema = z.object({
  title: z.string().min(3, { message: "Tittel må ha minst 3 tegn." }).optional(),
  content: z.string().optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string().uuid({ message: "Ugyldig kategori ID format." })).optional(),
});

// --- NY: Definer type for context-objektet med Promise-wrapped params ---
type RouteContext = {
  params: Promise<{ newsId: string }>;
}

// Hjelpefunksjon: Generer Utdrag (uendret)
function generateExcerptFromHtml(html: string, maxLength = 150): string {
    // ... (samme som før) ...
     if (!html) return '';
    try {
        // Bruk JSDOM for å parse HTML trygt i Node.js
        const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
        const { window } = dom;
        const { document } = window;

        // Fjern uønskede elementer (f.eks. bilder, iframes) før tekstuthenting hvis nødvendig
        document.querySelectorAll('img, iframe, script, style, noscript').forEach(el => el.remove());

        // Hent tekst fra body, eller fallback til første paragraf hvis body er tom
        let text = document.body.textContent || document.querySelector('p')?.textContent || '';

        text = text.replace(/\s+/g, ' ').trim(); // Normaliser whitespace

        if (text.length <= maxLength) {
        return text;
        }
        // Kutt ved siste hele ord før maxLength for å unngå brutte ord
        const truncated = text.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated) + '...';
    } catch (e) {
        console.error("Feil under generering av utdrag:", e);
        // Fallback: enkel tekst-kutting fra rå HTML (mindre ideelt)
        const plainText = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
    }
}

// Hjelpefunksjon: Slett Cloudinary Bilde (uendret)
async function deleteOldCloudinaryImage(imageUrl: string | null): Promise<void> {
    // ... (samme som før) ...
     if (!imageUrl) return; // Ingen URL å slette

    try {
        // Prøv å ekstrahere public_id fra URLen
        // Format: https://res.cloudinary.com/<cloud_name>/<asset_type>/<delivery_type>/<transformations>/<version>/<public_id>.<format>
        // Vi trenger delen etter versjonsnummer (vXXXXXX) og før formatet (.jpg)
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
            console.warn("Kunne ikke parse public_id fra Cloudinary URL (uregelmessig format?):", imageUrl);
            return;
        }
        // Antar at public_id kan inneholde mapper, så vi tar alt etter versjon/transformasjoner
        const publicIdWithFormat = urlParts.slice(uploadIndex + 2).join('/');
        // Fjern filtypen (.jpg, .png etc.)
        const public_id = publicIdWithFormat.substring(0, publicIdWithFormat.lastIndexOf('.')) || publicIdWithFormat;

        if (!public_id) {
             console.warn("Kunne ikke ekstrahere public_id for sletting:", imageUrl);
             return;
        }

        console.log(`Forsøker å slette gammelt bilde fra Cloudinary med public_id: ${public_id}`);
        const result = await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
        console.log("Cloudinary sletteresultat:", result);
        // 'ok' indikerer suksess, 'not found' er også ok (bildet fantes ikke)
        if (result.result !== 'ok' && result.result !== 'not found') {
            console.warn("Cloudinary sletting mislyktes:", result);
        }

    } catch (error) {
        console.error("Feil under sletting av gammelt Cloudinary-bilde:", error);
        // Vi kaster ikke feilen videre her, da databaseoppdateringen er viktigere
    }
}

// --- OPPDATERT GET Handler ---
// Bruker RouteContext for det andre argumentet
export async function GET(request: NextRequest, context: RouteContext) {
  const prisma = new PrismaClient();
  try {
    // --- NY: Await params for å få verdien ---
    const { newsId } = await context.params;

    if (!newsId) {
      // Denne sjekken er teknisk sett overflødig nå pga. typingen, men skader ikke
      return NextResponse.json({ error: 'News ID missing' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const currentUser = session?.user;
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    const article = await prisma.newsArticle.findUnique({
      where: { id: newsId },
      include: {
        author: { select: { name: true, image: true } },
        categories: { select: { name: true, slug: true } }
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (!isAdmin && !article.isPublished) {
      return NextResponse.json({ error: 'Article not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(article);

  } catch (error: any) {
    console.error('[NEWS_GET_ID_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// --- OPPDATERT PUT Handler ---
// Bruker RouteContext for det andre argumentet
export async function PUT(request: NextRequest, context: RouteContext) {
  const prisma = new PrismaClient();
  try {
    // --- NY: Await params ---
    const { newsId } = await context.params;

    if (!newsId) {
      return NextResponse.json({ error: 'News ID missing' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const currentArticleData = await prisma.newsArticle.findUnique({
      where: { id: newsId },
      select: { imageUrl: true, isPublished: true }
    });

    if (!currentArticleData) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Resten av PUT-logikken er den samme, bruker 'newsId' som hentet over
    const formData = await request.formData();
    const updatePayload: Record<string, unknown> = {};
    const prismaUpdateData: Record<string, any> = {};

    // ... (all logikken for å hente title, content, isPublished, categoryIds fra formData) ...
        // --- Håndter vanlige felt ---
    const title = formData.get('title') as string | null;
    const rawContent = formData.get('content') as string | null; // Rå HTML fra RTE
    const isPublishedString = formData.get('isPublished') as string | null;

    if (title !== null) updatePayload.title = title;
    // Merk: content valideres etter sanering
    if (isPublishedString !== null) updatePayload.isPublished = isPublishedString === 'true';

    // --- Håndter kategorier ---
    const categoryIds = formData.getAll('categoryIds') as string[]; // Kan være tom array
    // Sjekk om feltet er sendt med, selv om det er tomt
    if (formData.has('categoryIds')) {
        updatePayload.categoryIds = categoryIds;
    }


    // ... (bildehåndtering uendret) ...
     // --- Håndter Bilde ---
    const imageFile = formData.get('image') as File | null;
    const removeImageFlag = formData.get('removeImage') === 'true';
    let newImageUrl: string | null | undefined = undefined; // undefined = ingen endring

    if (imageFile) {
      // (Samme bildeopplastingslogikk som før, inkl. sletting av gammelt bilde)
        console.log("Nytt bilde mottatt, forsøker opplasting...");
        await deleteOldCloudinaryImage(currentArticleData.imageUrl);
        try {
            if (imageFile.size > 10 * 1024 * 1024) throw new Error("Filen er for stor (maks 10MB).");
            const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
            if (!validTypes.includes(imageFile.type)) throw new Error("Ugyldig filtype (kun JPG, PNG, WEBP, GIF).");

            const buffer = await imageFile.arrayBuffer();
            const result = await new Promise<UploadApiResponse>((resolve, reject) => {
              cloudinary.uploader.upload_stream({ folder: "discgolf/news", upload_preset: "discgolf_uploads" },
                (error, result) => {
                  if (error) reject(error);
                  else if (!result?.secure_url) reject(new Error("Mangler secure_url"));
                  else resolve(result);
                }
              ).end(Buffer.from(buffer));
            });
            newImageUrl = result.secure_url;
            console.log("✅ Nytt bilde lastet opp:", newImageUrl);
        } catch (uploadError) {
             console.error("Feil under opplasting av nytt bilde:", uploadError);
            const errorMessage = uploadError instanceof Error ? uploadError.message : "Ukjent feil under bildeopplasting";
            // Returner feil knyttet til bildeopplasting direkte
            return NextResponse.json({ errors: { image: [errorMessage] } }, { status: 400 });
        }
    } else if (removeImageFlag) {
      console.log("Fjerner eksisterende bilde...");
      await deleteOldCloudinaryImage(currentArticleData.imageUrl);
      newImageUrl = null; // Sett til null for databaseoppdatering
    }
    // Legg til imageUrl KUN hvis det ble endret
    if (newImageUrl !== undefined) {
      prismaUpdateData.imageUrl = newImageUrl;
    }


    // ... (sanering, validering, bygging av prismaUpdateData) ...
        // --- Saner og Valider Content ---
    let sanitizedContent: string | undefined = undefined;
    if (rawContent !== null) {
        // --- VIKTIG: Saner HTML før validering og lagring ---
        sanitizedContent = DOMPurify.sanitize(rawContent);
        updatePayload.content = sanitizedContent; // Legg sanert innhold til for Zod-validering
    }

    // --- Valider alle innsamlede data med Zod ---
    const validation = UpdateNewsDataSchema.safeParse(updatePayload);
    if (!validation.success) {
      console.error("Valideringsfeil (PUT):", validation.error.flatten().fieldErrors);
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = validation.data;

    // --- Bygg Prisma Update Objekt ---
    if (validatedData.title !== undefined) prismaUpdateData.title = validatedData.title;
    if (validatedData.content !== undefined) {
        prismaUpdateData.content = validatedData.content;
        // --- Generer og legg til utdrag basert på sanert innhold ---
        prismaUpdateData.excerpt = generateExcerptFromHtml(validatedData.content);
    }
    if (validatedData.isPublished !== undefined) {
      prismaUpdateData.isPublished = validatedData.isPublished;
      // Oppdater publishedAt logikk
      if (validatedData.isPublished && !currentArticleData.isPublished) {
        prismaUpdateData.publishedAt = new Date();
      } else if (!validatedData.isPublished) {
        prismaUpdateData.publishedAt = null; // Sett til null ved avpublisering
      }
    }
     // Sjekk om categoryIds faktisk ble sendt med (kan være en tom array)
    if (validatedData.categoryIds !== undefined) {
      prismaUpdateData.categories = {
        set: validatedData.categoryIds.map(id => ({ id: id }))
      };
    }


    // ... (sjekk for tom updateData, utfør update, returner respons) ...
    if (Object.keys(prismaUpdateData).length === 0) {
      console.log("Ingen endringer funnet å oppdatere for artikkel:", newsId);
      // Returner den eksisterende artikkelen (med kategorier)
      const unchangedArticle = await prisma.newsArticle.findUnique({
           where: { id: newsId },
           include: {
               author: { select: { name: true, image: true } },
               categories: { select: { name: true, slug: true } }
           }
       });
       // Viktig: Returner 200 OK selv om ingenting ble endret, men med den uendrede dataen.
       // Frontend forventer data tilbake fra PUT.
       return NextResponse.json(unchangedArticle);
    }

    // --- Utfør Databaseoppdatering ---
    const updatedArticle = await prisma.newsArticle.update({
      where: { id: newsId },
      data: prismaUpdateData,
      // Inkluder oppdaterte relasjoner i responsen
      include: {
        author: { select: { name: true, image: true } },
        categories: { select: { name: true, slug: true } }
      }
    });

    console.log("📰 Nyhetsartikkel oppdatert:", updatedArticle.id);
    return NextResponse.json(updatedArticle);


  } catch (error: any) {
    console.error('[NEWS_PUT_ERROR]', error);
    if (error instanceof z.ZodError) {
       return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// --- OPPDATERT DELETE Handler ---
// Bruker RouteContext for det andre argumentet
export async function DELETE(request: NextRequest, context: RouteContext) {
  const prisma = new PrismaClient();
  try {
    // --- NY: Await params ---
    const { newsId } = await context.params;

    if (!newsId) {
      return NextResponse.json({ error: 'News ID missing' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Resten av DELETE-logikken er den samme, bruker 'newsId' som hentet over
    const articleToDelete = await prisma.newsArticle.findUnique({
      where: { id: newsId },
      select: { imageUrl: true }
    });

    if (articleToDelete) {
      await deleteOldCloudinaryImage(articleToDelete.imageUrl);
    } else {
      console.warn(`Artikkel med ID ${newsId} ikke funnet for sletting (kanskje allerede slettet?).`);
    }

    await prisma.newsArticle.delete({
      where: { id: newsId }
    }).catch(e => {
      if (e.code !== 'P2025') throw e;
      console.warn(`Prisma ignorerer sletting av ikke-eksisterende artikkel ID: ${newsId}`);
    });

    console.log("🗑️ Nyhetsartikkel slettet (eller fantes ikke):", newsId);
    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    console.error('[NEWS_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}