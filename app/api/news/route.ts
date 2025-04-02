// app/api/news/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; // Juster stien om nødvendig
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';
import { z } from 'zod';
import cloudinary from '@/app/lib/cloudinary'; // Juster stien om nødvendig
import type { UploadApiResponse } from 'cloudinary';

// Konfigurer DOMPurify (som før)
const Purifier = DOMPurify;


// --- GET Handler (Uendret fra forrige korrekte versjon) ---
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;
    const isAdmin = currentUser?.role === UserRole.ADMIN;
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const searchQuery = searchParams.get('search');
    const categorySlug = searchParams.get('categorySlug');
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;
    const andConditions: Prisma.NewsArticleWhereInput[] = [];
    if (!isAdmin) { andConditions.push({ isPublished: true }); }
    if (searchQuery) { andConditions.push({ OR: [ { title: { contains: searchQuery, mode: 'insensitive' } }, { content: { contains: searchQuery, mode: 'insensitive' } }, { excerpt: { contains: searchQuery, mode: 'insensitive' } }, ], }); }
    if (categorySlug) { andConditions.push({ categories: { some: { slug: categorySlug } } }); }
    const finalWhere: Prisma.NewsArticleWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};
    const [totalArticles, newsArticles] = await prisma.$transaction([
        prisma.newsArticle.count({ where: finalWhere }),
        prisma.newsArticle.findMany({ where: finalWhere, orderBy: [ { publishedAt: 'desc' }, { createdAt: 'desc' } ], skip: skip, take: safeLimit, select: { id: true, title: true, excerpt: true, imageUrl: true, isPublished: true, createdAt: true, publishedAt: true, author: { select: { name: true, image: true } }, categories: { select: { id: true, name: true, slug: true } }, }, })
    ]);
    const hasMore = skip + newsArticles.length < totalArticles;
    console.log(`[NEWS_GET_LIST] Page ${safePage}, Limit ${safeLimit}. Found ${newsArticles.length} articles. Total matching: ${totalArticles}. HasMore: ${hasMore}.`);
    return NextResponse.json({ articles: newsArticles, currentPage: safePage, hasMore: hasMore, totalArticles: totalArticles, limit: safeLimit, });
  } catch (error) {
    console.error('[NEWS_GET_LIST_ERROR]', error);
    return NextResponse.json({ error: 'Kunne ikke hente nyheter.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// --- Hjelpefunksjon: Generer Utdrag (uendret) ---
function generateExcerptFromHtml(html: string, maxLength = 150): string {
     if (!html) return '';
    try {
        const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
        const { window } = dom;
        const { document } = window;
        document.querySelectorAll('img, iframe, script, style, noscript, figure, blockquote, h1, h2, h3, h4, h5, h6').forEach(el => el.remove());
        let text = document.body.textContent || '';
        text = text.replace(/\s+/g, ' ').trim();
        if (text.length <= maxLength) return text;
        const truncated = text.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated).trim() + '...';
    } catch (e) {
        console.error("Feil under generering av utdrag:", e);
        const plainText = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return plainText.length > maxLength ? plainText.substring(0, maxLength).trim() + '...' : plainText;
    }
}

// --- POST Handler (Opprett nyhet) (med korreksjoner) ---
const CreateNewsDataSchema = z.object({
  title: z.string().min(3, { message: 'Tittel må ha minst 3 tegn' }).max(150, { message: 'Tittel kan maks ha 150 tegn' }),
  content: z.string().optional().refine(val => !val || val.length >= 10, { message: 'Innholdet virker for kort (minst 10 tegn hvis satt).' }),
  isPublished: z.boolean(),
  categoryIds: z.array(z.string().uuid({ message: "Ugyldig kategori ID format." })).optional().default([]),
});

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;
    if (!currentUser?.id || currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Handling forbudt.' }, { status: 403 });
    }
    const formData = await request.formData();
    const title = formData.get('title') as string | null;
    const rawContent = formData.get('content') as string | null;
    const isPublishedString = formData.get('isPublished') as string | null;
    const imageFile = formData.get('image') as File | null;
    const categoryIds = formData.getAll('categoryIds') as string[];
    const sanitizedContent = rawContent ? Purifier.sanitize(rawContent) : '';
    const validationInput = {
      title: title ?? '',
      content: sanitizedContent,
      isPublished: isPublishedString === 'true',
      categoryIds: categoryIds.filter(id => typeof id === 'string' && id.length > 0),
    };
    const validation = CreateNewsDataSchema.safeParse(validationInput);
    if (!validation.success) {
      console.error("Valideringsfeil (POST):", validation.error.flatten().fieldErrors);
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const {
        title: validatedTitle,
        content: validatedContent, // Kan være string eller undefined
        isPublished: validatedIsPublished,
        categoryIds: validatedCategoryIds
    } = validation.data;

    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
        if (imageFile.size > 10 * 1024 * 1024) return NextResponse.json({ errors: { image: ["Filen er for stor (maks 10MB)."] } }, { status: 400 });
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(imageFile.type)) return NextResponse.json({ errors: { image: ["Ugyldig filtype (kun JPG, PNG, WEBP, GIF)."] } }, { status: 400 });
        try {
            const buffer = await imageFile.arrayBuffer();
            const result: UploadApiResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "discgolf/news", upload_preset: "discgolf_uploads", resource_type: "image" }, (error, result) => { if (error) return reject(new Error(`Cloudinary feil: ${error.message}`)); if (!result?.secure_url) return reject(new Error("Mangler secure_url i Cloudinary-svar")); resolve(result); });
                uploadStream.end(Buffer.from(buffer));
            });
            imageUrl = result.secure_url;
        } catch (uploadError) {
            console.error("Feil under bildeopplasting:", uploadError);
            const errorMessage = uploadError instanceof Error ? uploadError.message : "Ukjent feil under bildeopplasting";
            return NextResponse.json({ errors: { image: [errorMessage] } }, { status: 500 });
        }
    }
    const generatedExcerpt = generateExcerptFromHtml(validatedContent ?? ''); // Gi tom streng hvis undefined

    try {
        const newArticle = await prisma.newsArticle.create({
          data: {
            title: validatedTitle,
            // --- ✨ Korreksjon for Feil 2 ✨ ---
            content: validatedContent ?? '', // Send tom streng hvis validatedContent er undefined
            excerpt: generatedExcerpt,
            imageUrl: imageUrl,
            isPublished: validatedIsPublished,
            publishedAt: validatedIsPublished ? new Date() : null,
            authorId: currentUser.id,
            categories: {
              connect: validatedCategoryIds.map(id => ({ id: id })),
            },
          },
          select: {
              id: true, title: true, excerpt: true, imageUrl: true,
              isPublished: true, createdAt: true, publishedAt: true,
              author: { select: { name: true, image: true } },
              categories: { select: { id: true, name: true, slug: true } },
          }
        });
        console.log("📰 Nyhetsartikkel opprettet:", newArticle.id);
        return NextResponse.json(newArticle, { status: 201 });
    } catch (dbError) {
        console.error('[NEWS_POST_DB_ERROR]', dbError);
        if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
            if (dbError.code === 'P2003' || dbError.code === 'P2025') {
                 // --- ✨ Korreksjon for Feil 3 ✨ ---
                 // Legg til tryggere sjekker før .includes()
                 const meta = dbError.meta as { field_name?: unknown }; // Gi meta en litt mer spesifikk (men fortsatt usikker) type
                 if (meta && typeof meta.field_name === 'string' && meta.field_name.includes('categories')) {
                    return NextResponse.json({ errors: { categoryIds: ['En eller flere valgte kategorier finnes ikke.'] } }, { status: 400 });
                 }
                 // Generell P2003/P2025 feil hvis det ikke er categories
                 return NextResponse.json({ error: 'Relatert data ble ikke funnet eller en databasebetingelse feilet.' }, { status: 400 });
            }
        }
        return NextResponse.json({ error: 'Databasefeil ved lagring av artikkel.' }, { status: 500 });
    }
  } catch (error) {
    console.error('[NEWS_POST_UNHANDLED_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error ved oppretting av artikkel.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}