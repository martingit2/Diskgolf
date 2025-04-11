// Fil: src/components/news/featured-news.tsx
// Formål: Komponent som viser en seksjon med fremhevede nyheter, vanligvis én hovedartikkel og to sekundære, i et responsivt grid-layout ved hjelp av FeaturedNewsCard.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import React from 'react';
import { motion } from 'framer-motion';
import { FeaturedNewsCard, NewsArticleWithDetails } from './featured-news-card'; // Importer det oppdaterte kortet
import { cn } from '@/app/lib/utils'; // Importer cn

interface FeaturedNewsProps {
  articles: NewsArticleWithDetails[];
  title?: string; // Valgfri tittel for seksjonen
  className?: string;
}

// Animasjonsvarianter (kan gjenbrukes fra NewsPage eller defineres her)
const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

export function FeaturedNews({ articles, title, className }: FeaturedNewsProps) {
  // Trenger minst én artikkel for å vise noe
  if (!articles || articles.length === 0) {
    return null;
  }

  // Del opp artiklene
  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3); // Tar KUN de to neste

  return (
    <motion.section
      aria-label={title || "Fremhevede nyheter"} // Bruk aria-label hvis tittel ikke vises
      className={cn("mb-16 md:mb-24", className)} // Legg til mulighet for ekstern className
      variants={containerStagger}
      initial="hidden"
      animate="visible"
    >
      {/* Valgfri Tittel (hvis ønskelig) */}
      {title && (
         <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 md:mb-12 md:text-4xl">
             {title}
         </h2>
      )}

      {/* Hoved Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">

        {/* Hovedartikkel - Tar 2 kolonner */}
        <motion.div className="lg:col-span-2" variants={itemFadeUp}>
          {/* Pass priority={true} og isMainArticle={true} */}
          <FeaturedNewsCard
             article={mainArticle}
             priority={true}
             isMainArticle={true}
           />
        </motion.div>

        {/* Sekundære Artikler - Tar 1 kolonne, legger seg under hverandre */}
        {secondaryArticles.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-8">
            {secondaryArticles.map((article) => (
              <motion.div key={article.id} variants={itemFadeUp}>
                {/* priority={false}, isMainArticle={false} (default) */}
                <FeaturedNewsCard article={article} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}