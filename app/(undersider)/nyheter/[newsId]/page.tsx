// app/(undersider)/nyheter/[newsId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, AlertTriangle, CalendarDays, UserCircle, Tag, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { NewsArticle, Category, UserRole } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArticleMetadata } from '../../_components/article-metadata';
import { ArticleDetailSkeleton } from '../../_components/article-detail-skeleton';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NewsFormModal } from '../../_components/news-form-modal';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

type NewsDetailArticle = NewsArticle & {
    author: { name: string | null; image: string | null } | null;
    categories: Pick<Category, 'id' | 'name' | 'slug'>[]; 
  };
export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const newsId = typeof params?.newsId === 'string' ? params.newsId : undefined;

    const [article, setArticle] = useState<NewsDetailArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);

    const isAdmin = session?.user?.role === UserRole.ADMIN;

    useEffect(() => {
        if (!newsId) {
            setError("Artikkel-ID mangler i URL.");
            setLoading(false);
            return;
        }

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

    const handleDelete = async () => {
        if (!newsId || !isAdmin) return;
        
        setIsLoadingAction(true);
        try {
            await axios.delete(`/api/news/${newsId}`);
            toast.success('Artikkelen ble slettet');
            router.push('/nyheter');
        } catch (error) {
            toast.error('Kunne ikke slette artikkelen');
            console.error('Delete error:', error);
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleTogglePublish = async () => {
        if (!article || !isAdmin) return;
        
        setIsLoadingAction(true);
        try {
            const newPublishState = !article.isPublished;
            const response = await axios.put(`/api/news/${article.id}`, {
                isPublished: newPublishState
            });
            
            setArticle(response.data);
            toast.success(`Artikkelen ble ${newPublishState ? 'publisert' : 'avpublisert'}`);
        } catch (error) {
            toast.error('Kunne ikke endre publiseringsstatus');
            console.error('Toggle publish error:', error);
        } finally {
            setIsLoadingAction(false);
        }
    };

    if (loading) {
        return <ArticleDetailSkeleton />;
    }

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

    const { title, content, imageUrl, author, createdAt, publishedAt, isPublished, categories } = article;
    const displayDate = publishedAt ? new Date(publishedAt) : new Date(createdAt);
    const authorDisplay = author ?? { name: 'Ukjent forfatter', image: null };

    return (
        <div className="bg-gray-50 dark:bg-gray-950 py-12 md:py-16 lg:py-20">
            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground print:hidden -ml-3">
                        <Link href="/nyheter">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Tilbake til Nyhetsoversikt
                        </Link>
                    </Button>

                    {isAdmin && (
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleTogglePublish}
                                disabled={isLoadingAction}
                            >
                                {isLoadingAction ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : isPublished ? (
                                    <EyeOff className="mr-2 h-4 w-4" />
                                ) : (
                                    <Eye className="mr-2 h-4 w-4" />
                                )}
                                {isPublished ? 'Avpubliser' : 'Publiser'}
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsModalOpen(true)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Rediger
                            </Button>
                            
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={handleDelete}
                                disabled={isLoadingAction}
                            >
                                {isLoadingAction ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Slett
                            </Button>
                        </div>
                    )}
                </div>

                <article className="bg-card p-6 sm:p-8 md:p-12 rounded-lg shadow-lg border border-border/60 overflow-hidden">
                    {!isPublished && (
                        <Alert variant="default" className="mb-8 border-orange-400 bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700/60">
                            <AlertTriangle className="h-5 w-5 !text-orange-600 dark:!text-orange-400" />
                            <AlertTitle className="font-semibold text-base">Dette er en upublisert kladd</AlertTitle>
                            <AlertDescription className="text-sm">
                                Denne artikkelen er kun synlig for administratorer og vil ikke vises offentlig før den publiseres.
                            </AlertDescription>
                        </Alert>
                    )}

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-foreground">
                        {title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground mb-8 pb-6 border-b border-border/70">
                        <ArticleMetadata author={authorDisplay} date={displayDate} />
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

                    {imageUrl && (
                        <figure className="mb-8 md:mb-10 -mx-6 sm:-mx-8 md:-mx-12">
                            <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden shadow-inner">
                                <Image
                                    src={imageUrl}
                                    alt={`Hovedbilde for artikkelen: ${title}`}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
                                    className="transition-opacity duration-500 ease-in-out opacity-0"
                                    onLoad={(e) => (e.target as HTMLImageElement).classList.remove('opacity-0')}
                                />
                            </div>
                        </figure>
                    )}

                    {content ? (
                        <div
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
                </article>
            </div>

            <NewsFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // Refetch artikkelen etter redigering
                    setLoading(true);
                    axios.get<NewsDetailArticle>(`/api/news/${newsId}`)
                        .then(response => setArticle(response.data))
                        .catch(err => {
                            console.error('Error refetching article:', err);
                            toast.error('Kunne ikke oppdatere artikkelvisning');
                        })
                        .finally(() => setLoading(false));
                }}
                initialData={article}
            />
        </div>
    );
}