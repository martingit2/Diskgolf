// components/news/article-metadata.tsx
import React from 'react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/app/lib/utils';


interface ArticleMetadataProps {
  author: { name: string | null; image: string | null };
  date: Date | string; // Kan ta imot Date-objekt eller streng
  className?: string;
}

export function ArticleMetadata({ author, date, className }: ArticleMetadataProps) {
  const displayDate = typeof date === 'string' ? new Date(date) : date;
  const isValidDate = !isNaN(displayDate.getTime());

  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground', className)}>
      <div className="flex items-center gap-1.5">
        <Avatar className="h-5 w-5 border">
          <AvatarImage src={author?.image ?? ''} alt={author?.name ?? ''} />
          <AvatarFallback className="text-[10px]">
            {author?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{author?.name ?? 'Ukjent'}</span>
      </div>
      {isValidDate && (
        <div className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          <time dateTime={displayDate.toISOString()}>
            {/* Bruk kortere format for kortvisning, evt. lengre for detalj */}
            {format(displayDate, 'd. MMM yyyy', { locale: nb })}
          </time>
        </div>
      )}
    </div>
  );
}