// Fil: app/(undersider)/_components/featured-news.tsx

import React from 'react';
// Importer KORTET og typen fra den andre filen
import { FeaturedNewsCard, NewsArticleWithDetails } from './featured-news-card';

interface FeaturedNewsProps {
  articles: NewsArticleWithDetails[]; // Tar imot en liste/array
  title?: string; // Valgfri tittel for seksjonen
}

// Sørg for at denne funksjonen eksporteres!
export function FeaturedNews({ articles, title = "Fremhevede Nyheter" }: FeaturedNewsProps) {
  // Ikke render noe hvis det ikke er noen fremhevede artikler
  if (!articles || articles.length === 0) {
    return null;
  }

  // Ta den første artikkelen som hovedartikkel
  const mainArticle = articles[0];
  // Ta de neste to som sekundære (hvis de finnes)
  const secondaryArticles = articles.slice(1, 3);

  return (
    <section aria-labelledby="featured-news-title">
      <h2 id="featured-news-title" className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:mb-8 md:text-3xl">
        {title}
      </h2>

      {/* Layout: Grid med 1 kolonne på små skjermer, 3 kolonner på store */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">

        {/* Hovedartikkel (tar opp 2 av 3 kolonner på store skjermer) */}
        <div className="lg:col-span-2">
          {/* Bruker FeaturedNewsCard for hovedartikkelen */}
          <FeaturedNewsCard article={mainArticle} priority={true} />
        </div>

        {/* Sekundære artikler */}
        {secondaryArticles.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-8">
            {secondaryArticles.map((article) => (
              // Bruker FeaturedNewsCard for hver sekundærartikkel
              <FeaturedNewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}