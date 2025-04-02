// components/news/featured-news-card.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category, NewsArticle } from '@prisma/client';
import { cn } from '@/app/lib/utils'; // Juster sti ved behov
import { ArticleMetadata } from './article-metadata'; // Importer den oppdaterte metadata-komponenten
import { buttonVariants } from '@/components/ui/button'; // For lenke-styling
import { ArrowRight } from 'lucide-react';

// Type definisjon - bør matche det som sendes fra page.tsx
type NewsArticleWithDetails = NewsArticle & {
    author: { name: string | null; image: string | null } | null;
    categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};

interface FeaturedNewsCardProps {
  article: NewsArticleWithDetails;
  className?: string;
  priority?: boolean; // For next/image priority loading on LCP element
}

export function FeaturedNewsCard({ article, className, priority = false }: FeaturedNewsCardProps) {
  // Fallback excerpt hvis nødvendig
  const createExcerptFallback = (text: string | null | undefined, maxLength = 150): string => {
    if (!text) return '';
    const cleanedText = text.replace(/<[^>]*>/g, ''); // Fjerner HTML-tags
    if (cleanedText.length <= maxLength) return cleanedText;
    const truncated = cleanedText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated).trim() + '...';
  };

  const displayExcerpt = article.excerpt || createExcerptFallback(article.content);
  const displayDate = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);
  const linkHref = `/nyheter/${article.id}`; // Antatt lenkestruktur

  // Bruk et standardbilde hvis article.imageUrl mangler
  const imageUrl = article.imageUrl ?? '/images/placeholder-news.jpg'; // ERSTATT med din faktiske placeholder-sti

  return (
    <article className={cn("group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-card", className)}>
      <Link href={linkHref} className="block">
        <div className="relative aspect-[16/9] md:aspect-[2/1] w-full">
          {/* Bilde som bakgrunn */}
          <Image
            src={imageUrl}
            alt={`Fremhevet bilde for ${article.title}`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1000px" // Juster sizes etter layout
            className="transition-transform duration-500 ease-in-out group-hover:scale-105"
            priority={priority} // Viktig for LCP (Largest Contentful Paint) på den første/viktigste
            onError={(e) => {
                // Fallback hvis bildet ikke lastes (f.eks. til placeholder)
                // Du kan sette en state her for å rendre placeholder, eller endre src direkte hvis det er trygt
                console.warn(`Failed to load image: ${imageUrl}`);
                // Eksempel: e.currentTarget.src = '/images/placeholder-news.jpg';
            }}
          />
          {/* Gradient overlay for tekstlesbarhet */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div>
           {/* Valgfritt: Kategori-badge oppå bildet */}
           {article.categories && article.categories.length > 0 && (
             <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold bg-primary text-primary-foreground px-2.5 py-1 rounded-full shadow-md">
                {article.categories[0].name} {/* Vis kun første kategori her f.eks. */}
             </span>
            )}
        </div>

        {/* Tekstinnhold under bildet */}
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-card-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-200 line-clamp-3">
            {article.title}
          </h2>
          <ArticleMetadata
            author={article.author}
            date={displayDate}
            className="mb-3 sm:mb-4 text-foreground/80" // Litt lysere tekst her
            variant="default" // Bruk standardvarianten
          />
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5 line-clamp-2 sm:line-clamp-3">
            {displayExcerpt}
          </p>
          {/* "Les mer" lenke (ser ut som en knapp) */}
          <div
             className={cn(
                buttonVariants({ variant: "default", size: "sm" }), // Bruk button styling
                "group/link inline-flex items-center" // For ikon-animasjon
             )}
           >
            Les mer
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
}


