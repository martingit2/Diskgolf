// Fil: src/app/api/news/[newsId]/route.ts
// Formål: API-endepunkt for å håndtere spesifikke nyhetsartikler (basert på ID).
//         GET: Henter en enkelt nyhetsartikkel, med autorisasjonssjekk for upubliserte artikler.
//         PUT: Oppdaterer en eksisterende nyhetsartikkel (tittel, innhold, publiseringsstatus, kategorier, bilde), krever ADMIN-rettigheter. Inkluderer HTML-sanering, utdraggenerering og Cloudinary bildehåndtering (opplasting/sletting).
//         DELETE: Sletter en nyhetsartikkel, inkludert tilhørende bilde fra Cloudinary, krever ADMIN-rettigheter.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient, Prisma, UserRole } from '@prisma/client'; // Import Prisma namespace for error types
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import cloudinary from '@/app/lib/cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import ISODOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom'; // Keep for excerpt generation

// Use isomorphic-dompurify. Add JSDOM window if running in Node environment where 'window' isn't global.
// Try without JSDOM first, if you get errors about 'window' or 'document' not found during sanitize, uncomment the JSDOM lines.
// const dompurifyWindow = new JSDOM('').window;
// const DOMPurify = ISODOMPurify(dompurifyWindow);
const DOMPurify = ISODOMPurify; // Use this if JSDOM is NOT needed for DOMPurify

const prisma = new PrismaClient();

// --- Configuration for allowed HTML (essential) ---
const ALLOWED_TAGS = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i',
    'ul', 'ol', 'li', 'a', 'hr', 'br', 'blockquote', 'code', 'pre',
    // Add 'img', 'figure', 'figcaption' etc. if your editor uses them and you want to allow them
];
const ALLOWED_ATTR = [
    'href', 'target', 'rel', // for <a>
    'start', // for <ol>
    // Add 'src', 'alt', 'title', 'width', 'height' etc. if <img> is allowed
    // 'class' // Be cautious if allowing 'class'
];
// --- End Configuration ---

// --- Zod Schema ---
const UpdateNewsDataSchema = z.object({
  title: z.string().min(3, { message: "Tittel må ha minst 3 tegn." }).max(150, { message: "Tittel kan maks ha 150 tegn." }).optional(),
  content: z.string().min(10, { message: 'Innholdet virker for kort (etter sanering).' }).optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string().uuid({ message: "Ugyldig kategori ID format." })).optional(),
});

// --- *** HELPER FUNCTION DEFINITIONS START *** ---

// Hjelpefunksjon: Generer Utdrag
function generateExcerptFromHtml(html: string, maxLength = 150): string {
     if (!html) return '';
    try {
        // Use JSDOM imported specifically for this function
        const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
        const { window } = dom;
        const { document } = window;

        // Remove elements you don't want text from in the excerpt
        document.querySelectorAll('img, iframe, script, style, noscript, figure, blockquote, h1, h2, h3, h4, h5, h6').forEach(el => el.remove());

        let text = document.body.textContent || '';
        text = text.replace(/\s+/g, ' ').trim();

        if (text.length <= maxLength) {
            return text;
        }
        const truncated = text.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated).trim() + '...';
    } catch (e) {
        console.error("Feil under generering av utdrag:", e);
        // Fallback: simple text stripping
        const plainText = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return plainText.length > maxLength ? plainText.substring(0, maxLength).trim() + '...' : plainText;
    }
}

