// Fil: src/components/news/article-metadata.tsx
// Formål: Gjenbrukbar komponent for å vise metadata (forfatter, dato) for en artikkel, med støtte for ulike visningsvarianter ('default', 'compact').
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.

import React from 'react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { CalendarDays, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // DEV COMMENT: Verify path
import { cn } from '@/app/lib/utils'; // DEV COMMENT: Verify path

interface ArticleMetadataProps {
  // DEV COMMENT: Author is optional. If not provided, only the date (if valid) or a fallback is shown.
  author?: { name: string | null; image: string | null } | null;
  // DEV COMMENT: Accepts Date object or ISO string. Handles basic validation.
  date: Date | string | null | undefined;
  className?: string;
  // DEV COMMENT: 'compact' variant uses smaller text/icons, suitable for overlays or tight spaces.
  variant?: 'default' | 'compact';
}

export function ArticleMetadata({
  author,
  date,
  className,
  variant = 'default',
}: ArticleMetadataProps) {

  // --- Data Processing ---
  // DEV COMMENT: Robust date parsing and validation.
  let displayDate: Date | null = null;
  let isValidDate = false;
  if (date) {
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
        displayDate = parsedDate;
        isValidDate = true;
      }
    } catch (e) {
        console.warn("DEV_WARN: Invalid date passed to ArticleMetadata:", date, e);
    }
  }

  // --- Styling based on variant ---
  // DEV COMMENT: Using conditional styles for flexibility.
  const avatarSize = variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5';
  const fallbackTextSize = variant === 'compact' ? 'text-[8px]' : 'text-[10px]'; // Even smaller for compact
  const iconSize = variant === 'compact' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const textSize = variant === 'compact' ? 'text-[10px]' : 'text-xs'; // Compact uses smaller base text
  const gapClass = variant === 'compact' ? 'gap-x-1.5 gap-y-0.5' : 'gap-x-2 gap-y-1'; // Adjusted gap

  const authorName = author?.name ?? 'Ukjent forfatter';
  // DEV COMMENT: Simple initial logic. Consider more robust multi-word name handling if needed.
  const authorInitial = author?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2) // Max 2 initials
    .join('')
    .toUpperCase() ?? '?';

  // --- Render ---
  // DEV COMMENT: Main container using flex-wrap for responsiveness. `items-center` ensures vertical alignment.
  return (
    <div
      className={cn(
        'flex flex-wrap items-center',
        gapClass,
        textSize,
        // DEV COMMENT: Default text color is muted. Parent components (like NewsCard overlay) might need to override this via `className`.
        'text-muted-foreground',
        className // Allow external overrides
      )}
    >
      {/* Author Section */}
      {/* DEV COMMENT: Only render if author data is provided. */}
      {author && (
        <div className="flex items-center gap-1">
          <Avatar className={cn(avatarSize, 'border border-black/10 dark:border-white/10')}>
            <AvatarImage src={author.image ?? undefined} alt={`Avatar for ${authorName}`} />
            {/* DEV COMMENT: Fallback provides initials if image fails or isn't present. */}
            <AvatarFallback className={cn(fallbackTextSize, "font-medium")}>
              {authorInitial}
            </AvatarFallback>
          </Avatar>
          {/* DEV COMMENT: `leading-tight` helps vertical alignment with icon/avatar. */}
          <span className="font-medium leading-tight truncate" title={authorName}>{authorName}</span>
        </div>
      )}

      {/* Separator (only if both author and date are present) */}
      {/* DEV COMMENT: Adds visual separation only when needed. */}
      {author && isValidDate && <span className="text-current opacity-50 mx-0.5" aria-hidden="true">•</span>}

      {/* Date Section */}
      {/* DEV COMMENT: Only render if the date is valid. */}
      {isValidDate && displayDate && (
        <div className="flex items-center gap-1">
          <CalendarDays className={iconSize} aria-hidden="true" />
          <time dateTime={displayDate.toISOString()} className="leading-tight">
            {/* DEV COMMENT: Using 'd. MMM yyyy' format for clarity and brevity. */}
            {format(displayDate, 'd. MMM yyyy', { locale: nb })}
          </time>
        </div>
      )}

       {/* Fallback (If neither author nor valid date is provided) */}
       {/* DEV COMMENT: Provides minimal feedback if no data is available. */}
       {!author && !isValidDate && (
          <div className="flex items-center gap-1 opacity-70">
              <UserCircle className={iconSize} aria-hidden="true" />
              <span className="italic text-xs">Ingen data</span>
          </div>
       )}
    </div>
  );
}