// Fil: src/components/news/article-detail-skeleton.tsx
// Formål: React-komponent som viser et "skeleton"-grensesnitt (lasteindikator) for en nyhetsartikkel-detaljside mens dataen lastes.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.




import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ArticleDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 animate-pulse">
      {/* Tilbake-knapp */}
      <Skeleton className="h-9 w-36 mb-8" />

      <div className="bg-card p-6 sm:p-8 rounded-lg shadow-sm border">
        {/* Tittel */}
        <Skeleton className="h-10 md:h-12 w-full mb-5 bg-muted-foreground/20" />
        <Skeleton className="h-8 w-3/4 mb-6 bg-muted-foreground/15" />

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 border-b pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full bg-muted-foreground/10" />
            <Skeleton className="h-5 w-28 bg-muted-foreground/10" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4 bg-muted-foreground/10" />
            <Skeleton className="h-5 w-36 bg-muted-foreground/10" />
          </div>
        </div>

        {/* Bilde Skeleton */}
        <Skeleton className="w-full aspect-video rounded-lg mb-10 bg-muted-foreground/10" />

        {/* Innhold Skeleton */}
        <div className="prose prose-lg max-w-none dark:prose-invert space-y-4">
          <Skeleton className="h-4 w-full bg-muted-foreground/10" />
          <Skeleton className="h-4 w-[95%] bg-muted-foreground/10" />
          <Skeleton className="h-4 w-full bg-muted-foreground/10" />
          <br/>
          <Skeleton className="h-4 w-full bg-muted-foreground/10" />
          <Skeleton className="h-4 w-[90%] bg-muted-foreground/10" />
           <Skeleton className="h-4 w-full bg-muted-foreground/10" />
          <Skeleton className="h-4 w-[85%] bg-muted-foreground/10" />
          <Skeleton className="h-4 w-1/2 bg-muted-foreground/10" />
        </div>
      </div>
    </div>
  );
}