// Hjelpefunksjon: Slett Cloudinary Bilde
async function deleteOldCloudinaryImage(imageUrl: string | null): Promise<void> {
     if (!imageUrl) return;

    try {
        // Extract public_id from Cloudinary URL
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        // Need at least 'upload', version/transform, public_id parts
        if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
            console.warn("Could not parse public_id from Cloudinary URL (irregular format?):", imageUrl);
            return;
        }
        // Assume public_id might contain folders, take everything after version/transformations
        const publicIdWithFormat = urlParts.slice(uploadIndex + 2).join('/');
        // Remove file extension (.jpg, .png etc.)
        const public_id = publicIdWithFormat.substring(0, publicIdWithFormat.lastIndexOf('.')) || publicIdWithFormat;

        if (!public_id) {
             console.warn("Could not extract public_id for deletion:", imageUrl);
             return;
        }

        console.log(`Attempting to delete old image from Cloudinary with public_id: ${public_id}`);
        // Specify resource_type if it's not the default (image)
        const result = await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
        console.log("Cloudinary deletion result:", result);
        // 'ok' indicates success, 'not found' is also acceptable
        if (result.result !== 'ok' && result.result !== 'not found') {
            console.warn("Cloudinary deletion failed:", result);
        }

    } catch (error) {
        console.error("Error deleting old Cloudinary image:", error);
        // Don't throw error here, DB update is more critical
    }
}

// --- *** HELPER FUNCTION DEFINITIONS END *** ---

// --- Define the expected type for the params object AFTER it's resolved ---
// This is useful for internal consistency if needed, but the main change is in the function signature.
// type NewsParams = { newsId: string };

