import React from 'react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { CalendarDays, UserCircle } from 'lucide-react'; // Bytter til UserCircle for fallback
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/app/lib/utils'; // Juster sti ved behov

interface ArticleMetadataProps {
  // Gjør author valgfri for mer fleksibilitet
  author?: { name: string | null; image: string | null } | null;
  date: Date | string;
  className?: string;
  // Ny prop for å styre størrelse/stil hvis nødvendig
  variant?: 'default' | 'compact';
}

export function ArticleMetadata({
  author,
  date,
  className,
  variant = 'default',
}: ArticleMetadataProps) {
  const displayDate = typeof date === 'string' ? new Date(date) : date;
  const isValidDate = displayDate instanceof Date && !isNaN(displayDate.getTime());

  const avatarSize = variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5';
  const fallbackTextSize = variant === 'compact' ? 'text-[9px]' : 'text-[10px]';
  const iconSize = variant === 'compact' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const textSize = variant === 'compact' ? 'text-[11px]' : 'text-xs'; // Litt mindre for compact

  const authorName = author?.name ?? 'Ukjent forfatter';
  const authorInitial = author?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div
      className={cn(
        'flex flex-wrap items-center text-muted-foreground',
        variant === 'default' ? 'gap-x-3 gap-y-1.5' : 'gap-x-2 gap-y-1', // Justert gap
        textSize,
        className
      )}
    >
      {/* Forfatter-seksjon */}
      {author && ( // Vis kun hvis forfatter er gitt
        <div className="flex items-center gap-1.5">
          <Avatar className={cn(avatarSize, 'border border-border/50')}>
            <AvatarImage src={author.image ?? undefined} alt={authorName} />
            <AvatarFallback className={fallbackTextSize}>
              {authorInitial}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium leading-tight">{authorName}</span>
        </div>
      )}
      {/* Fallback hvis ingen forfatter OG ingen dato */}
       {!author && !isValidDate && (
          <div className="flex items-center gap-1">
              <UserCircle className={iconSize} />
              <span>Ingen metadata</span>
          </div>
       )}

      {/* Dato-seksjon */}
      {isValidDate && (
        <div className="flex items-center gap-1">
          <CalendarDays className={iconSize} />
          <time dateTime={displayDate.toISOString()} className="leading-tight">
            {/* Bruker 'd. MMM yyyy' som standard, vurder kortere for 'compact' om ønskelig */}
            {format(displayDate, 'd. MMM yyyy', { locale: nb })}
          </time>
        </div>
      )}
    </div>
  );
}