// app/(undersider)/nyheter/[newsId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, AlertTriangle, CalendarDays, UserCircle, Tag } from 'lucide-react'; // Lagt til ikoner
import { NewsArticle, Category } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArticleMetadata } from '../../_components/article-metadata'; // Sjekk sti
import { ArticleDetailSkeleton } from '../../_components/article-detail-skeleton'; // Sjekk sti
import { Badge } from "@/components/ui/badge"; // Bruk Badge for kategorier
import { Separator } from "@/components/ui/separator"; // For visuell separasjon


// --- Type definisjon (uendret) ---
type NewsDetailArticle = NewsArticle & {
    author: { name: string | null; image: string | null } | null;
    categories: Pick<Category, 'name' | 'slug'>[];
};

export default function NewsDetailPage() {
    const params = useParams();
    const newsId = typeof params?.newsId === 'string' ? params.newsId : undefined;

    const [article, setArticle] = useState<NewsDetailArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!newsId) {
            // Denne komponenten *skal* ha en ID hvis den rendres riktig
            setError("Artikkel-ID mangler i URL.");
            setLoading(false);
            return;
        }
        // ... (resten av fetch-logikken er uendret) ...
        const fetchArticle = async () => {
            setLoading(true);
            setError(null);
            console.log(`Fetching article with ID: ${newsId}`);

            try {
                const response = await axios.get<NewsDetailArticle>(`/api/news/${newsId}`);
                setArticle(response.data);
            } catch (err: unknown) {
                 console.error(`Error fetching article with ID ${newsId}:`, err);
                 let errorMessage = 'En ukjent feil oppstod under henting av artikkelen.';
                 if (axios.isAxiosError(err)) {
                    const axiosError = err as AxiosError<{ error?: string }>;
                    const status = axiosError.response?.status;
                    const apiErrorMsg = axiosError.response?.data?.error;

                    if (status === 404) {
                        errorMessage = apiErrorMsg || 'Artikkelen ble ikke funnet.';
                    } else if (status === 403) {
                         errorMessage = apiErrorMsg || 'Du har ikke tilgang til å se denne artikkelen. (Ikke publisert?)';
                    } else {
                        errorMessage = apiErrorMsg || `Feil ved lasting av artikkel. (${status ?? 'Nettverksfeil'})`;
                    }
                }
                setError(errorMessage);
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();

    }, [newsId]);

    // --- Loading State ---
    if (loading) {
        return <ArticleDetailSkeleton />;
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16 lg:py-20">
                 <Button variant="outline" size="sm" asChild className="mb-8 print:hidden">
                    <Link href="/nyheter">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Tilbake til nyheter
                    </Link>
                </Button>
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/5 text-destructive">
                    <AlertTriangle className="h-5 w-5" strokeWidth={1.5}/>
                    <AlertTitle className="font-semibold">Kunne ikke laste artikkel</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    // --- Artikkel Ikke Funnet (etter lasting, uten error) ---
    if (!article) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16 lg:py-20 text-center">
                 <Button variant="outline" size="sm" asChild className="mb-8 print:hidden">
                    <Link href="/nyheter">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Tilbake til nyheter
                    </Link>
                </Button>
                 <Alert variant="default" className="border-yellow-400 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/50">
                    <AlertTriangle className="h-5 w-5 !text-yellow-600 dark:!text-yellow-400" />
                    <AlertTitle className="font-semibold">Artikkel ikke funnet</AlertTitle>
                    <AlertDescription>Den forespurte artikkelen eksisterer ikke eller er utilgjengelig.</AlertDescription>
                 </Alert>
            </div>
        );
    }

    // --- Rendering av Artikkel ---
    const { title, content, imageUrl, author, createdAt, publishedAt, isPublished, categories } = article;
    // Bruk publiseringsdato hvis den finnes, ellers opprettelsesdato
    const displayDate = publishedAt ? new Date(publishedAt) : new Date(createdAt);
    const authorDisplay = author ?? { name: 'Ukjent forfatter', image: null };


    return (
        // Bruk en lysere bakgrunn for selve artikkelområdet for kontrast mot sidens bakgrunn
         <div className="bg-gray-50 dark:bg-gray-950 py-12 md:py-16 lg:py-20">
             <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Tilbakeknapp */}
                <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground hover:text-foreground print:hidden -ml-3">
                    <Link href="/nyheter">
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Tilbake til Nyhetsoversikt
                    </Link>
                </Button>

                {/* Artikkelkort */}
                <article className="bg-card p-6 sm:p-8 md:p-12 rounded-lg shadow-lg border border-border/60 overflow-hidden">
                    {/* Kladd-varsel (mer fremtredende) */}
                    {!isPublished && (
                        <Alert variant="default" className="mb-8 border-orange-400 bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700/60">
                            <AlertTriangle className="h-5 w-5 !text-orange-600 dark:!text-orange-400" />
                            <AlertTitle className="font-semibold text-base">Dette er en upublisert kladd</AlertTitle>
                            <AlertDescription className="text-sm">
                                Denne artikkelen er kun synlig for administratorer og vil ikke vises offentlig før den publiseres.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Tittel */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-foreground">
                        {title}
                    </h1>

                    {/* Metadata Seksjon */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground mb-8 pb-6 border-b border-border/70">
                         <ArticleMetadata author={authorDisplay} date={displayDate} />
                         {/* Kategorier som Badges */}
                         {categories && categories.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map(cat => (
                                        <Badge key={cat.slug} variant="secondary" className="font-normal cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                                            <Link href={`/nyheter?category=${cat.slug}`}>
                                                {cat.name}
                                            </Link>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Bilde (med god plass og bakgrunn) */}
                    {imageUrl && (
                        <figure className="mb-8 md:mb-10 -mx-6 sm:-mx-8 md:-mx-12">
                            {/* Bruk aspect-ratio for å unngå layout shift */}
                            <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden shadow-inner">
                                <Image
                                    src={imageUrl}
                                    alt={`Hovedbilde for artikkelen: ${title}`}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority // VIKTIG for LCP (Largest Contentful Paint)
                                    // Definer sizes mer nøyaktig basert på max-w-4xl og padding
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
                                    className="transition-opacity duration-500 ease-in-out opacity-0"
                                    onLoad={(e) => (e.target as HTMLImageElement).classList.remove('opacity-0')}
                                />
                            </div>
                             {/* Valgfri bildetekst under bildet hvis det er relevant */}
                             {/* <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">En beskrivende bildetekst</figcaption> */}
                        </figure>
                    )}

                    {/* Innhold (med forbedret prose styling) */}
                    {content ? (
                        <div
                            // Konfigurer prose i tailwind.config.js for global styling,
                            // eller bruk spesifikke klasser her for å overstyre.
                            className="prose prose-lg lg:prose-xl max-w-none dark:prose-invert
                                       prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
                                       prose-p:leading-relaxed prose-p:text-foreground/90
                                       prose-a:text-primary hover:prose-a:text-primary/80 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                                       prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:border-border
                                       prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                                       prose-strong:text-foreground
                                       prose-code:before:content-none prose-code:after:content-none prose-code:px-1 prose-code:py-0.5 prose-code:bg-muted prose-code:rounded prose-code:text-sm
                                       prose-li:marker:text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <p className="text-muted-foreground italic mt-6">Innholdet for denne artikkelen mangler eller kunne ikke lastes.</p>
                    )}

                    {/* Valgfritt: Separator før f.eks. kommentarer eller relatert innhold */}
                    {/* <Separator className="my-12" /> */}

                </article>
            </div>
        </div>
    );
}