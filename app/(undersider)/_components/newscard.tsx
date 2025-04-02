import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle, Category } from '@prisma/client';
import { Eye, EyeOff, Loader2, Pencil, Trash2, Newspaper, ArrowRight } from 'lucide-react'; // Fjernet ExternalLink da den ikke ble brukt
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/app/lib/utils';
import { ArticleMetadata } from './news-article-metadata'; // Antar denne stien er korrekt

// Type definisjon
type NewsArticleWithDetails = NewsArticle & {
  author: { name: string | null; image: string | null } | null;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};

// Props interface
interface NewsCardProps {
  article: NewsArticleWithDetails;
  isAdmin: boolean;
  isLoadingAction: boolean;
  onEdit: (article: NewsArticleWithDetails) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (article: NewsArticleWithDetails) => void;
}

// Hjelpefunksjon for utdrag
function createExcerptFallback(text: string | null | undefined, maxLength = 100): string {
  if (!text) return '';
  // Fjerner HTML-tags før lengdeberegning og utdrag
  const cleanedText = text.replace(/<[^>]*>/g, '');
  if (cleanedText.length <= maxLength) return cleanedText;
  const truncated = cleanedText.substring(0, maxLength);
  // Sørger for å ikke kutte midt i et ord
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated).trim() + '...';
}

