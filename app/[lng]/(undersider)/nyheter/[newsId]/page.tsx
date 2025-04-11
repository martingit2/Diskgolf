// Fil: src/app/(undersider)/nyheter/[newsId]/page.tsx
// Formål: Viser en detaljert visning av en enkelt nyhetsartikkel. Henter artikkeldata basert på ID fra URL, viser innhold, bilde, metadata, og gir administratorer mulighet for redigering, sletting og publisering.
// Utvikler: Maria Sofie Ulvheim, Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion'; // Importer motion
import { ArrowLeft, AlertTriangle, CalendarDays, UserCircle, Tag, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { NewsArticle, Category, UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner'; // Eller 'react-hot-toast' hvis du bruker det

// UI Components
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator"; // Brukes nå

// Internal Components - Sørg for at stiene er korrekte
import { ArticleMetadata } from '../../_components/article-metadata';
import { ArticleDetailSkeleton } from '../../_components/article-detail-skeleton';
import { NewsFormModal, } from '../../_components/news-form-modal'; // Importer props

// Type Defs
type NewsDetailArticle = NewsArticle & {
    author: { name: string | null; image: string | null } | null;
    categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

const fadeInSlightlyDelayed = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1, ease: "easeInOut" } },
};

const fadeInDelayed = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeInOut" } },
};


