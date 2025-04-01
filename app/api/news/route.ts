// app/api/news/route.ts
import { NextResponse, NextRequest } from 'next/server';
// --- BRUK GENERISK PRISMA TYPE ---
import { Prisma, PrismaClient, UserRole } from '@prisma/client';
// --- SLUTT BRUK GENERISK PRISMA TYPE ---
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; // Juster stien om nødvendig
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';
import { z } from 'zod';
import cloudinary from '@/app/lib/cloudinary'; // Juster stien om nødvendig
import type { UploadApiResponse } from 'cloudinary';

// --- GET Handler ---
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

    const skip = (page - 1) * limit;

    // Bygg WHERE-klausul dynamisk
    // Bruker den generiske Prisma-typen som fallback
    const andConditions: Prisma.NewsArticleWhereInput[] = [];

    if (!isAdmin) {
      andConditions.push({ isPublished: true });
    }

    if (searchQuery) {
      andConditions.push({
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { content: { contains: searchQuery, mode: 'insensitive' } },
        ],
      });
    }

    if (categorySlug) {
      andConditions.push({
        categories: { some: { slug: categorySlug } },
      });
    }

    // Bygg den endelige where-klausulen
    // Bruker den generiske Prisma-typen som fallback
    const finalWhere: Prisma.NewsArticleWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const totalArticles = await prisma.newsArticle.count({ where: finalWhere });
    const newsArticles = await prisma.newsArticle.findMany({
      where: finalWhere,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        imageUrl: true,
        isPublished: true,
        createdAt: true,
        publishedAt: true,
        author: { select: { name: true, image: true } },
        categories: {
            select: {
                id: true,
                name: true,
                slug: true
            }
        },
      },
    });

    console.log(`[NEWS_GET_LIST] Found ${newsArticles.length} articles for page ${page}. Total: ${totalArticles}. HasMore: ${skip + newsArticles.length < totalArticles}`);

    const hasMore = skip + newsArticles.length < totalArticles;

    return NextResponse.json({
      articles: newsArticles,
      currentPage: page,
      hasMore: hasMore,
    });

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
        if (text.length <= maxLength) {
            return text;
        }
        const truncated = text.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated).trim() + '...';
    } catch (e) {
        console.error("Feil under generering av utdrag:", e);
        const plainText = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return plainText.length > maxLength ? plainText.substring(0, maxLength).trim() + '...' : plainText;
    }
}

// --- POST Handler (uendret fra forrige korrekte versjon) ---
const CreateNewsDataSchema = z.object({
  title: z.string().min(3, { message: 'Tittel må ha minst 3 tegn' }).max(150, { message: 'Tittel kan maks ha 150 tegn' }),
  content: z.string().min(10, { message: 'Innholdet virker for kort.' }),
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

    const sanitizedContent = rawContent ? DOMPurify.sanitize(rawContent) : '';

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
        content: validatedContent,
        isPublished: validatedIsPublished,
        categoryIds: validatedCategoryIds
    } = validation.data;

    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
        if (imageFile.size > 10 * 1024 * 1024) {
            return NextResponse.json({ errors: { image: ["Filen er for stor (maks 10MB)."] } }, { status: 400 });
        }
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(imageFile.type)) {
            return NextResponse.json({ errors: { image: ["Ugyldig filtype (kun JPG, PNG, WEBP, GIF)."] } }, { status: 400 });
        }

        try {
            const buffer = await imageFile.arrayBuffer();
            const result: UploadApiResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "discgolf/news", upload_preset: "discgolf_uploads", resource_type: "image" },
                    (error, result) => {
                        if (error) return reject(new Error(`Cloudinary feil: ${error.message}`));
                        if (!result?.secure_url) return reject(new Error("Mangler secure_url i Cloudinary-svar"));
                        resolve(result);
                    }
                );
                uploadStream.end(Buffer.from(buffer));
            });
            imageUrl = result.secure_url;
        } catch (uploadError) {
            console.error("Feil under bildeopplasting:", uploadError);
            const errorMessage = uploadError instanceof Error ? uploadError.message : "Ukjent feil under bildeopplasting";
            return NextResponse.json({ errors: { image: [errorMessage] } }, { status: 500 });
        }
    }

    const generatedExcerpt = generateExcerptFromHtml(validatedContent);

    try {
        const newArticle = await prisma.newsArticle.create({
          data: {
            title: validatedTitle,
            content: validatedContent,
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
              id: true, title: true, content: true, excerpt: true, imageUrl: true,
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
                 return NextResponse.json({ errors: { categoryIds: ['En eller flere valgte kategorier finnes ikke.'] } }, { status: 400 });
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