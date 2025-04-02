// --- Komponenten som arrangerer de fremhevede nyhetene ---
// components/news/featured-news.tsx
import React from 'react';

import { Category, NewsArticle } from '@prisma/client';
import { FeaturedNewsCard } from './featured-news';

// Type definisjon (samme som i FeaturedNewsCard)
type NewsArticleWithDetails = NewsArticle & {
    author: { name: string | null; image: string | null } | null;
    categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};

interface FeaturedNewsProps {
  articles: NewsArticleWithDetails[];
  title?: string; // Valgfri tittel for seksjonen
}

export function FeaturedNews({ articles, title = "Fremhevede Nyheter" }: FeaturedNewsProps) {
  if (!articles || articles.length === 0) {
    return null; // Ikke render noe hvis det ikke er noen fremhevede artikler
  }

  // Ta den første artikkelen som hovedartikkel, og de neste to som sekundære (hvis de finnes)
  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3); // Tar artikkel 2 og 3

  return (
    <section aria-labelledby="featured-news-title" className="mb-12 md:mb-16 lg:mb-20">
      <h2 id="featured-news-title" className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 md:mb-8">
        {title}
      </h2>

      {/* Layout: 1 stor + 0-2 mindre ved siden av/under */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">

        {/* Hovedartikkel (tar opp mer plass på store skjermer) */}
        <div className="lg:col-span-2 mb-8 lg:mb-0">
          <FeaturedNewsCard article={mainArticle} priority={true} /> {/* Priority=true for LCP */}
        </div>

        {/* Sekundære artikler (hvis de finnes) */}
        {secondaryArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8">
            {secondaryArticles.map((article) => (
              <FeaturedNewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      {/* Alternativ: Karusell (krever ekstra bibliotek som embla-carousel-react) */}
      {/*
      <div className="overflow-hidden">
         // Implementer karusell her med f.eks. Embla Carousel
         // Hvert slide ville inneholdt en <FeaturedNewsCard article={article} />
      </div>
      */}
    </section>
  );
}