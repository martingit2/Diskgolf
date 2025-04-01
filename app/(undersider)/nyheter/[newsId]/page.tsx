// app/(undersider)/nyheter/[newsId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { ArrowLeft, FileWarning, AlertTriangle } from 'lucide-react';
import { NewsArticle } from '@prisma/client';

// --- Shadcn/UI & Egendefinerte Komponenter ---
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArticleDetailSkeleton } from '../../_components/article-detail-skeleton';
import { ArticleMetadata } from '../../_components/article-metadata';


// Type (uendret)
type NewsArticleWithAuthor = NewsArticle & {
    author: { name: string | null; image: string | null };
};

export default function NewsDetailPage() {
    const params = useParams();
    const newsId = typeof params?.newsId === 'string' ? params.newsId : null;

    const [article, setArticle] = useState<NewsArticleWithAuthor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!newsId) {
            setError('Kunne ikke finne artikkel-ID i URL-en.');
            setLoading(false);
            return;
        }

        const fetchArticle = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<NewsArticleWithAuthor>(`/api/news/${newsId}`);
                setArticle(response.data);
            } catch (err: unknown) {
                console.error('Feil ved henting av artikkel:', err);
                let errorMessage = 'En ukjent feil oppstod under henting av artikkelen.';
                 if (axios.isAxiosError(err)) {
                    const axiosError = err as AxiosError;
                    if (axiosError.response?.status === 404) {
                        errorMessage = 'Artikkelen ble ikke funnet (404).';
                    } else if (axiosError.response?.status === 403) {
                         errorMessage = 'Du har ikke tilgang til å se denne artikkelen (403). Kanskje den ikke er publisert?';
                    } else {
                        errorMessage = `Det oppstod en feil under lasting av artikkelen. (${axiosError.response?.status ?? 'Nettverksfeil'})`;
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

    // --- Rendering av Lastestatus ---
    if (loading) {

        return <ArticleDetailSkeleton />;
    }

    // --- Rendering av Feilmelding ---
    if (error) {
        return (
            <div className="container mx-auto max-w-3xl px-4 py-8">
                 <Button variant="outline" size="sm" asChild className="mb-6">
                    <Link href="/nyheter">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Tilbake til nyheter
                    </Link>
                </Button>
                {/* Forbedret feilmelding */}
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/5 text-destructive">
                    <AlertTriangle className="h-5 w-5" strokeWidth={1.5}/>
                    <AlertTitle className="font-semibold">Kunne ikke laste artikkel</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    // --- Rendering av Artikkel ---
    if (!article) {
        return (
            <div className="container mx-auto max-w-3xl px-4 py-8 text-center">
                 <Button variant="outline" size="sm" asChild className="mb-6">
                    <Link href="/nyheter">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Tilbake til nyheter
                    </Link>
                </Button>
                <p className='text-muted-foreground'>Artikkeldata er utilgjengelig.</p>
            </div>
        );
    }

    const { title, content, imageUrl, author, createdAt, publishedAt, isPublished } = article;
    // Sikrere datohåndtering
    const displayDate = (publishedAt ? new Date(publishedAt) : new Date(createdAt));

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
             {/* Tilbake-knapp */}
            <Button variant="ghost" size="sm" asChild className="mb-4 text-muted-foreground hover:text-foreground print:hidden">
                 <Link href="/nyheter">
                     <ArrowLeft className="mr-1.5 h-4 w-4" />
                     Tilbake til Nyhetsoversikt
                 </Link>
            </Button>

            {/* --- Artikkel-innhold med bedre struktur og styling --- */}
            <article className="bg-card p-6 sm:p-8 md:p-10 rounded-lg shadow-md border border-border/60">

                {/* Kladd-advarsel øverst hvis relevant */}
                {!isPublished && (
                    <Alert variant="default" className="mb-6 border-orange-300 bg-orange-50 text-orange-800">
                         <AlertTriangle className="h-4 w-4 !text-orange-600" />
                         <AlertTitle className="font-medium">Dette er en kladd</AlertTitle>
                         <AlertDescription>
                             Denne artikkelen er ikke publisert og er kun synlig for administratorer.
                         </AlertDescription>
                    </Alert>
                )}

                {/* Tittel */}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 leading-tight text-foreground">
                    {title}
                </h1>

                 {/* Metadata: Forfatter og Dato (bruker komponenten) */}
                <ArticleMetadata
                    author={author}
                    date={displayDate}
                    className="text-sm border-b pb-4 mb-6" // Litt større tekst her
                />


                {/* Bilde */}
                {imageUrl && (
                    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-8 shadow-inner bg-muted border">
                        <Image
                            src={imageUrl}
                            alt={`Bilde relatert til ${title}`} // Bedre alt-tekst
                            fill
                            style={{ objectFit: 'cover' }}
                            priority // Viktig for LCP
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
                            className="transition-opacity duration-500 ease-in-out opacity-0" // Fade inn
                            onLoad={(e) => (e.target as HTMLImageElement).classList.remove('opacity-0')}
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                        />
                    </div>
                )}

                {/* Innhold (med forbedret prose styling) */}
                {/* Husk sikkerhetsaspektet ved dangerouslySetInnerHTML! */}
                <div
                     className="prose prose-base sm:prose-lg max-w-none dark:prose-invert
                                prose-headings:tracking-tight prose-headings:font-semibold
                                prose-p:leading-relaxed
                                prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-md prose-img:shadow
                                prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-blockquote:not-italic"
                    dangerouslySetInnerHTML={{ __html: content }}
                />

            </article>
        </div>
    );
}