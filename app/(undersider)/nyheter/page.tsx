// app/(undersider)/nyheter/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, FileWarning, Newspaper, AlertTriangle } from 'lucide-react'; // Lagt til Newspaper, AlertTriangle
import { NewsArticle, User, UserRole } from '@prisma/client';
import toast from 'react-hot-toast';
import { NewsFormModal } from '../_components/news-form-modal';

// Importer fra riktig sti (juster om nødvendig)
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsCard } from '../_components/newscard'; // Sjekk denne stien
import { NewsCardSkeleton } from '../_components/news-card-skeleton'; // Sjekk denne stien

// Typer (uendret)
type NewsArticleWithAuthor = NewsArticle & {
  author: { name: string | null, image: string | null };
};
type SessionUser = User & { id: string; role: UserRole; } | null;

// --- Forbedret Empty State Komponent ---
// (Kan flyttes til egen fil: components/ui/empty-state.tsx e.l.)
interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ElementType;
    action?: React.ReactNode; // Kan sende inn en knapp eller annen handling
}

function EmptyState({
    title = "Ingen elementer funnet",
    description = "Det ser ut til at det ikke er noe å vise her ennå.",
    icon: Icon = Newspaper, // Bruk Newspaper som standard
    action
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 mt-8 border-2 border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800">
            <Icon className="h-16 w-16 text-muted-foreground/50 mb-5" strokeWidth={1} />
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

// --- Hovedkomponent: NewsPage ---
export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsArticleWithAuthor[]>([]);
  const [user, setUser] = useState<SessionUser>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleWithAuthor | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  // --- Data Henting (uendret i logikk, men lagt inn i useEffect) ---
  useEffect(() => {
    setLoadingUser(true);
    fetch("/api/auth")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data as SessionUser))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  const fetchNews = useCallback(async () => {
    if (loadingUser) return; // Venter på brukerinfo

    setLoadingNews(true);
    setErrorNews(null);
    const apiUrl = isAdmin ? '/api/news' : '/api/news?publishedOnly=true';
    try {
      const response = await axios.get<NewsArticleWithAuthor[]>(apiUrl);
      // Sorter etter createdAt (nyeste først) hvis APIet ikke garanterer det
      const sortedNews = response.data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNewsItems(sortedNews);
    } catch (error) {
      console.error("Feil ved henting av nyheter:", error);
      setErrorNews("En feil oppstod under lasting av nyheter. Vennligst prøv igjen.");
      setNewsItems([]);
    } finally {
      setLoadingNews(false);
    }
  }, [isAdmin, loadingUser]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // --- Handlers (uendret i logikk) ---
   const handleApiError = (error: any, defaultMessage: string) => {
        let message = defaultMessage;
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<any>;
            const fieldErrors = axiosError.response?.data?.errors;
            if (fieldErrors && typeof fieldErrors === 'object') {
                 const firstFieldName = Object.keys(fieldErrors)[0];
                if (firstFieldName && fieldErrors[firstFieldName]?._errors?.length > 0) {
                     message = fieldErrors[firstFieldName]._errors[0];
                } else {
                    message = axiosError.response?.data?.error || `${axiosError.response?.status}: ${axiosError.response?.statusText || 'Ukjent feil'}`;
                }
            } else if (axiosError.response?.data?.error) {
                message = axiosError.response.data.error;
            } else if (axiosError.response?.status) {
                 message = `Feil ${axiosError.response.status}: ${axiosError.message}`;
            } else if (axiosError.request) {
                 message = "Ingen respons fra server. Sjekk nettverket.";
            }
        } else if (error instanceof Error) {
            message = error.message;
        }
        console.error('API Error:', error);
        toast.error(message, { duration: 4000 }); // Gi litt mer tid til feilmeldingen
   };

  const openNewArticleModal = () => { setSelectedArticle(null); setIsModalOpen(true); };
  const openEditArticleModal = (article: NewsArticleWithAuthor) => { setSelectedArticle(article); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedArticle(null); }

  const handleDelete = useCallback(async (id: string) => {
    setIsLoadingAction(id);
    try {
      await axios.delete(`/api/news/${id}`);
      setNewsItems(items => items.filter(item => item.id !== id));
      toast.success('Nyhetsartikkel slettet.');
    } catch (error) {
      handleApiError(error, 'Kunne ikke slette artikkelen.');
    } finally {
      setIsLoadingAction(null);
    }
  }, []); // Stabil

  const handleTogglePublish = useCallback(async (article: NewsArticleWithAuthor) => {
    setIsLoadingAction(article.id);
    const newPublishState = !article.isPublished;
    try {
        const formData = new FormData();
        formData.append('isPublished', String(newPublishState));

        const response = await axios.put<NewsArticleWithAuthor>(`/api/news/${article.id}`, formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
        });
        setNewsItems(items => items.map(item => item.id === article.id ? response.data : item));
        toast.success(`Artikkelen ble ${newPublishState ? 'publisert' : 'avpublisert'}.`);
    } catch (error) {
        handleApiError(error, 'Kunne ikke endre publiseringsstatus.');
    } finally {
        setIsLoadingAction(null);
    }
  }, []); // Stabil

  // --- Rendering Logic ---
  const renderContent = () => {
    // Prioriter lasing av bruker og nyheter
    if (loadingUser || loadingNews) {
         return (
            <div className="grid gap-6 md:gap-8 md:grid-cols-2 xl:grid-cols-3">
              {/* Justert antall skeletons */}
              {[...Array(isAdmin ? 6 : 3)].map((_, index) => ( <NewsCardSkeleton key={index} /> ))}
            </div>
        );
    }

    // Vis feilmelding hvis noe gikk galt med nyhetshenting
    if (errorNews) {
        return (
             <Alert variant="destructive" className="border-destructive/30 bg-destructive/5 text-destructive">
                 <AlertTriangle className="h-5 w-5" strokeWidth={1.5}/>
                <AlertTitle className="font-semibold">Oisann! Noe gikk galt</AlertTitle>
                <AlertDescription>
                    {errorNews}
                     <Button variant="link" size="sm" onClick={fetchNews} className="p-0 h-auto ml-2 text-destructive hover:text-destructive/80">
                        Prøv igjen
                     </Button>
                </AlertDescription>
            </Alert>
        );
    }

    // Vis EmptyState hvis ingen nyheter finnes (etter lasting og uten feil)
     if (newsItems.length === 0) {
        // Tilpass EmptyState for nyheter, legg til Opprett-knapp for admin
        return (
            <EmptyState
                title="Ingen nyheter å vise"
                description="Det ser ikke ut til å være noen nyhetsartikler her ennå. Kom tilbake senere!"
                icon={Newspaper}
                action={isAdmin ? (
                     <Button onClick={openNewArticleModal}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Opprett første artikkel
                     </Button>
                ) : undefined} // Vis ingenting hvis ikke admin
            />
        );
     }

    // Vis nyhetskortene hvis alt er ok og det finnes nyheter
    return (
         <div className="grid gap-6 md:gap-8 md:grid-cols-2 xl:grid-cols-3">
            {newsItems.map((article) => (
                <NewsCard
                    key={article.id}
                    article={article}
                    isAdmin={isAdmin}
                    isLoadingAction={isLoadingAction === article.id}
                    onEdit={openEditArticleModal}
                    onDelete={handleDelete}
                    onTogglePublish={handleTogglePublish}
                />
            ))}
        </div>
    );
  }

  // --- Hoved-return for siden ---
  return (
    // Legg til en subtil bakgrunn og mer padding
    <div className="bg-slate-50 dark:bg-background min-h-screen">
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Sideoverskrift Seksjon */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 md:mb-12 pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 dark:text-gray-100">
                  Nyheter & Oppdateringer
                </h1>
                <p className="mt-2 text-base text-muted-foreground">
                    Hold deg oppdatert på det siste innen disc golf.
                </p>
            </div>
             {/* Admin-knapp eller Skeleton for den */}
             <div className="flex-shrink-0 pt-2 sm:pt-0">
                 {loadingUser ? (
                    <Skeleton className="h-10 w-48 rounded-md bg-muted/50" />
                 ) : isAdmin ? (
                    <Button onClick={openNewArticleModal} variant="default" size="default">
                        <PlusCircle className="mr-2 h-4 w-4" /> Opprett Nyhetsartikkel
                     </Button>
                 ) : null /* Vis ingenting hvis ikke admin */}
             </div>
          </div>

          {/* Hovedinnhold */}
          <main>
            {renderContent()}
          </main>

          {/* Modal (forblir uendret i sin egen logikk) */}
          {isModalOpen && (
            <NewsFormModal
              isOpen={isModalOpen}
              onClose={closeModal}
              onSuccess={() => {
                 fetchNews();
                 closeModal();
              }}
              initialData={selectedArticle}
            />
          )}
        </div>
     </div>
  );
}