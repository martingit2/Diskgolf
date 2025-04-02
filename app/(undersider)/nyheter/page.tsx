"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { NewsArticle, User, UserRole, Category } from '@prisma/client';
import { Loader2, PlusCircle, Newspaper, AlertTriangle, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

// UI Components
import { Button, buttonVariants } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

// Internal Components
import { NewsFormModal } from '../_components/news-form-modal';
import { NewsCard } from '../_components/newscard';
import { NewsCardSkeleton } from '../_components/news-card-skeleton';
// --- ✨ KORREKT IMPORT HER ✨ ---


// Hooks & Utils
import { useDebounce } from '@/app/hooks/use-debounce';
import { cn } from '@/app/lib/utils';
import { FeaturedNews } from '../_components/featured-news';

// --- Type Definitions ---
type NewsArticleWithDetails = NewsArticle & {
  author: { name: string | null; image: string | null } | null;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};
type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'image' | 'role'> | null;

// --- Constants ---
const ITEMS_PER_PAGE = 9; // Antall nyheter per side

// --- Helper Components ---

// EmptyState Component
function EmptyState({
  title = "Ingen treff",
  description = "Prøv å justere søket eller filtrene dine.",
  icon: Icon = Newspaper,
  action
}: {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="my-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-gradient-to-br from-background to-slate-50 px-6 py-20 text-center shadow-sm dark:to-slate-900/30">
      <Icon className="mb-6 h-16 w-16 text-muted-foreground/40" strokeWidth={1.2} />
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// PaginationControls Component
interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
}

function PaginationControls({ currentPage, totalPages, onPageChange, isLoading }: PaginationControlsProps) {
    if (totalPages <= 1) {
        return null;
    }
    return (
        <div className="mt-10 flex items-center justify-center space-x-4 md:mt-12">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                aria-label="Forrige side"
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
                Side {currentPage} av {totalPages}
            </span>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                aria-label="Neste side"
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
    );
}


// --- Main NewsPage Component ---
export default function NewsPage() {
  // --- State Management ---
  const [newsItems, setNewsItems] = useState<NewsArticleWithDetails[]>([]);
  const [user, setUser] = useState<SessionUser>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [errorNews, setErrorNews] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleWithDetails | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null); // ID of article being acted upon (delete/publish)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search input

  // --- Derived State & Variables ---
  const isAdmin = user?.role === UserRole.ADMIN;
  // Featured articles are the first few *published* articles (only shown on page 1 without search)
  const featuredArticles = newsItems
    .filter(article => article.isPublished)
    .slice(0, 3);

  // --- Effects ---

  // Fetch user session data on mount
  useEffect(() => {
    setLoadingUser(true);
    fetch("/api/auth")
      .then((res) => (res.ok ? res.json() : Promise.reject('Response not OK')))
      .then((data) => setUser(data as SessionUser))
      .catch((err) => {
        console.error("Kunne ikke hente brukerdata:", err);
        setUser(null); // Ensure user is null on error
      })
      .finally(() => setLoadingUser(false));
   }, []); // Empty dependency array means run only once on mount

  // Fetch news articles function (memoized with useCallback)
  const fetchNews = useCallback(async (page = 1, limit = ITEMS_PER_PAGE, search = '') => {
    setLoadingNews(true);
    setErrorNews(null);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search.trim()) {
      params.append('search', search.trim());
    }
    const apiUrl = `/api/news?${params.toString()}`;

    try {
      type ApiResponse = {
        articles: NewsArticleWithDetails[];
        currentPage: number; // API should return current page
        totalArticles: number;
        limit: number; // API should return limit used
      };
      const response = await axios.get<ApiResponse>(apiUrl);
      const { articles: fetchedArticles, totalArticles, limit: responseLimit } = response.data;

      setNewsItems(fetchedArticles);
      setCurrentPage(page); // Use the requested page
      setTotalPages(Math.ceil(totalArticles / responseLimit));

    } catch (error) {
      console.error("Feil ved henting av nyheter:", error);
      const defaultError = "Kunne ikke laste nyheter. Vennligst prøv igjen.";
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message || defaultError
        : (error instanceof Error ? error.message : defaultError);
      setErrorNews(errorMessage);
      // Reset state on error
      setNewsItems([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoadingNews(false);
    }
  }, []); // No dependencies, function is stable

  // Fetch news when user data is loaded or search query changes
   useEffect(() => {
     // Only fetch news once we know if the user is an admin or not (or if session check is done)
     // and fetch when debounced search query updates.
     if (!loadingUser) {
       fetchNews(1, ITEMS_PER_PAGE, debouncedSearchQuery); // Fetch page 1 on new search
     }
     // Intentionally excluding fetchNews from dependencies because it's stable due to useCallback([])
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [loadingUser, debouncedSearchQuery]);

  // --- Event Handlers & API Interaction ---

  // Handle page changes from pagination controls
  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !loadingNews) {
          fetchNews(newPage, ITEMS_PER_PAGE, debouncedSearchQuery);
          window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
      }
  };

  // Generic API error handler for toasts
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

  // Delete article handler
  const handleDelete = useCallback(async (id: string) => {
    if (isLoadingAction) return; // Prevent double clicks
    setIsLoadingAction(id);
    try {
      await axios.delete(`/api/news/${id}`);
      // Optimistic update: Remove item immediately from UI
      setNewsItems(items => items.filter(item => item.id !== id));
      toast.success('Nyhetsartikkel slettet.');
      // Consider refetching current page or adjusting pagination if needed
      // Example: If last item on page deleted, go to previous page
      // For simplicity here, we just remove it. May need total count update.
    } catch (error) {
      handleApiError(error, 'Kunne ikke slette artikkelen.');
    } finally {
      setIsLoadingAction(null);
    }
   }, [isLoadingAction]); // Dependency: isLoadingAction

  // Toggle publish status handler
  const handleTogglePublish = useCallback(async (article: NewsArticleWithDetails) => {
    if (isLoadingAction) return;
    setIsLoadingAction(article.id);
    const newPublishState = !article.isPublished;

    try {
      // Use FormData for potential future file uploads, though only sending boolean now
      // Axios might handle simple objects fine with PUT, but FormData is robust
      const formData = new FormData();
      formData.append('isPublished', String(newPublishState));
      // Include other fields if needed by the API endpoint for partial updates

      const response = await axios.put<NewsArticleWithDetails>(`/api/news/${article.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' } // Important if using FormData
      });

      // Update item in state with the response data (which should include the updated status)
      setNewsItems(items => items.map(item => (item.id === article.id ? response.data : item)));
      toast.success(`Artikkelen ble ${newPublishState ? 'publisert' : 'avpublisert'}.`);
    } catch (error) {
      handleApiError(error, 'Kunne ikke endre publiseringsstatus.');
    } finally {
      setIsLoadingAction(null);
    }
   }, [isLoadingAction]); // Dependency: isLoadingAction

  // --- Modal Handling ---
  const openNewArticleModal = () => {
    setSelectedArticle(null); // Ensure no initial data for new article
    setIsModalOpen(true);
  };

  const openEditArticleModal = (article: NewsArticleWithDetails) => {
    setSelectedArticle(article); // Set initial data for editing
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null); // Clear selected article on close
  };

  const handleModalSuccess = () => {
    // After creating/updating, refresh the first page to see the changes.
    // If it was an edit on page > 1, the user will be navigated to page 1.
    // Alternatively, could try to refresh the *current* page, but requires
    // more complex logic if the edit changes its visibility based on filters/search.
    // Fetching page 1 is the simplest way to ensure consistency.
    fetchNews(1, ITEMS_PER_PAGE, debouncedSearchQuery);
    closeModal();
  };


  // --- Rendering Logic ---

  // Renders the main grid of news cards or status messages (loading, error, empty)
  const renderNewsContent = () => {
    // 1. Initial Loading State (Skeleton)
     if (loadingNews && newsItems.length === 0) {
        return (
            <div className="grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, index) => <NewsCardSkeleton key={`skel-${index}`} />)} {/* Justert antall skeletons */}
            </div>
        );
     }

     // 2. Error State
     if (errorNews && newsItems.length === 0) {
         return (
            <Alert variant="destructive" className="my-8">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Noe gikk galt</AlertTitle>
                <AlertDescription>
                    {errorNews}
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => fetchNews(currentPage, ITEMS_PER_PAGE, debouncedSearchQuery)} // Retry current page
                        className="ml-2 h-auto p-0 underline"
                    >
                        Prøv igjen
                    </Button>
                </AlertDescription>
            </Alert>
         );
     }

     // 3. Empty State (No results or no news yet)
     if (!loadingNews && newsItems.length === 0) {
         const isSearchActive = debouncedSearchQuery.length > 0;
         return (
            <EmptyState
                title={isSearchActive ? "Ingen treff funnet" : "Ingen nyheter publisert"}
                description={isSearchActive ? "Prøv å justere søket ditt, eller nullstill det." : "Det ser ikke ut til å være noen nyhetsartikler her ennå."}
                icon={isSearchActive ? Search : Newspaper}
                action={
                    isAdmin && !isSearchActive ? (
                        <Button
                            onClick={openNewArticleModal}
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                            )}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Opprett første artikkel
                        </Button>
                    ) : undefined // No action if not admin or if searching
                }
            />
         );
     }

     // 4. Render Regular News Items (excluding featured ones if on page 1 without search)
     const isShowingFeaturedSection = currentPage === 1 && !debouncedSearchQuery && featuredArticles.length > 0;
     const regularNewsItems = isShowingFeaturedSection
        ? newsItems.filter(article => !featuredArticles.some(featured => featured.id === article.id))
        : newsItems;


    // Only render the grid if there are regular items to display
    if (regularNewsItems.length > 0) {
      return (
        <>
          {/* "Flere Nyheter" heading only shown below featured section */}
          {isShowingFeaturedSection && (
            <div className="mt-10 border-t pt-8 md:mt-12">
               <div className="relative mb-6">
                    <span className="absolute left-0 top-0 h-full w-1 rounded-full bg-gradient-to-b from-green-500 to-emerald-600"></span>
                    <h2 className="pl-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl"> Flere Nyheter </h2>
               </div>
            </div>
          )}
          <div
             className={cn(
                 "grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3",
                 "transition-opacity duration-300", // Smooth transition when loading
                 loadingNews && newsItems.length > 0 ? "opacity-50 pointer-events-none" : "opacity-100" // Dim while loading new page, only if items exist
             )}
           >
            {regularNewsItems.map(article => (
              <NewsCard
                key={article.id}
                article={article}
                isAdmin={isAdmin}
                isLoadingAction={isLoadingAction === article.id} // Pass loading state for specific card
                onEdit={openEditArticleModal}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        </>
      );
    }
    // If only featured articles existed and were filtered out, this will return null, which is fine.
    return null;
  };


  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 md:py-16 lg:py-20">

        {/* Header Section */}
        <header className="mb-10 border-b border-gray-200 pb-8 dark:border-gray-800 md:mb-12 lg:mb-16">
             <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                 {/* Page Title */}
                 <div className="flex-1">
                   <div className="relative mb-1">
                        <span className="absolute left-0 top-0 h-full w-1 rounded-full bg-gradient-to-b from-green-500 to-emerald-600"></span>
                        <h1 className="pl-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                           Nyheter & Oppdateringer
                        </h1>
                   </div>
                  <p className="mt-2 max-w-xl text-base text-muted-foreground">
                    Hold deg oppdatert på det siste innen discgolf.
                  </p>
                </div>

                {/* Search & Actions */}
                <div className="mt-4 flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center md:mt-0 md:w-auto">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        type="search"
                        placeholder="Søk i nyheter..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10" // Padding for icons
                        aria-label="Søk i nyheter"
                    />
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
                  {/* Admin: Create Button */}
                  <div className="w-full flex-shrink-0 sm:w-auto">
                    {loadingUser ? (
                       <Skeleton className="h-10 w-full rounded-md sm:w-40" />
                    ) : isAdmin ? (
                        <Button
                            onClick={openNewArticleModal}
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                            )}
                        >
                           <PlusCircle className="mr-2 h-4 w-4" /> Opprett Nyhet
                        </Button>
                    ) : null /* Ikke vis knappen hvis ikke admin */}
                  </div>
                </div>
              </div>
        </header>

        {/* Main Content Area */}
        <main>
          {/* Featured News Section (Only on page 1, no search, if articles exist) */}
          {!loadingNews && !errorNews && featuredArticles.length > 0 && currentPage === 1 && !debouncedSearchQuery && (
            <section className="-mx-4 mb-12 border-y border-border/60 bg-gradient-to-b from-white to-slate-50 px-4 py-10 shadow-inner dark:border-border/40 dark:from-slate-900 dark:to-slate-900/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 md:mb-16 lg:mb-20">
               <div className="container mx-auto">
                    {/* --- ✨ KORREKT BRUK HER ✨ --- */}
                    {/* Bruk FeaturedNews-komponenten som tar imot listen 'articles' */}
                    <FeaturedNews articles={featuredArticles} />
               </div>
            </section>
          )}

          {/* Render the main news grid or status messages */}
          {renderNewsContent()}

          {/* Pagination */}
          <PaginationControls
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={handlePageChange}
             isLoading={loadingNews}
           />

        </main>

        {/* News Form Modal (Rendered conditionally based on isModalOpen) */}
        {isModalOpen && (
          <NewsFormModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSuccess={handleModalSuccess} // Refetches data on success
            initialData={selectedArticle} // Pass selected article for editing, or null for new
          />
        )}

      </div>
    </div>
  );
}