// --- GET Handler ---
// Updated signature: uses inline type with Promise for params
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ newsId: string }> } // Corrected type
) {
  const prisma = new PrismaClient();
  let newsId: string | undefined; // Define newsId here for use in catch/finally

  try {
    // Await the params promise to get the actual values
    const resolvedParams = await params;
    newsId = resolvedParams.newsId; // Assign to the outer scope variable

    if (!newsId) {
      // This check might be less likely now due to awaiting, but good practice
      return NextResponse.json({ error: 'News ID missing' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const currentUser = session?.user;
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    const article = await prisma.newsArticle.findUnique({
      where: { id: newsId },
      select: { // Select necessary fields consistent with frontend needs
        id: true,
        title: true,
        content: true,
        excerpt: true,
        imageUrl: true,
        isPublished: true,
        createdAt: true,
        publishedAt: true,
        author: { select: { name: true, image: true } },
        categories: { select: { id: true, name: true, slug: true } } // Include category ID for editing
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'Artikkel ikke funnet' }, { status: 404 });
    }

    // Check authorization: Non-admins cannot see unpublished articles
    if (!isAdmin && !article.isPublished) {
        console.log(`[NEWS_GET_ID] Access denied for user ${currentUser?.id || 'guest'} to unpublished article ${newsId}`);
        return NextResponse.json({ error: 'Artikkel ikke funnet eller ingen tilgang' }, { status: 404 });
    }

    return NextResponse.json(article);

  } catch (error: any) {
    // Log the error with context if possible (newsId might be available here)
    console.error('[NEWS_GET_ID_ERROR]', newsId ?? 'ID_UNKNOWN', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


// --- PUT Handler ---
// Updated signature: uses inline type with Promise for params
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ newsId: string }> } // Corrected type
) {
  const prisma = new PrismaClient();
  let newsId: string | undefined;

  try {
    // Await the params promise
    const resolvedParams = await params;
    newsId = resolvedParams.newsId;

    if (!newsId) {
      return NextResponse.json({ error: 'News ID missing' }, { status: 400 });
    }

    // Authorization Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch current data to compare and get existing image URL
    const currentArticleData = await prisma.newsArticle.findUnique({
      where: { id: newsId },
      select: { imageUrl: true, isPublished: true } // Select only needed fields
    });

    if (!currentArticleData) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const updatePayload: Record<string, unknown> = {}; // Collect data for Zod validation
    const prismaUpdateData: Record<string, any> = {}; // Collect data for Prisma update

    // Handle standard text/boolean fields
    const title = formData.get('title') as string | null;
    const rawContent = formData.get('content') as string | null;
    const isPublishedString = formData.get('isPublished') as string | null;

    if (title !== null) updatePayload.title = title;
    if (isPublishedString !== null) updatePayload.isPublished = isPublishedString === 'true';

    // --- Sanitize Content ---
    let sanitizedContent: string | undefined = undefined;
    if (rawContent !== null) {
        // Ensure DOMPurify is configured and used correctly
        sanitizedContent = DOMPurify.sanitize(rawContent, { ALLOWED_TAGS, ALLOWED_ATTR });
        updatePayload.content = sanitizedContent; // Use sanitized content for validation
    }

    // Handle categories (many-to-many relation)
    if (formData.has('categoryIds')) {
        // getAll returns string[], even if empty
        updatePayload.categoryIds = formData.getAll('categoryIds') as string[];
    }

    // --- Handle Image Upload/Removal ---
    const imageFile = formData.get('image') as File | null;
    const removeImageFlag = formData.get('removeImage') === 'true';
    let newImageUrl: string | null | undefined = undefined; // undefined means no change requested

    if (imageFile) {
        console.log("New image received, attempting upload...");
        // Delete old image BEFORE uploading new one
        await deleteOldCloudinaryImage(currentArticleData.imageUrl);
        try {
            // Validate file size and type
            if (imageFile.size > 10 * 1024 * 1024) throw new Error("Filen er for stor (maks 10MB).");
            const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
            if (!validTypes.includes(imageFile.type)) throw new Error("Ugyldig filtype (kun JPG, PNG, WEBP, GIF).");

            // Upload to Cloudinary
            const buffer = await imageFile.arrayBuffer();
            const result = await new Promise<UploadApiResponse>((resolve, reject) => {
              cloudinary.uploader.upload_stream({ folder: "discgolf/news", upload_preset: "discgolf_uploads", resource_type: "image" },
                (error, result) => {
                  if (error) reject(error);
                  else if (!result?.secure_url) reject(new Error("Mangler secure_url"));
                  else resolve(result);
                }
              ).end(Buffer.from(buffer));
            });
            newImageUrl = result.secure_url; // Set new URL
            console.log("✅ New image uploaded:", newImageUrl);
        } catch (uploadError) {
             console.error("Error uploading new image:", uploadError);
            const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown image upload error";
            // Return specific image error
            return NextResponse.json({ errors: { image: [errorMessage] } }, { status: 400 });
        }
    } else if (removeImageFlag && currentArticleData.imageUrl) {
      // Only remove if flag is set AND an image actually exists
      console.log("Removing existing image...");
      await deleteOldCloudinaryImage(currentArticleData.imageUrl);
      newImageUrl = null; // Set URL to null in DB
    }

    // Only add imageUrl to prisma data if it changed (new upload or removal)
    if (newImageUrl !== undefined) {
      prismaUpdateData.imageUrl = newImageUrl;
    }
    // --- End Image Logic ---

    // --- Validate all collected data with Zod ---
    const validation = UpdateNewsDataSchema.safeParse(updatePayload);
    if (!validation.success) {
      console.error("Validation Error (PUT):", validation.error.flatten().fieldErrors);
       // Provide specific feedback if content is the issue after sanitization
       if (validation.error.flatten().fieldErrors.content) {
            return NextResponse.json({ errors: { content: ["Innholdet er for kort eller inneholder for mye ugyldig HTML som ble fjernet."] } }, { status: 400 });
       }
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = validation.data;

    // --- Build Prisma Update Data Object from validated data ---
    if (validatedData.title !== undefined) prismaUpdateData.title = validatedData.title;

    // Use sanitized content if provided
    if (validatedData.content !== undefined) {
        prismaUpdateData.content = validatedData.content;
        // Generate excerpt from the (already sanitized) content
        prismaUpdateData.excerpt = generateExcerptFromHtml(validatedData.content);
    }

    // Handle publishing status and date
    if (validatedData.isPublished !== undefined) {
      prismaUpdateData.isPublished = validatedData.isPublished;
      // Set publishedAt only when changing from unpublished to published
      if (validatedData.isPublished && !currentArticleData.isPublished) {
        prismaUpdateData.publishedAt = new Date();
      } else if (validatedData.isPublished === false) {
        // Set to null if unpublishing
        prismaUpdateData.publishedAt = null;
      }
      // If isPublished remains true, publishedAt is unchanged
    }

    // Handle category updates using 'set' for many-to-many
     if (validatedData.categoryIds !== undefined) {
       prismaUpdateData.categories = {
         set: validatedData.categoryIds.map(id => ({ id: id }))
       };
     }

    // --- Check if there are actual changes to save ---
    if (Object.keys(prismaUpdateData).length === 0) {
      console.log("No actual changes detected to update for article:", newsId);
       // Return the current data if no changes were made
       const unchangedArticle = await prisma.newsArticle.findUnique({
           where: { id: newsId },
           select: { // Ensure response structure is consistent
               id: true, title: true, content: true, excerpt: true, imageUrl: true,
               isPublished: true, createdAt: true, publishedAt: true,
               author: { select: { name: true, image: true } },
               categories: { select: { id: true, name: true, slug: true } },
           }
       });
       // Should still return 200 OK with the existing data
       return NextResponse.json(unchangedArticle);
    }

    // --- Perform Database Update ---
     try {
        const updatedArticle = await prisma.newsArticle.update({
          where: { id: newsId },
          data: prismaUpdateData,
          select: { // Return the updated data with consistent structure
              id: true, title: true, content: true, excerpt: true, imageUrl: true,
              isPublished: true, createdAt: true, publishedAt: true,
              author: { select: { name: true, image: true } },
              categories: { select: { id: true, name: true, slug: true } },
          }
        });

        console.log("📰 News article updated:", updatedArticle.id);
        return NextResponse.json(updatedArticle); // Return 200 OK with updated data

     } catch(dbError) {
         console.error('[NEWS_PUT_DB_ERROR]', dbError);
         // Handle specific Prisma errors like foreign key constraint violations
         if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
             // Check for error related to category linking (P2025: Record not found)
             if (dbError.code === 'P2025' && dbError.meta?.cause && typeof dbError.meta.cause === 'string' && dbError.meta.cause.includes('categories')) {
                  // Provide specific error message for categories
                  return NextResponse.json({ errors: { categoryIds: ['En eller flere valgte kategorier finnes ikke lenger.'] } }, { status: 400 });
             }
         }
         // Generic database error fallback
         return NextResponse.json({ error: 'Database error while updating article.' }, { status: 500 });
     }

  } catch (error: any) {
    // Catch unexpected errors
    console.error('[NEWS_PUT_ERROR]', newsId ?? 'ID_UNKNOWN', error);
    return NextResponse.json({ error: 'Internal Server Error during update.' }, { status: 500 });
  } finally {
    // Ensure prisma client disconnects
    await prisma.$disconnect();
  }
}


// --- DELETE Handler ---
// Updated signature: uses inline type with Promise for params
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ newsId: string }> } // Corrected type
) {
  const prisma = new PrismaClient();
  let newsId: string | undefined;

  try {
    // Await the params promise
    const resolvedParams = await params;
    newsId = resolvedParams.newsId;

    if (!newsId) {
      return NextResponse.json({ error: 'News ID missing' }, { status: 400 });
    }

    // Authorization Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find article to get image URL before deleting database record
    const articleToDelete = await prisma.newsArticle.findUnique({
      where: { id: newsId },
      select: { imageUrl: true } // Only need the image URL
    });

    // Attempt to delete Cloudinary image *before* deleting DB record
    // It's okay if the image doesn't exist on Cloudinary anymore
    if (articleToDelete?.imageUrl) {
      await deleteOldCloudinaryImage(articleToDelete.imageUrl);
    }

    // Delete the article from the database
    try {
       await prisma.newsArticle.delete({
         where: { id: newsId }
       });
       console.log("🗑️ News article deleted from database:", newsId);
    } catch (e: any) {
       // Handle the case where the article was already deleted (Prisma's P2025 error)
       if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          console.warn(`Article with ID ${newsId} not found for deletion in DB (maybe already deleted?).`);
          // Still return success (204) as the desired state (deleted) is achieved
       } else {
          // Re-throw other unexpected database errors
          throw e;
       }
    }

    // Return 204 No Content on successful deletion (or if already deleted)
    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
     // Log unexpected errors
    console.error('[NEWS_DELETE_ERROR]', newsId ?? 'ID_UNKNOWN', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    // Ensure prisma client disconnects
    await prisma.$disconnect();
  }
}