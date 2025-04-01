// app/(undersider)/nyheter/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Newspaper, AlertTriangle, Search, X } from 'lucide-react';
// --- FIKS: Legg til UserRole i importen ---
import { NewsArticle, User, UserRole, Category } from '@prisma/client';
// --- SLUTT FIKS ---
import toast from 'react-hot-toast';
import { NewsFormModal } from '../_components/news-form-modal'; // Juster sti ved behov
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsCard } from '../_components/newscard'; // Juster sti ved behov
import { NewsCardSkeleton } from '../_components/news-card-skeleton'; // Juster sti ved behov
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/app/hooks/use-debounce';


// --- VIKTIG: Oppdatert type (match med newscard.tsx) ---
type NewsArticleWithDetails = NewsArticle & {
  author: { name: string | null; image: string | null } | null;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};
// --- SLUTT VIKTIG ---

// Type for brukerdata fra /api/auth (antatt struktur)
type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'image' | 'role'> | null;


// Empty State Komponent
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

function EmptyState({
  title = "Ingen treff",
  description = "Prøv å justere søket eller filtrene dine.",
  icon: Icon = Newspaper,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 my-12 bg-gradient-to-br from-background to-slate-50 dark:to-slate-900/30 border border-dashed rounded-xl border-border/70 shadow-sm">
      <Icon className="h-16 w-16 text-muted-foreground/40 mb-6" strokeWidth={1.2} />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// Hovedkomponent for Nyhetssiden
export default function NewsPage() {
  // --- State Hooks ---
  const [newsItems, setNewsItems] = useState<NewsArticleWithDetails[]>([]);
  const [user, setUser] = useState<SessionUser>(null); // Brukerinfo
  const [loadingUser, setLoadingUser] = useState(true); // Laster brukerinfo?
  const [loadingNews, setLoadingNews] = useState(true); // Laster initiell nyhetsliste?
  const [loadingMore, setLoadingMore] = useState(false); // Laster flere nyheter (infinite scroll)?
  const [errorNews, setErrorNews] = useState<string | null>(null); // Feilmelding ved nyhetshenting
  const [isModalOpen, setIsModalOpen] = useState(false); // Er redigerings/opprettelsesmodal åpen?
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleWithDetails | null>(null); // Artikkel valgt for redigering
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null); // ID til artikkel som har en pågående handling (slett/publiser)
  const [currentPage, setCurrentPage] = useState(1); // Nåværende side for paginering
  const [hasMore, setHasMore] = useState(true); // Finnes det flere sider å laste?
  const [searchQuery, setSearchQuery] = useState(''); // Rå søketekst fra input
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounced søketekst
  const observerRef = useRef<IntersectionObserver | null>(null); // Ref for IntersectionObserver
  const loadMoreRef = useRef<HTMLDivElement | null>(null); // Ref til elementet som trigger lasting av mer
  const isAdmin = user?.role === UserRole.ADMIN; // Er brukeren admin?

  // --- Data Fetching Effects ---

  // Hent brukerdata ved første lasting
  useEffect(() => {
    setLoadingUser(true);
    fetch("/api/auth") // Antatt endpoint for å hente session/brukerinfo
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data as SessionUser))
      .catch(() => {
        console.error("Kunne ikke hente brukerdata");
        setUser(null);
      })
      .finally(() => setLoadingUser(false));
  }, []);

  // Funksjon for å hente nyheter
  const fetchNews = useCallback(async (page = 1, limit = 9, search = '', shouldAppend = false) => {
    // Sett riktig loading state
    if (!shouldAppend) {
      setLoadingNews(true); // Full reload/nytt søk
    } else {
      setLoadingMore(true); // Laster mer
    }
    setErrorNews(null); // Nullstill feil

    // Bygg API URL med parametere
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const apiUrl = `/api/news?${params.toString()}`;

    try {
      const response = await axios.get<{
        articles: NewsArticleWithDetails[];
        currentPage: number;
        hasMore: boolean;
      }>(apiUrl);

      const { articles: fetchedArticles, hasMore: newHasMore } = response.data;

      // Oppdater state basert på om vi legger til eller erstatter
      setNewsItems(prev => shouldAppend ? [...prev, ...fetchedArticles] : fetchedArticles);
      setCurrentPage(page); // Oppdater nåværende side
      setHasMore(newHasMore); // Oppdater om det finnes mer

    } catch (error) {
      console.error("Feil ved henting av nyheter:", error);
      const defaultError = "Kunne ikke laste nyheter. Vennligst prøv igjen.";
      setErrorNews(
        axios.isAxiosError(error)
          ? error.response?.data?.error || defaultError
          : defaultError
      );
      // Hvis det var en full reload som feilet, tøm listen
      if (!shouldAppend) {
        setNewsItems([]);
        setHasMore(false); // Anta ingen flere sider ved feil
      }
    } finally {
      // Skru av riktig loading state
      if (!shouldAppend) {
        setLoadingNews(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []); // Ingen avhengigheter som endres ofte her

  // Effekt for første lasting og søk
  useEffect(() => {
    // Kjør kun etter at brukerdata er (forsøkt) hentet
    if (!loadingUser) {
       // Start på nytt: tøm liste, resett side, og hent side 1
      setNewsItems([]); // Tøm eksisterende for å vise loading/skeleton
      setCurrentPage(1);
      setHasMore(true); // Anta at det finnes mer før vi henter
      fetchNews(1, 9, debouncedSearchQuery, false);
    }
    // Kjør på nytt når brukerstatus er klar eller søket endres
  }, [loadingUser, debouncedSearchQuery, fetchNews]);

  // Effekt for Infinite Scroll
  useEffect(() => {
    // Ikke sett opp observer hvis vi laster, ikke har mer data, eller ikke har et ref-element
    if (loadingNews || loadingMore || !hasMore || !loadMoreRef.current) return;

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      // Hvis elementet er synlig OG vi har mer data OG vi ikke allerede laster mer
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchNews(currentPage + 1, 9, debouncedSearchQuery, true); // Hent neste side
      }
    };

    // Opprett observer
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null, // Bruker viewport
      rootMargin: '0px',
      threshold: 0.8, // Trigger når 80% er synlig
    });

    // Observer elementet
    const currentLoadMoreRef = loadMoreRef.current; // Lagre ref i variabel for cleanup
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    // Cleanup funksjon
    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
      observerRef.current = null; // Fjern referansen til observeren
    };
    // Re-run når disse endres (spesielt viktig for `hasMore` og `loadingMore`)
  }, [loadingNews, loadingMore, hasMore, currentPage, debouncedSearchQuery, fetchNews]);


  // --- Handlers ---

  // Generisk feilhåndtering for API-kall
  const handleApiError = (error: unknown, defaultMessage: string) => {
    let message = defaultMessage;
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.error || error.message || defaultMessage;
    } else if (error instanceof Error) {
      message = error.message;
    }
    toast.error(message);
    console.error('API Error:', error);
  };

  // Åpne modal for ny artikkel
  const openNewArticleModal = () => {
    setSelectedArticle(null); // Ingen initial data
    setIsModalOpen(true);
  };

  // Åpne modal for redigering
  const openEditArticleModal = (article: NewsArticleWithDetails) => {
    setSelectedArticle(article); // Send med data for redigering
    setIsModalOpen(true);
  };

  // Lukk modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null); // Nullstill valgt artikkel
  };

  // Slett artikkel
  const handleDelete = useCallback(async (id: string) => {
    setIsLoadingAction(id); // Vis loading på det spesifikke kortet
    try {
      await axios.delete(`/api/news/${id}`);
      // Optimistisk oppdatering: Fjern fra listen umiddelbart
      setNewsItems(items => items.filter(item => item.id !== id));
      toast.success('Nyhetsartikkel slettet.');
    } catch (error) {
      handleApiError(error, 'Kunne ikke slette artikkelen.');
      // Ved feil, vil artikkelen fortsatt være borte fra UI. Vurder å legge den tilbake eller refetch.
    } finally {
      setIsLoadingAction(null); // Slutt å vise loading
    }
  }, []); // Ingen avhengigheter som endres

  // Publiser/avpubliser artikkel
  const handleTogglePublish = useCallback(async (article: NewsArticleWithDetails) => {
    setIsLoadingAction(article.id); // Vis loading på det spesifikke kortet
    const newPublishState = !article.isPublished;
    try {
       // NB: Sender FormData her. Sjekk om API-et krever dette,
       // eller om `axios.put(..., { isPublished: newPublishState })` er nok.
      const formData = new FormData();
      formData.append('isPublished', String(newPublishState)); // Send som string

      const response = await axios.put<NewsArticleWithDetails>(
        `/api/news/${article.id}`,
        formData, // Send data
        { headers: { 'Content-Type': 'multipart/form-data' } } // Sett header hvis FormData brukes
      );

      // Oppdater listen med den oppdaterte artikkelen fra API-responsen
      setNewsItems(items => items.map(item => item.id === article.id ? response.data : item));
      toast.success(`Artikkelen ble ${newPublishState ? 'publisert' : 'avpublisert'}.`);
    } catch (error) {
      handleApiError(error, 'Kunne ikke endre publiseringsstatus.');
    } finally {
      setIsLoadingAction(null); // Slutt å vise loading
    }
  }, []); // Ingen avhengigheter som endres

  // --- Rendering Logic ---

  // Bestemmer hva som skal vises i hovedområdet
  const renderNewsContent = () => {
    // 1. Viser skeletons under første lasting
    if (loadingNews && newsItems.length === 0) {
      return (
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => <NewsCardSkeleton key={`skel-${index}`} />)}
        </div>
      );
    }

    // 2. Viser feilmelding hvis henting feilet og listen er tom
    if (errorNews && newsItems.length === 0) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Noe gikk galt</AlertTitle>
          <AlertDescription>
            {errorNews}
            {/* Tillat bruker å prøve igjen */}
            <Button
              variant="link"
              size="sm"
              onClick={() => fetchNews(1, 9, debouncedSearchQuery, false)}
              className="p-0 h-auto ml-2 underline"
            >
              Prøv igjen
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    // 3. Viser "Empty State" hvis listen er tom etter lasting (enten pga ingen artikler eller søk uten treff)
    if (!loadingNews && newsItems.length === 0) {
      const isSearchActive = debouncedSearchQuery.length > 0;
      return (
        <EmptyState
          title={isSearchActive ? "Ingen treff funnet" : "Ingen nyheter publisert"}
          description={isSearchActive ? "Prøv å justere søket ditt, eller nullstill det." : "Det ser ikke ut til å være noen nyhetsartikler her ennå."}
          icon={isSearchActive ? Search : Newspaper}
          action={isAdmin && !isSearchActive ? ( // Vis "Opprett"-knapp for admin hvis det ikke er et aktivt søk
            <Button onClick={openNewArticleModal}>
              <PlusCircle className="mr-2 h-4 w-4" /> Opprett første artikkel
            </Button>
          ) : undefined}
        />
      );
    }

    // 4. Viser listen med nyhetskort
    return (
      <div className="grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {newsItems.map(article => (
          <NewsCard
            key={article.id}
            article={article}
            isAdmin={isAdmin}
            isLoadingAction={isLoadingAction === article.id} // Send kun true hvis *denne* artikkelen har en action
            onEdit={openEditArticleModal}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        ))}
      </div>
    );
  }

  // --- Hoved-return for komponenten ---
  return (
    // Omsluttende div for bakgrunn og padding
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">

        {/* Sidens Header */}
        <header className="mb-10 md:mb-12 lg:mb-16 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Tittel og beskrivelse */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Nyheter & Oppdateringer
              </h1>
              <p className="mt-2 text-base text-muted-foreground max-w-xl">
                Hold deg oppdatert på det siste innen discgolf.
              </p>
            </div>

            {/* Søkefelt og Opprett-knapp */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              {/* Søkefelt */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Søk i nyheter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10" // Padding for ikoner
                  aria-label="Søk i nyheter"
                />
                {/* Nullstill søk-knapp (vises kun når det er tekst) */}
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery('')}
                    aria-label="Nullstill søk"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {/* Opprett Nyhet-knapp (vises for admin) */}
              <div className="flex-shrink-0 w-full sm:w-auto">
                {/* Viser skeleton mens brukerdata lastes */}
                {loadingUser ? (
                  <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
                ) : isAdmin ? ( // Viser knappen hvis bruker er admin
                  <Button onClick={openNewArticleModal} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Opprett Nyhet
                  </Button>
                ) : null /* Viser ingenting hvis ikke admin */}
              </div>
            </div>
          </div>
        </header>

        {/* Hovedinnhold (liste, feil, empty state) */}
        <main>
          {renderNewsContent()}

          {/* Element for Intersection Observer og Loading More indikator */}
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-10">
            {/* Viser spinner og tekst når mer data lastes */}
            {loadingMore && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Laster flere nyheter...</span>
              </div>
            )}
            {/* Viser melding når det ikke er mer data (og vi ikke laster) */}
            {!loadingMore && !hasMore && newsItems.length > 0 && (
              <p className="text-sm text-muted-foreground">Ingen flere nyheter å vise.</p>
            )}
          </div>
        </main>

        {/* Modal for å opprette/redigere (rendres kun når isModalOpen er true) */}
        {isModalOpen && (
          <NewsFormModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSuccess={() => {
              // Etter vellykket oppretting/redigering, hent første side på nytt
              fetchNews(1, 9, debouncedSearchQuery, false);
              closeModal(); // Lukk modalen
            }}
            initialData={selectedArticle} // Send med data for redigering, eller null for ny
          />
        )}
      </div>
    </div>
  );
}