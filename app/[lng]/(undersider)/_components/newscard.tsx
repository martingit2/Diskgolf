// FILE: app/(undersider)/_components/newscard.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle, Category } from '@prisma/client';
import { Eye, EyeOff, Loader2, Pencil, Trash2, ArrowRight, CalendarDays, User, ImageDown } from 'lucide-react';
import { Card, CardFooter, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/app/lib/utils';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { ArticleMetadata } from './article-metadata';
import { useRouter } from 'next/navigation';

// --- Types (Unchanged) ---
type NewsArticleWithDetails = NewsArticle & {
  author: { name: string | null; image: string | null } | null;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};

interface NewsCardProps {
  article: NewsArticleWithDetails;
  isAdmin: boolean;
  isLoadingAction: boolean;
  onEdit: (article: NewsArticleWithDetails) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (article: NewsArticleWithDetails) => void;
}

// --- Helper Functions (Unchanged) ---
function createExcerptFallback(text: string | null | undefined, maxLength = 75): string {
  if (!text) return '';
  const cleanedText = text.replace(/<[^>]*>/g, '');
  if (cleanedText.length <= maxLength) return cleanedText;
  const truncated = cleanedText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated).trim() + '...';
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'Ukjent dato';
  try {
    return format(new Date(date), "d. MMM yyyy", { locale: nb });
  } catch (error) {
    console.error("DEV_ERROR: Invalid date format passed to NewsCard:", date, error);
    return 'Ugyldig dato';
  }
}

