// app/(undersider)/_components/newscard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// --- VIKTIG: Importer base Prisma typer ---
import { NewsArticle, Category } from '@prisma/client';
// --- SLUTT VIKTIG ---
import { ExternalLink, Eye, EyeOff, Loader2, Pencil, Trash2, Newspaper } from 'lucide-react'; // La til Newspaper ikon
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/app/lib/utils'; // Juster sti
import { ArticleMetadata } from '../_components/article-metadata';


// --- VIKTIG: Oppdatert Type Definisjon ---
// Definer typen HER, slik at den er konsistent med det page.tsx sender
type NewsArticleWithDetails = NewsArticle & {
    author: { name: string | null; image: string | null } | null;
    categories: Pick<Category, 'id' | 'name' | 'slug'>[]; // ** id, name, slug **
};
// --- SLUTT VIKTIG ---

// --- OPPDATER Props til å bruke den korrigerte typen ---
interface NewsCardProps {
  article: NewsArticleWithDetails; // <-- Bruker den korrekte typen
  isAdmin: boolean;
  isLoadingAction: boolean;
  onEdit: (article: NewsArticleWithDetails) => void; // <-- Forventer korrekt type
  onDelete: (id: string) => void;
  onTogglePublish: (article: NewsArticleWithDetails) => void; // <-- Forventer korrekt type
}

// Fallback utdragsfunksjon (uendret)
function createExcerptFallback(text: string | null | undefined, maxLength = 100): string {
    if (!text) return '';
    const cleanedText = text.replace(/<[^>]*>/g, '');
    if (cleanedText.length <= maxLength) return cleanedText;
    const truncated = cleanedText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated).trim() + '...';
}

// --- NewsCard Komponent ---
export function NewsCard({
  article,
  isAdmin,
  isLoadingAction,
  onEdit,
  onDelete,
  onTogglePublish,
}: NewsCardProps) { // Props bruker nå korrekt NewsArticleWithDetails

  // Sikkerhetssjekk for manglende ID (selv om det ikke bør skje)
  if (!article?.id) {
      console.error("FEIL: NewsCard mottok artikkel uten ID:", article);
      return <Card className="p-4 border-destructive"><p className="text-destructive-foreground">Feil: Mangler artikkeldata.</p></Card>;
  }

  const displayExcerpt = article.excerpt || createExcerptFallback(article.content);
  // Bruk publiseringsdato hvis tilgjengelig, ellers opprettelsesdato
  const displayDate = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);
  const authorDisplay = article.author ?? { name: 'Ukjent forfatter', image: null };
  const linkHref = `/nyheter/${article.id}`;

  return (
    <TooltipProvider delayDuration={100}>
        {/* Legg til group for hover-effekter på hele kortet */}
        <Card className={cn(
            "flex flex-col overflow-hidden transition-all duration-300 group border h-full relative", // Legg til relative for kladd-badge
            "hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/40",
            !article.isPublished && isAdmin ? "border-dashed border-orange-400 hover:border-orange-500 dark:border-orange-600/70 dark:hover:border-orange-500" : "border-border"
        )}>
             {/* Kladd-indikator for admin */}
             {!article.isPublished && isAdmin && (
                <span className="absolute top-2 right-2 text-[10px] font-semibold text-orange-800 bg-orange-200 px-2 py-0.5 rounded-full border border-orange-300 shadow-sm z-10 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700">
                    Kladd
                </span>
             )}

            {/* Hele kortet er en lenke */}
            <Link href={linkHref} className="flex flex-col flex-grow" aria-label={`Les mer om ${article.title}`}>
                <CardHeader className="p-0">
                    <div className="aspect-video w-full overflow-hidden relative bg-muted">
                        {article.imageUrl ? (
                             <Image
                                src={article.imageUrl}
                                alt={`Bilde for ${article.title}`}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="transition-transform duration-500 ease-in-out group-hover:scale-105 opacity-0"
                                onLoadingComplete={(img) => img.classList.remove('opacity-0')}
                                loading="lazy"
                             />
                        ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60 dark:from-slate-800 dark:to-slate-800/40">
                                <Newspaper className="w-12 h-12 text-muted-foreground/20 dark:text-slate-600" strokeWidth={1}/>
                            </div>
                        )}
                        {/* Fjernet kladd-badge herfra siden den er lagt utenfor Link */}
                    </div>
                </CardHeader>

                <CardContent className="flex-grow p-4 pb-3 space-y-2">
                    <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 font-semibold">
                        {article.title}
                    </CardTitle>
                    {/* Bruk ArticleMetadata for konsistent visning */}
                    <ArticleMetadata author={authorDisplay} date={displayDate} className="text-xs" />
                    <p className="text-sm text-muted-foreground pt-1 line-clamp-3">
                        {displayExcerpt}
                    </p>
                     {/* Vis Kategorier */}
                     {article.categories && article.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {article.categories.slice(0, 3).map(cat => (
                                <span key={cat.slug} className="text-[10px] font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full border border-border/50 whitespace-nowrap dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
                                    {cat.name}
                                </span>
                            ))}
                            {article.categories.length > 3 && (
                                 <span className="text-[10px] font-medium text-muted-foreground px-1 py-0.5 rounded-full">
                                    + {article.categories.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Link>

            {/* Admin-handlinger */}
            {isAdmin && (
                <CardFooter className="flex justify-end space-x-1 p-2 bg-muted/30 dark:bg-slate-800/30 border-t mt-auto">
                    {/* Tooltips for bedre UX */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                <Link href={linkHref} target="_blank" rel="noopener noreferrer" aria-label="Åpne artikkel i ny fane">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Åpne i ny fane</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); onTogglePublish(article); }}
                                disabled={isLoadingAction}
                                aria-label={article.isPublished ? 'Avpubliser artikkel' : 'Publiser artikkel'}
                            >
                                {isLoadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : article.isPublished ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4 text-green-600" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{article.isPublished ? 'Avpubliser' : 'Publiser'}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); onEdit(article); }}
                                disabled={isLoadingAction}
                                aria-label="Rediger artikkel"
                            >
                                <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Rediger</TooltipContent>
                    </Tooltip>

                    <AlertDialog onOpenChange={(open) => !open && document.body.style.pointerEvents === ''}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost" size="icon" className="h-7 w-7"
                                        onClick={(e) => e.stopPropagation()}
                                        disabled={isLoadingAction}
                                        aria-label="Slett artikkel"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Slett</TooltipContent>
                        </Tooltip>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Handlingen kan ikke angres. Dette vil permanent slette nyhetsartikkelen:
                                    <strong className="block mt-2 font-medium break-words">"{article.title}"</strong>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isLoadingAction}>Avbryt</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(article.id)}
                                    disabled={isLoadingAction}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isLoadingAction ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sletter...</> : 'Ja, slett artikkelen'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            )}
        </Card>
     </TooltipProvider>
  );
}