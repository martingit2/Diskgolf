// components/news/news-card.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsArticle } from '@prisma/client';
import { ExternalLink, Eye, EyeOff, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


import { ArticleMetadata } from './article-metadata'; // Importer metadata-komponenten
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/app/lib/utils';

// Type for artikkeldata med forfatter
type NewsArticleWithAuthor = NewsArticle & {
  author: { name: string | null; image: string | null };
};

interface NewsCardProps {
  article: NewsArticleWithAuthor;
  isAdmin: boolean;
  isLoadingAction: boolean; // For å vise spinner på spesifikk knapp
  onEdit: (article: NewsArticleWithAuthor) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (article: NewsArticleWithAuthor) => void;
}

// Hjelpefunksjon for å lage utdrag (kan gjøres mer avansert)
function createExcerpt(text: string, maxLength = 120): string {
    const cleanedText = text.replace(/<[^>]*>/g, ''); // Fjern HTML
    if (cleanedText.length <= maxLength) {
        return cleanedText;
    }
    return `${cleanedText.substring(0, maxLength).trim()}...`;
}


export function NewsCard({
  article,
  isAdmin,
  isLoadingAction,
  onEdit,
  onDelete,
  onTogglePublish,
}: NewsCardProps) {
  const excerpt = createExcerpt(article.content);
  const displayDate = article.publishedAt ?? article.createdAt;

  return (
    <TooltipProvider delayDuration={100}>
        <Card className={cn(
            "flex flex-col overflow-hidden transition-all duration-300 group border",
            "hover:shadow-lg hover:border-primary/20",
            !article.isPublished && isAdmin ? "border-dashed border-orange-400 hover:border-orange-500" : "border-border"
        )}>
            {/* Linket område (Bilde og innhold) */}
            <Link href={`/nyheter/${article.id}`} className="flex flex-col flex-grow" aria-label={`Les mer om ${article.title}`}>
                <CardHeader className="p-0">
                    <div className="aspect-video w-full overflow-hidden relative bg-muted">
                        {article.imageUrl ? (
                            <Image
                                src={article.imageUrl}
                                alt="" // Alt-tekst bør være mer beskrivende om mulig, men ofte vanskelig for generiske nyhetsbilder
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="transition-transform duration-500 ease-in-out group-hover:scale-105 opacity-0"
                                onLoadingComplete={(img) => img.classList.remove('opacity-0')}
                                placeholder="blur"
                                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                             />
                        ) : (
                            // Placeholder hvis bildet mangler
                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                                <span className="text-muted-foreground text-xs">Ingen bilde</span>
                            </div>
                        )}
                         {/* Kladd-merke (kun for admin) */}
                        {!article.isPublished && isAdmin && (
                            <span className="absolute top-2 right-2 text-[10px] font-semibold text-orange-800 bg-orange-200 px-2 py-0.5 rounded-full border border-orange-300 shadow-sm">
                                Kladd
                            </span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-grow p-4 space-y-2">
                    <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
                        {article.title}
                    </CardTitle>
                    <ArticleMetadata author={article.author} date={displayDate} />
                    <p className="text-sm text-muted-foreground pt-1 line-clamp-3">
                        {excerpt}
                    </p>
                </CardContent>
            </Link>

            {/* Admin-handlinger */}
            {isAdmin && (
                <CardFooter className="flex justify-end space-x-1 p-2 bg-muted/30 border-t">
                    {/* Åpne i ny fane */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* Viktig: Stopp propagering for å unngå Link-navigasjon */}
                            <Button asChild variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                <Link href={`/nyheter/${article.id}`} target="_blank" rel="noopener noreferrer" aria-label="Åpne artikkel i ny fane">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </Link>
                             </Button>
                        </TooltipTrigger>
                        <TooltipContent>Åpne i ny fane</TooltipContent>
                    </Tooltip>

                     {/* Publiser/Avpubliser */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); onTogglePublish(article); }}
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
                                disabled={isLoadingAction} // Deaktiver mens annen handling pågår
                                aria-label="Rediger artikkel"
                            >
                                <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Rediger</TooltipContent>
                    </Tooltip>

                    {/* Slett */}
                    <AlertDialog onOpenChange={(open) => !open && document.body.style.pointerEvents === ''}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                             <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => e.stopPropagation()} // Stopp propagering til Link
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
                                <strong className="block mt-2 font-medium">"{article.title}"</strong>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isLoadingAction}>Avbryt</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => onDelete(article.id)}
                                disabled={isLoadingAction}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                             >
                                {isLoadingAction ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Sletter...</> : 'Ja, slett artikkelen'}
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