// --- Main Component: Ultimate Premium NewsCard v2 ---
export function NewsCard({
  article,
  isAdmin,
  isLoadingAction,
  onEdit,
  onDelete,
  onTogglePublish,
}: NewsCardProps) {

  const router = useRouter();

  if (!article?.id) {
    console.error("DEV_ERROR: NewsCard received invalid article data:", article);
    return (
      <Card className="aspect-video border-destructive bg-destructive/5 p-4 rounded-lg shadow-none flex items-center justify-center text-center">
        <p className="text-sm font-medium text-destructive-foreground">Kunne ikke laste artikkelkort.</p>
      </Card>
    );
  }

  const displayExcerpt = article.excerpt || createExcerptFallback(article.content);
  const displayDate = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);
  const linkHref = `/nyheter/${article.id}`;
  const isDraft = !article.isPublished;
  const primaryCategory = article.categories?.[0];

  // --- Event Handlers (Unchanged) ---
  const handleCategoryClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/nyheter/kategori/${slug}`);
  };

  const handleAdminActionClick = (e: React.MouseEvent, action: () => void) => {
     e.preventDefault();
     e.stopPropagation();
     action();
  };
   const handleAlertTriggerClick = (e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
   };

  // Define the text shadow style using Tailwind arbitrary property.
  // Format: [text-shadow:offsetX_offsetY_blurRadius_color] Underscore replaces space.
  // Using rgb(0 0 0 / 0.6) for black with 60% opacity. Adjust values as needed.
  const textShadowClass = "[text-shadow:0_1px_3px_rgb(0_0_0_/_0.6)]";

  return (
    <TooltipProvider delayDuration={200}>
      <Card className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg",
        "border border-black/5 dark:border-white/5",
        "bg-card text-card-foreground shadow-md dark:shadow-black/20",
        "transition-all duration-300 ease-in-out hover:shadow-lg",
        isDraft && isAdmin && "border-dashed border-amber-400/70 dark:border-amber-500/60 ring-1 ring-amber-400/20 dark:ring-amber-500/15",
      )}>

        {/* Clickable Area */}
        <Link href={linkHref} className="block relative w-full aspect-video overflow-hidden" aria-label={`Les mer om ${article.title}`}>
          {/* Background Image */}
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
            {article.imageUrl ? (
              <Image src={article.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover opacity-0 transition-all duration-500 ease-in-out group-hover:scale-[1.03]" onLoadingComplete={(img) => img.classList.remove('opacity-0')} loading="lazy" quality={75} />
            ) : (
              <div className="flex h-full w-full items-center justify-center"><ImageDown className="h-12 w-12 text-neutral-400/60 dark:text-neutral-600/60" strokeWidth={1.5} /></div>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent pointer-events-none" aria-hidden="true" />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col p-4 md:p-5 text-white pointer-events-none">
            {/* Top Section */}
            <div className="flex justify-between items-start pointer-events-auto">
              {primaryCategory && !isDraft && (
                <button onClick={(e) => handleCategoryClick(e, primaryCategory.slug)} className={cn(buttonVariants({ variant: 'default', size: 'sm' }), "h-auto cursor-pointer rounded border border-white/20 bg-green-600/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-md backdrop-blur-sm transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-white/50 focus:outline-none")}>
                  {primaryCategory.name}
                </button>
              )}
              {!primaryCategory && !isDraft && <div className="w-0 h-0"></div>}
              {isDraft && isAdmin && ( <Badge variant="outline" className="ml-auto cursor-default rounded border border-amber-300/50 bg-amber-50/90 px-2 py-0.5 text-[10px] font-medium text-amber-800 shadow-md backdrop-blur-sm dark:border-amber-600/50 dark:bg-amber-950/80 dark:text-amber-200 pointer-events-auto"> Kladd </Badge> )}
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Bottom Content Block */}
            {/* Applied textShadowClass to relevant text elements. */}
            <div className="space-y-1.5 pointer-events-auto">
              <CardTitle className={cn("line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-green-300 sm:text-lg md:text-xl", textShadowClass)}>
                {article.title}
              </CardTitle>

              {/* Metadata - Pass shadow class */}
              <ArticleMetadata
                author={article.author}
                date={displayDate}
                variant="compact"
                className={cn("text-white/80", textShadowClass)} // Pass shadow class here
              />

              {/* Excerpt */}
              <p className={cn("line-clamp-2 text-xs text-white/90  leading-relaxed", textShadowClass)}>
                  {displayExcerpt}
              </p>

              {/* "Read More" Affordance */}
              <div className={cn("group/link inline-flex items-center pt-1 text-xs font-medium text-green-300 dark:text-green-400", textShadowClass)} aria-hidden="true">
                 Les mer
                 <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
              </div>
            </div>
          </div>
        </Link> {/* END Clickable Area */}


        {/* Admin Actions Footer (Separate) */}
        {isAdmin && (
          <CardFooter className="z-20 border-t border-black/10 bg-neutral-100/90 px-3 py-1.5 dark:border-white/10 dark:bg-neutral-900/90 flex items-center justify-end space-x-0.5 backdrop-blur-sm">
              {/* Publish/Unpublish */}
              <Tooltip> <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleAdminActionClick(e, () => onTogglePublish(article))} disabled={isLoadingAction} aria-label={isDraft ? 'Publiser' : 'Avpubliser'}>
                    {isLoadingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isDraft ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-amber-600" />}
                  </Button>
              </TooltipTrigger> <TooltipContent side="top" className="text-xs"><p>{isDraft ? 'Publiser' : 'Gjør til kladd'}</p></TooltipContent> </Tooltip>

              {/* Edit */}
              <Tooltip> <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleAdminActionClick(e, () => onEdit(article))} disabled={isLoadingAction} aria-label="Rediger">
                    {isLoadingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Pencil className="h-4 w-4 text-blue-600" />}
                  </Button>
              </TooltipTrigger> <TooltipContent side="top" className="text-xs"><p>Rediger</p></TooltipContent> </Tooltip>

              {/* Delete */}
              <AlertDialog onOpenChange={(open) => !open && (document.body.style.pointerEvents = '')}>
                <Tooltip> <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/80 hover:text-destructive hover:bg-destructive/10" onClick={handleAlertTriggerClick} disabled={isLoadingAction} aria-label="Slett">
                      {isLoadingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </TooltipTrigger> <TooltipContent side="top" className="text-xs"><p>Slett</p></TooltipContent> </Tooltip>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                   <AlertDialogHeader> <AlertDialogTitle>Bekreft sletting</AlertDialogTitle> <AlertDialogDescription> Er du sikker på at du vil permanent slette artikkelen <strong className="font-medium text-foreground">"{article.title}"</strong>? Handlingen kan ikke angres. </AlertDialogDescription> </AlertDialogHeader>
                   <AlertDialogFooter className="mt-2"> <AlertDialogCancel disabled={isLoadingAction}>Avbryt</AlertDialogCancel> <AlertDialogAction onClick={() => onDelete(article.id)} disabled={isLoadingAction} className={buttonVariants({variant: "destructive"})}> {isLoadingAction ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sletter...</> : 'Ja, slett'} </AlertDialogAction> </AlertDialogFooter>
                 </AlertDialogContent>
              </AlertDialog>
          </CardFooter>
        )}
      </Card>
    </TooltipProvider>
  );
}