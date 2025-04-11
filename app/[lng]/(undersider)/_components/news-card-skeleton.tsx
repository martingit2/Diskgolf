// Fil: src/components/news/news-card-skeleton.tsx
// Formål: Komponent som viser en "skeleton" (lasteindikator) for et standard nyhetskort, brukt mens data lastes inn.
// Utvikler: Martin Pettersen




import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export function NewsCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 animate-pulse">
      <CardHeader className="p-0">
        <Skeleton className="aspect-video w-full bg-muted-foreground/10" />
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 bg-muted-foreground/20" /> {/* Title */}
        <div className="flex items-center gap-4"> {/* Metadata */}
           <Skeleton className="h-4 w-1/4 bg-muted-foreground/10" />
           <Skeleton className="h-4 w-1/3 bg-muted-foreground/10" />
        </div>
        <div className="space-y-2"> {/* Excerpt */}
          <Skeleton className="h-3 w-full bg-muted-foreground/10" />
          <Skeleton className="h-3 w-5/6 bg-muted-foreground/10" />
        </div>
      </CardContent>
      {/* Anta at admin-knapper *kan* være der, så lag plass */}
      <CardFooter className="flex justify-end space-x-1.5 p-3 bg-muted/30">
        <Skeleton className="h-7 w-7 rounded bg-muted-foreground/10" />
        <Skeleton className="h-7 w-7 rounded bg-muted-foreground/10" />
        <Skeleton className="h-7 w-7 rounded bg-muted-foreground/10" />
        <Skeleton className="h-7 w-7 rounded bg-muted-foreground/10" />
      </CardFooter>
    </Card>
  );
}