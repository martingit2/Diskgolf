// Fil: src/components/news/featured-news-card.tsx
// Formål: Komponent for å vise et fremhevet nyhetskort, typisk brukt på forsider eller lister. Håndterer bildevisning/fallback, tittel, utdrag, metadata og kategorier med fokus på visuell appell og mulighet for prioritering (LCP).
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.




import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category, NewsArticle } from '@prisma/client';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ArticleMetadata } from './news-article-metadata'; // Sjekk sti
import { cn } from '@/app/lib/utils';
import { Newspaper, ArrowRight, ImageOff } from 'lucide-react';

export type NewsArticleWithDetails = NewsArticle & {
  author: { name: string | null; image: string | null } | null;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};

interface FeaturedNewsCardProps {
  article: NewsArticleWithDetails;
  priority?: boolean; // For LCP (Largest Contentful Paint) optimalisering på hovedartikkel
  className?: string;
  variants?: any;
  isMainArticle?: boolean; // For stylingdifferensiering
}

export function FeaturedNewsCard({
  article,
  priority = false,
  className,
  variants,
  isMainArticle = false,
}: FeaturedNewsCardProps) {
  const [imageError, setImageError] = useState(false);

  // Robust null-sjekk
  if (!article?.id || !article.title) {
    console.warn("FeaturedNewsCard: Mottok ugyldig artikkel-data.", { article });
    return null; // Returner null for å unngå renderfeil
  }

  const displayDate = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);
  const authorDisplay = article.author ?? { name: 'Ukjent', image: null }; // Kortere fallback
  const linkHref = `/nyheter/${article.id}`; // Eller article.slug hvis det finnes
  const imageUrl = article.imageUrl ?? null;
  const hasImage = !!imageUrl && !imageError;

  // Forbedret fallback for excerpt, håndterer undefined/null bedre
  const createExcerptFallback = (text: string | null | undefined, maxLength = isMainArticle ? 150 : 100): string => {
    if (!text) return 'Ingen beskrivelse tilgjengelig.';
    const cleanedText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (cleanedText.length <= maxLength) return cleanedText;
    const truncated = cleanedText.substring(0, maxLength);
    // Sørg for at vi ikke kutter midt i et ord
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated) + '...';
  };
  const displayExcerpt = article.excerpt || createExcerptFallback(article.content);

  return (
    <motion.article
      variants={variants}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl", // Økt avrunding for premium følelse
        "border border-gray-200/10 dark:border-gray-800/50", // Subtil standard border
        "bg-card shadow-lg dark:shadow-xl dark:shadow-black/30", // Litt sterkere shadow
        "transition-all duration-350 ease-in-out",
        // Raffinerte hover-effekter
        "hover:shadow-2xl hover:border-gray-300/20 dark:hover:border-gray-700/70",
        "hover:-translate-y-1", // Beholder diskret løft
        className
      )}
      aria-labelledby={`featured-article-title-${article.id}`}
    >
      {/* --- Bilde/Fallback & Gradient Lag --- */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-xl"> {/* Match avrunding */}
        {hasImage ? (
          <Image
            src={imageUrl} // Skal være non-null her pga hasImage
            alt={`Bilde for artikkelen: ${article.title}`} // Mer beskrivende alt-tekst
            fill
            style={{ objectFit: 'cover' }}
            sizes={isMainArticle ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            priority={priority} // Viktig for LCP på hovedartikkel
            className={cn(
              "transition-all duration-500 ease-in-out",
              "group-hover:scale-[1.05]", // Litt mer zoom
              imageError ? "opacity-0" : "opacity-100" // Sikrer at error-state skjuler bildet
            )}
            onError={() => { console.warn(`Bildefeil for ${imageUrl}`); setImageError(true); }}
            unoptimized={process.env.NODE_ENV === 'development'} // Nyttig for lokale bilder
          />
        ) : (
          // Fallback DIV med gradient
          <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 p-4 text-center dark:from-gray-700 dark:via-gray-800 dark:to-gray-900">
            {imageError ? (
                <ImageOff className="mb-2 h-10 w-10 text-red-200/80" strokeWidth={1.5} />
            ) : (
                <Newspaper className="mb-2 h-10 w-10 text-gray-300/80 dark:text-gray-500/80" strokeWidth={1.5} />
            )}
             <span className="text-xs font-medium text-gray-100/90 dark:text-gray-400/90">
                 {imageError ? 'Kunne ikke laste bilde' : 'Bilde mangler'}
             </span>
          </div>
        )}

        {/* --- GRADIENT OVERLAY --- */}
        <div
           // Forsterket gradient for bedre lesbarhet
          className="absolute inset-x-0 bottom-0 z-10 h-3/4 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* --- Innhold Lag (over gradient) --- */}
      <div className={cn(
          "relative z-20 flex h-full flex-col justify-end",
          // Justert padding for bedre balanse
          isMainArticle ? "p-6 md:p-8 lg:p-10" : "p-5 md:p-6"
       )}>
        {/* Innholds-wrapper */}
        <div className="space-y-3 md:space-y-4"> {/* Økt space litt */}

            {/* Kategorier */}
            {article.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.categories.slice(0, isMainArticle ? 3 : 2).map(cat => ( // Vis flere på hoved
                  <Badge
                    key={cat.id}
                    variant="secondary" // Bruk en definert variant hvis mulig
                    className={cn(
                        "border border-white/20 bg-white/10 text-gray-200 backdrop-blur-sm", // Subtil glass-effekt
                        "text-[10px] font-medium tracking-wide uppercase px-2.5 py-0.5", // Justert padding/font
                        "relative z-30 transition-colors hover:bg-white/20"
                    )}
                  >
                     {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Tittel (Lenke) */}
            <Link href={linkHref} className="relative z-30 block group/title focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">
                <h3
                  id={`featured-article-title-${article.id}`}
                  className={cn(
                      "font-semibold leading-tight text-white transition-colors duration-200 group-hover/title:text-emerald-300",
                      isMainArticle ? "text-2xl md:text-3xl lg:text-4xl line-clamp-3" : "text-xl md:text-2xl line-clamp-3", // Økte størrelser
                      "[text-shadow:_0_1px_4px_rgb(0_0_0_/_60%)]" // Forsterket skygge
                   )}
                 >
                    {article.title}
                 </h3>
            </Link>

            {/* Utdrag (Vises kun på hovedartikkel for renere sekundærkort) */}
            {isMainArticle && (
              <p className={cn(
                 "text-base leading-relaxed text-gray-200/90 line-clamp-3", // Litt større font
                 "[text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]"
               )}>
                {displayExcerpt}
              </p>
            )}

            {/* Metadata & Les mer (gruppert for bedre layout) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3 pt-1">
                 <ArticleMetadata
                   author={authorDisplay}
                   date={displayDate}
                   className="text-xs text-gray-300/80"
                   variant="compact" // Sørg for at denne varianten bruker lys tekst
                 />
                 <Link
                     href={linkHref}
                     className={cn(
                         "inline-flex items-center text-sm font-semibold relative z-30 group/link",
                         "text-emerald-400 transition-colors hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black/70 rounded" // Bedre focus offset
                     )}
                  >
                       Les mer
                       <ArrowRight
                           aria-hidden="true"
                           className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1"
                       />
                 </Link>
            </div>
        </div>
      </div>
    </motion.article>
  );
}