export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const newsId = typeof params?.newsId === 'string' ? params.newsId : undefined;

    // --- State (som før) ---
    const [article, setArticle] = useState<NewsDetailArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);

    const isAdmin = session?.user?.role === UserRole.ADMIN;

    // --- Data Fetching useEffect (som før) ---
    useEffect(() => {
        // ... fetchArticle logic ...
        if (!newsId) {
             setError("Artikkel-ID mangler i URL.");
             setLoading(false);
             return;
         }
         const fetchArticle = async () => {
             setLoading(true);
             setError(null);
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
                     if (status === 404) errorMessage = apiErrorMsg || 'Artikkelen ble ikke funnet.';
                     else if (status === 403) errorMessage = apiErrorMsg || 'Du har ikke tilgang til å se denne artikkelen (Ikke publisert?).';
                     else errorMessage = apiErrorMsg || `Feil ved lasting av artikkel. (${status ?? 'Nettverksfeil'})`;
                 }
                 setError(errorMessage);
                 setArticle(null);
             } finally {
                 setLoading(false);
             }
         };
         fetchArticle();
    }, [newsId]);

    // --- Admin Actions (som før, men med små justeringer i onSuccess) ---
    const handleDelete = async () => {
        if (!newsId || !isAdmin || isLoadingAction) return;
        setIsLoadingAction(true);
        try {
            await axios.delete(`/api/news/${newsId}`);
            toast.success('Artikkelen ble slettet');
            router.push('/nyheter'); // Send brukeren tilbake
        } catch (error) {
            toast.error('Kunne ikke slette artikkelen');
            console.error('Delete error:', error);
        } finally { setIsLoadingAction(false); }
    };

    const handleTogglePublish = async () => {
        if (!article || !isAdmin || isLoadingAction) return;
        setIsLoadingAction(true);
        try {
            const newPublishState = !article.isPublished;
            // Bruker FormData for konsistens med NewsPage, selv om det ikke er strengt nødvendig her
            const formData = new FormData();
            formData.append('isPublished', String(newPublishState));
            const response = await axios.put<NewsDetailArticle>(`/api/news/${article.id}`, formData);
            setArticle(response.data); // Oppdaterer state med returnert data
            toast.success(`Artikkelen ble ${newPublishState ? 'publisert' : 'avpublisert'}`);
        } catch (error) {
            toast.error('Kunne ikke endre publiseringsstatus');
            console.error('Toggle publish error:', error);
        } finally { setIsLoadingAction(false); }
    };

     const refetchArticle = async () => {
         if (!newsId) return;
         // Enkel refetch etter modal suksess
         setLoading(true); // Vis en indikasjon mens den henter på nytt
         try {
             const response = await axios.get<NewsDetailArticle>(`/api/news/${newsId}`);
             setArticle(response.data);
         } catch (err) {
             console.error('Error refetching article after modal:', err);
             toast.error('Kunne ikke laste oppdaterte artikkeldata.');
             // Beholder den gamle 'article' state ved feil
         } finally {
             setLoading(false);
         }
     };

    // --- Loading State ---
    if (loading && !article) { // Vis kun skeleton på initiell last
        return (
             // Bruker standard page wrapper selv for skeleton
             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 px-4 sm:px-6 lg:px-8 md:py-20 lg:py-24">
                <div className="container mx-auto max-w-4xl">
                    {/* Enkel tilbakeknapp for skeleton også */}
                    <div className="mb-8">
                         <Button variant="ghost" size="sm" disabled className="text-muted-foreground/50 -ml-3">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Tilbake til Nyhetsoversikt
                         </Button>
                    </div>
                    <ArticleDetailSkeleton />
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 px-4 sm:px-6 lg:px-8 md:py-20 lg:py-24">
                <div className="container mx-auto max-w-4xl">
                    {/* Tilbakeknapp for feilvisning */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-8">
                         <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground print:hidden -ml-3">
                            <Link href="/nyheter">
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Tilbake til Nyhetsoversikt
                            </Link>
                         </Button>
                    </motion.div>
                    {/* Feilmelding */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible">
                        <Alert variant="destructive" className="border-destructive/50 bg-destructive/5 text-destructive">
                            <AlertTriangle className="h-5 w-5" strokeWidth={1.5}/>
                            <AlertTitle className="font-semibold">Kunne ikke laste artikkel</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </motion.div>
                </div>
            </div>
        );
    }

    // --- Not Found State (article is null after loading and no error) ---
    if (!article) {
        return (
             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 px-4 sm:px-6 lg:px-8 md:py-20 lg:py-24">
                <div className="container mx-auto max-w-4xl text-center">
                     {/* Tilbakeknapp */}
                     <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-8">
                         <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground print:hidden -ml-3">
                            <Link href="/nyheter">
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Tilbake til Nyhetsoversikt
                            </Link>
                         </Button>
                     </motion.div>
                     {/* Alert */}
                     <motion.div variants={fadeIn} initial="hidden" animate="visible">
                        <Alert variant="default" className="border-yellow-400 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/50">
                            <AlertTriangle className="h-5 w-5 !text-yellow-600 dark:!text-yellow-400" />
                            <AlertTitle className="font-semibold">Artikkel ikke funnet</AlertTitle>
                            <AlertDescription>Den forespurte artikkelen eksisterer ikke eller er utilgjengelig.</AlertDescription>
                        </Alert>
                     </motion.div>
                </div>
            </div>
        );
    }

    // --- Destructure article data ---
    const { title, content, imageUrl, author, createdAt, publishedAt, isPublished, categories } = article;
    const displayDate = publishedAt ? new Date(publishedAt) : new Date(createdAt);
    const authorDisplay = author ?? { name: 'Ukjent forfatter', image: null };

    // --- Main Render ---
    return (
        // Standard side-wrapper
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 px-4 sm:px-6 lg:px-8 md:py-20 lg:py-24">
            <div className="container mx-auto max-w-4xl">

                {/* --- Header: Tilbakeknapp og Admin Actions --- */}
                <motion.div
                    variants={fadeIn} initial="hidden" animate="visible"
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10"
                >
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground print:hidden -ml-3 mb-4 sm:mb-0">
                        <Link href="/nyheter">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Tilbake til Nyhetsoversikt
                        </Link>
                    </Button>

                    {isAdmin && (
                        <div className="flex flex-wrap gap-2">
                             <Button variant="outline" size="sm" onClick={handleTogglePublish} disabled={isLoadingAction} className="flex text-gray-400 items-center">
                                {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isPublished ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />)}
                                {isPublished ? 'Avpubliser' : 'Publiser'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} disabled={isLoadingAction} className="flex text-gray-400 items-center">
                                <Edit className="mr-2 h-4 w-4" /> Rediger
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoadingAction} className="flex items-center">
                                {isLoadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Slett
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* --- Artikkel Hovedinnhold --- */}
                <motion.article
                    // Gir selve artikkelen en subtil fade-in
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-card p-6 sm:p-8 md:p-10 rounded-xl shadow-lg border border-border/60 overflow-hidden" // Økt avrunding og padding
                >
                    {/* Viser advarsel hvis upublisert */}
                    {!isPublished && isAdmin && ( // Viser kun for admin
                        <motion.div variants={fadeIn} initial="hidden" animate="visible">
                            <Alert variant="default" className="mb-8 border-orange-400 bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700/60">
                                {/* ... Alert innhold som før ... */}
                            </Alert>
                        </motion.div>
                    )}

                    {/* --- Tittel og Metadata --- */}
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-8">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5 leading-tight text-foreground">
                            {title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                            <ArticleMetadata author={authorDisplay} date={displayDate} />
                            {categories && categories.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 opacity-80" />
                                    <div className="flex flex-wrap gap-1.5">
                                        {categories.map(cat => (
                                            <Badge key={cat.slug} variant="secondary" className="font-normal cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                                                <Link href={`/nyheter?category=${cat.slug}`}>{cat.name}</Link>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <Separator className="mb-8 md:mb-10" />

                    {/* --- Hero Image (Flyttet hit) --- */}
                    {imageUrl && (
                        <motion.figure
                            variants={fadeInSlightlyDelayed} initial="hidden" animate="visible"
                            className="mb-8 md:mb-10 rounded-lg overflow-hidden shadow-md border border-border/50" // Styling for bilde container
                        >
                            <div className="relative w-full aspect-[16/9] bg-muted">
                                <Image
                                    src={imageUrl}
                                    alt={`Hovedbilde for artikkelen: ${title}`}
                                    fill style={{ objectFit: 'cover' }} priority
                                    sizes="(max-width: 768px) 100vw, 896px"
                                    className="transition-opacity duration-700 ease-in-out opacity-0"
                                    onLoad={(e) => (e.target as HTMLImageElement).classList.remove('opacity-0')}
                                />
                            </div>
                        </motion.figure>
                    )}

                    {/* --- Artikkelinnhold (Prose) --- */}
                    <motion.div
                        variants={fadeInDelayed} initial="hidden" animate="visible"
                    >
                        {content ? (
                            <div
                                // Raffinerte prose-stiler
                                className="prose prose-lg lg:prose-xl max-w-none dark:prose-invert
                                           prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-20 /* For ankerlenker */
                                           prose-p:leading-relaxed prose-p:text-foreground/90
                                           prose-a:text-green-600 hover:prose-a:text-green-700 dark:prose-a:text-green-400 dark:hover:prose-a:text-green-300 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                                           prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:border-border/50
                                           prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                                           prose-strong:text-foreground prose-strong:font-semibold
                                           prose-code:before:content-none prose-code:after:content-none prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-muted prose-code:rounded prose-code:text-sm prose-code:font-mono
                                           prose-li:marker:text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            <p className="text-muted-foreground italic mt-6">Innholdet for denne artikkelen mangler eller kunne ikke lastes.</p>
                        )}
                    </motion.div>
                </motion.article>

            </div>

            {/* --- Modal (utenfor hovedflyten) --- */}
            {/* Bruker formatering fra forrige svar */}
             {article && ( // Sørger for at initialData har en verdi når modalen rendres for redigering
                 <NewsFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false); // Lukk modalen ved suksess
                        refetchArticle(); // Hent oppdaterte data
                    }}
                    initialData={isModalOpen ? article : null} // Send kun data hvis modalen er åpen for redigering
                 />
             )}
        </div>
    );
}