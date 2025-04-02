// FILE: app/api/news/featured/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

// Definer hvor mange fremhevede artikler som skal hentes
const FEATURED_COUNT = 3;

// --- GET Handler for Featured News ---
export async function GET(request: Request) {
  const prisma = new PrismaClient();

  console.log(`[API /api/news/featured] Initiating fetch for ${FEATURED_COUNT} featured articles`);

  try {
    const featuredArticles = await prisma.newsArticle.findMany({
      where: {
        isPublished: true,
      },
      // --- ✨ KORREKSJON HER ✨ ---
      orderBy: [
        // Sorter primært på publishedAt (nyeste først).
        // Behandle null-verdier som "eldst" når vi sorterer synkende.
        { publishedAt: { sort: 'desc', nulls: 'last' } },
        // Hvis publishedAt er lik (eller null), sorter sekundært på createdAt (nyeste først).
        { createdAt: 'desc' },
      ],
      // -----------------------------
      take: FEATURED_COUNT,
      include: {
        author: {
          select: { name: true, image: true },
        },
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    console.log(`[API /api/news/featured] Found ${featuredArticles.length} featured articles`);
    return NextResponse.json({ articles: featuredArticles });

  } catch (error) {
    console.error("[API /api/news/featured] Error fetching featured articles:", error);
    // Inkluder gjerne feilmeldingen for bedre debugging (men ikke i produksjon)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Could not fetch featured news articles: ${errorMessage}` }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log("[API /api/news/featured] Prisma client disconnected");
  }
}