// --- HOVEDKOMPONENT ---
export function NewsCard({
  article,
  isAdmin,
  isLoadingAction,
  onEdit,
  onDelete,
  onTogglePublish,
}: NewsCardProps) {
  // Feilhåndtering hvis artikkel mangler ID
  if (!article?.id) {
    console.error("FEIL: NewsCard mottok artikkel uten ID:", article);
    return (
        <Card className="border-destructive p-4">
            <p className="text-destructive-foreground">Feil: Mangler artikkeldata.</p>
        </Card>
    );
  }

  // Data for visning
  const displayExcerpt = article.excerpt || createExcerptFallback(article.content);
  // Bruk publishedAt hvis det finnes, ellers createdAt
  const displayDate = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);
  const authorDisplay = article.author ?? { name: 'Ukjent forfatter', image: null };
  const linkHref = `/nyheter/${article.id}`; // Standard lenkeformat

  return (
    <TooltipProvider delayDuration={100}>
      <Card className={cn(
        "group relative flex h-full flex-col overflow-hidden border transition-all duration-300", // Grunnleggende stiler + generell 'border'

        // 1. Sett generell kantfarge/stil FØRST (basert på publiseringsstatus)
        !article.isPublished && isAdmin
          ? "border-dashed border-orange-400 dark:border-orange-600/70" // Kladd-stil (oransje, stiplet)
          : "border-border dark:border-border/70", // Standard kantfarge for publiserte

        // 2. Overstyr KUN venstre kant med grønn ETTERPÅ
        "border-l-4 border-l-green-500 dark:border-l-green-400", // <-- ALLTID SYNLIG GRØNN KANT (Vinner over generell farge på venstre side)

        // 3. Hover-effekter (trenger ikke lenger `hover:border-border` da base/betinget farge er satt)
        "hover:shadow-xl", // Skygge på hover
        !article.isPublished && isAdmin && "hover:border-orange-500 dark:hover:border-orange-500" // Spesifikk hover for kladd (hvis ønskelig)

      )}>

        {/* Kladd-merke for admin */}
        {!article.isPublished && isAdmin && (
          <Badge
             variant="outline"
             className="absolute right-2 top-2 z-10 rounded-full border-orange-300 bg-orange-100/80 px-2 py-0.5 text-[10px] font-semibold text-orange-800 shadow-sm backdrop-blur-sm dark:border-orange-700 dark:bg-orange-900/70 dark:text-orange-200"
           >
             Kladd
          </Badge>
        )}

        {/* Link rundt bilde og innhold for bedre klikkbarhet */}
        <Link href={linkHref} className="flex flex-grow flex-col" aria-label={`Les mer om ${article.title}`}>
          <CardHeader className="p-0">
            {/* Bilde-seksjon */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {article.imageUrl ? (
                <Image
                  src={article.imageUrl}
                  alt={`Bilde for ${article.title}`}
                  fill
                  style={{ objectFit: 'cover' }} // object-cover er standard, men dette er mer eksplisitt
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive bildestørrelser
                  className="opacity-0 transition-transform duration-500 ease-in-out group-hover:scale-105" // Hover-effekt + fade-in
                  onLoadingComplete={(img) => img.classList.remove('opacity-0')} // Fjerner opacity når bildet er lastet
                  loading="lazy" // Lazy loading for bilder utenfor viewport
                />
              ) : (
                // Fallback hvis bilde mangler
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60 dark:from-slate-800 dark:to-slate-800/40">
                  <Newspaper className="h-12 w-12 text-muted-foreground/20 dark:text-slate-600" strokeWidth={1}/>
                </div>
              )}
            </div>
          </CardHeader>

          {/* Innhold (tittel, metadata, utdrag, kategorier) */}
          <CardContent className="flex-grow space-y-2 p-4 pb-3">
            {/* Tittel */}
            <CardTitle className="line-clamp-2 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
              {article.title}
            </CardTitle>
             {/* Metadata (bruker importert komponent) */}
             <ArticleMetadata author={authorDisplay} date={displayDate} className="text-xs" variant="compact" />
            {/* Utdrag */}
            <p className="line-clamp-3 pt-1 text-sm text-muted-foreground">
              {displayExcerpt}
            </p>
            {/* Kategorier */}
            {article.categories && article.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {/* Viser maks 3 kategorier */}
                {article.categories.slice(0, 3).map(cat => (
                   <Badge key={cat.slug} variant="secondary" className="cursor-default whitespace-nowrap text-[10px] font-normal">
                       {cat.name}
                   </Badge>
                ))}
                {/* Viser "+ N" hvis det er flere enn 3 */}
                {article.categories.length > 3 && (
                  <Badge variant="secondary" className="cursor-default text-[10px] font-normal">
                    + {article.categories.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Link>

        {/* Footer med "Les mer" og admin-handlinger */}
        <CardFooter className="flex items-center justify-between border-t bg-muted/30 p-3 dark:bg-slate-800/30">
          {/* "Les mer"-knapp */}
          <Link
            href={linkHref}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "px-1 text-sm font-medium text-primary hover:text-primary/90" // Bruker link variant
            )}
          >
            Les mer
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>

          {/* Admin-handlinger */}
          {isAdmin && (
            <div className="flex space-x-1">
              {/* Publiser/Avpubliser */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); onTogglePublish(article); }} // Stopp propagering for å unngå link-klikk
                    disabled={isLoadingAction}
                    aria-label={article.isPublished ? 'Avpubliser artikkel' : 'Publiser artikkel'}
                  >
                    {isLoadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : article.isPublished ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4 text-green-600" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{article.isPublished ? 'Avpubliser' : 'Publiser'}</TooltipContent>
              </Tooltip>

              {/* Rediger */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); onEdit(article); }}
                    disabled={isLoadingAction}
                    aria-label="Rediger artikkel"
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rediger</TooltipContent>
              </Tooltip>

              {/* Slett */}
              <AlertDialog onOpenChange={(open) => !open && document.body.style.pointerEvents === ''}> {/* Workaround for shadcn UI Tooltip/Dialog issue */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => e.stopPropagation()} // Stopp propagering
                        disabled={isLoadingAction}
                        aria-label="Slett artikkel"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Slett</TooltipContent>
                </Tooltip>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}> {/* Stopp propagering her også */}
                  <AlertDialogHeader>
                    <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Handlingen kan ikke angres. Dette vil permanent slette nyhetsartikkelen:
                      <strong className="mt-2 block break-words font-medium">"{article.title}"</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoadingAction}>Avbryt</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(article.id)} // Ikke nødvendig å stoppe propagering her
                      disabled={isLoadingAction}
                      className={buttonVariants({variant: "destructive"})} // Bruk destructive variant
                    >
                      {isLoadingAction ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sletter...</> : 'Ja, slett artikkelen'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}