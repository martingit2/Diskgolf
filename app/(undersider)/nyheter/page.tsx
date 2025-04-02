// FILE: app/(undersider)/nyheter/page.tsx
// DEV COMMENT: High-End News Listing Page - Refactored with Separate API Calls

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { NewsArticle, User, UserRole } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, ChevronLeft, ChevronRight, AlertCircle, Newspaper, FileText, Loader } from 'lucide-react';

// UI Components
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

// Internal Components & Types
import { NewsFormModal } from '../_components/news-form-modal';
import { NewsCard } from '../_components/newscard'; // Standard card for the grid
import { NewsCardSkeleton } from '../_components/news-card-skeleton';
import { FeaturedNews } from '../_components/featured-news'; // Component using FeaturedNewsCard
import { NewsArticleWithDetails } from '../_components/featured-news-card'; // Shared type

// Hooks & Utils
import { useDebounce } from '@/app/hooks/use-debounce';
import { cn } from '@/app/lib/utils';

// --- Type Definitions ---
type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'image' | 'role'> | null;

// --- Constants ---
const ITEMS_PER_PAGE_REGULAR = 6; // Items per page for the main grid
const FEATURED_COUNT = 3;       // Number of featured articles to fetch
const DEBOUNCE_DELAY = 500;

// --- Animation Variants ---
const pageFadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } } };
const itemFadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } } };
const listStagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

// --- Helper Components ---

// Refined EmptyState
function EmptyState({ title = "Ingenting her ennå", description = "Det finnes ingen artikler som matcher dine kriterier.", icon: Icon = Newspaper, action }: { title?: string; description?: string; icon?: React.ElementType; action?: React.ReactNode }) {
    return (
        <motion.div className="flex min-h-[50vh] flex-col items-center justify-center text-center py-16" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <div className="mb-6 rounded-full bg-gray-100 p-4 dark:bg-gray-800"><Icon className="h-12 w-12 text-gray-400 dark:text-gray-500" strokeWidth={1.5} /></div>
            <h3 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="max-w-md text-base text-gray-500 dark:text-gray-400">{description}</p>
            {action && <div className="mt-8">{action}</div>}
        </motion.div>
    );
}

// Minimalist Pagination
function PaginationControls({ currentPage, totalPages, onPageChange, isLoading }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void; isLoading: boolean }) {
    if (totalPages <= 1) return null;
    const buttonClass = "h-10 w-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors";
    return (
        <motion.div className="mt-16 flex items-center justify-center space-x-4 md:mt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Button variant="ghost" size="icon" className={buttonClass} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading} aria-label="Forrige side"><ChevronLeft className="h-5 w-5" /></Button>
            <span className="min-w-[90px] text-center text-sm font-medium text-gray-600 dark:text-gray-400">Side {currentPage} av {totalPages}</span>
            <Button variant="ghost" size="icon" className={buttonClass} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading} aria-label="Neste side"><ChevronRight className="h-5 w-5" /></Button>
        </motion.div>
    );
}

// Simple Loading Spinner
function LoadingSpinner() {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-500" /></div>;
}


// --- Main NewsPage Component ---
export default function NewsPage() {
  // --- State ---
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticleWithDetails[]>([]);
  const [regularNewsItems, setRegularNewsItems] = useState<NewsArticleWithDetails[]>([]);
  const [user, setUser] = useState<SessionUser>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRegular, setLoadingRegular] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleWithDetails | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null); // For delete/publish buttons
  const [currentPage, setCurrentPage] = useState(1); // For regular items pagination
  const [totalPages, setTotalPages] = useState(1);   // For regular items pagination
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // --- Derived State ---
  const isAdmin = user?.role === UserRole.ADMIN;
  // Simplified loading check for the initial full-page spinner
  const isLoadingInitial = loadingUser || (loadingFeatured && loadingRegular && featuredArticles.length === 0 && regularNewsItems.length === 0);
  const showFeatured = featuredArticles.length > 0 && !debouncedSearchQuery && !error; // Show featured if loaded, no search, no error
  const showRegular = regularNewsItems.length > 0 && !error; // Show regular grid if loaded and no error

  // --- Effects ---

  // Fetch User Session
  useEffect(() => {
    setLoadingUser(true);
    fetch("/api/auth/session")
      .then((res) => res.ok ? res.json() : null)
      .then((session) => setUser(session?.user as SessionUser ?? null))
      .catch((err) => { console.error("Fetch user session error:", err); setUser(null); })
      .finally(() => setLoadingUser(false));
  }, []);

  // Fetch Featured Articles (Independent Call)
  const fetchFeatured = useCallback(async () => {
    console.log("API CALL: Fetching Featured Articles");
    setLoadingFeatured(true);
    // Don't reset general error here, let regular fetch handle it if needed
    try {
        // ADJUST API ENDPOINT AS NEEDED
        const response = await axios.get<{ articles: NewsArticleWithDetails[] }>(`/api/news/featured?limit=${FEATURED_COUNT}`);
        setFeaturedArticles(response.data.articles);
    } catch (fetchError) {
        console.error("DEV_ERROR: Fetching featured news failed:", fetchError);
        // Set specific error or a general one
        setError(prev => prev || "Kunne ikke laste fremhevede nyheter.");
        setFeaturedArticles([]); // Clear on error
    } finally {
        setLoadingFeatured(false);
    }
  }, []); // No dependencies needed usually

  // Fetch Regular Articles (Paginated, Searchable - Assumes API excludes featured)
  const fetchRegular = useCallback(async (page = 1, search = '') => {
    console.log(`API CALL: Fetching Regular Articles - Page: ${page}, Search: '${search}'`);
    setLoadingRegular(true);
     // Reset error *before* fetch if fetching the first page
     if (page === 1) {
        setError(null);
        // Optionally clear previous results for instant feedback on page 1 / search
        // setRegularNewsItems([]);
     }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: ITEMS_PER_PAGE_REGULAR.toString(),
    });
    if (search.trim()) {
      params.append('search', search.trim());
    }

    try {
        type RegularApiResponse = {
            articles: NewsArticleWithDetails[];
            currentPage: number;
            totalArticles: number; // Total non-featured articles matching query
            limit: number;
            totalPages: number; // API can optionally calculate this
        };
        // ADJUST API ENDPOINT AS NEEDED
        const response = await axios.get<RegularApiResponse>(`/api/news?${params.toString()}`);
        const { articles, totalArticles, limit, currentPage: apiCurrentPage, totalPages: apiTotalPages } = response.data;

        setRegularNewsItems(articles);
        setCurrentPage(apiCurrentPage || page);
        setTotalPages(apiTotalPages || Math.ceil(totalArticles / limit)); // Use API totalPages if available

    } catch (fetchError) {
        console.error("DEV_ERROR: Fetching regular news failed:", fetchError);
        setError("Kunne ikke laste nyheter."); // Set general error
        setRegularNewsItems([]); // Clear on error
        setTotalPages(1);
        setCurrentPage(1);
    } finally {
        setLoadingRegular(false);
    }
  }, []); // No complex dependencies

  // Effect to trigger initial data fetching and search changes
  useEffect(() => {
    if (!loadingUser) {
      console.log("EFFECT: User loaded or search changed. Fetching data...");
      // Fetch featured ONLY if not searching
      if (!debouncedSearchQuery) {
        fetchFeatured();
      } else {
        // Clear featured state immediately when search starts
        setFeaturedArticles([]);
        setLoadingFeatured(false); // Ensure loading state is false
      }
      // Fetch regular articles (page 1) based on search query
      fetchRegular(1, debouncedSearchQuery);
    }
  }, [loadingUser, debouncedSearchQuery, fetchFeatured, fetchRegular]); // Depend on user loading state, search term, and the fetch functions themselves

  // --- Event Handlers & API Actions ---

  const handleApiError = (error: unknown, operation: string) => {
     const message = axios.isAxiosError(error) ? (error.response?.data?.error || error.message) : (error as Error).message || 'Ukjent feil';
     toast.error(`Feil ved ${operation}: ${message}`);
     console.error(`API Error (${operation}):`, error);
  };

  // Centralized function to refresh all relevant data
  const refreshData = useCallback(() => {
    console.log("ACTION: Refreshing data...");
    // Re-fetch featured only if not currently searching
    if (!debouncedSearchQuery) {
      fetchFeatured();
    }
    // Re-fetch the current page of regular items
    fetchRegular(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery, fetchFeatured, fetchRegular]);

  // --- Admin Actions (Delete, Publish/Unpublish) ---

  const handleDelete = useCallback(async (id: string) => {
    if (isLoadingAction) return;
    setIsLoadingAction(id);
    try {
      await axios.delete(`/api/news/${id}`);
      toast.success('Artikkel slettet.');
      refreshData(); // Refresh both lists to ensure consistency
    } catch (error) {
      handleApiError(error, 'sletting');
    } finally {
      setIsLoadingAction(null);
    }
   }, [isLoadingAction, refreshData]); // Depend on refreshData

   const handleTogglePublish = useCallback(async (article: NewsArticleWithDetails) => {
    if (isLoadingAction) return;
    setIsLoadingAction(article.id);
    const newPublishState = !article.isPublished;

    // OPTIONAL: Optimistic update (more complex with two lists)
    // For simplicity, we skip optimistic update here and rely on refreshData

    try {
      await axios.patch(`/api/news/${article.id}`, { isPublished: newPublishState });
      toast.success(`Artikkel ${newPublishState ? 'publisert' : 'trukket tilbake'}.`);
      refreshData(); // Refresh both lists
    } catch (error) {
      handleApiError(error, 'publisering');
      // No need to rollback optimistic update if skipped
    } finally {
      setIsLoadingAction(null);
    }
   }, [isLoadingAction, refreshData]); // Depend on refreshData


  // --- Modal Handling ---
  const openNewArticleModal = () => { setSelectedArticle(null); setIsModalOpen(true); };
  const openEditArticleModal = (article: NewsArticleWithDetails) => { setSelectedArticle(article); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); /* Modal should reset its own internal state on close */ };
  const handleModalSuccess = () => {
    toast.success("Artikkel lagret!");
    refreshData(); // Refresh data after successful save/update
    closeModal();
  };

  // --- Rendering Logic ---
  const renderContent = () => {
    // 1. Initial Loading State (Full page spinner)
    if (isLoadingInitial && !error) {
      return <LoadingSpinner />;
    }

    // 2. Error State (If error occurred and nothing loaded)
    if (error && featuredArticles.length === 0 && regularNewsItems.length === 0) {
      return (
        <motion.div variants={itemFadeUp} initial="hidden" animate="visible">
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center py-16">
             <AlertCircle className="h-12 w-12 text-red-500 mb-6" strokeWidth={1.5} />
             <h3 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">Oops! Noe gikk galt</h3>
             <p className="max-w-md text-base text-gray-500 dark:text-gray-400 mb-8">{error}</p>
             <Button variant="outline" onClick={refreshData} className="rounded-full">Prøv igjen</Button>
          </div>
        </motion.div>
      );
    }

    // 3. Empty State (After loading, if no articles found)
    if (!loadingFeatured && !loadingRegular && featuredArticles.length === 0 && regularNewsItems.length === 0 && !error) {
       const isSearching = debouncedSearchQuery.length > 0;
       return (
         <EmptyState
           title={isSearching ? "Ingen treff funnet" : "Ingen nyheter publisert"}
           description={isSearching ? "Prøv å justere søket ditt." : "Kom tilbake senere for oppdateringer."}
           icon={isSearching ? Search : FileText}
           action={
             isAdmin && !isSearching ? (
               <Button onClick={openNewArticleModal} size="lg" className="rounded-full bg-emerald-600 px-8 py-3 text-base text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg"><Plus className="-ml-1 mr-2 h-5 w-5" /> Publiser første nyhet</Button>
             ) : isSearching ? (
               <Button variant="outline" onClick={() => setSearchQuery('')} className="rounded-full">Nullstill søk</Button>
             ) : null
           }
         />
       );
    }

    // 4. Content Display (Featured + Regular Grid)
    return (
      <>
        {/* Featured Section */}
        {/* Render if featured articles exist, not searching, and no error */}
        {showFeatured && (
             <FeaturedNews articles={featuredArticles} />
        )}

         {/* Skeleton for Featured section while loading (optional, if desired) */}
         {loadingFeatured && !showFeatured && !debouncedSearchQuery && !error && (
             <div className="mb-16 md:mb-24 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                 <Skeleton className="h-96 rounded-xl lg:col-span-2" />
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-8">
                     <Skeleton className="h-48 rounded-xl" />
                     <Skeleton className="h-48 rounded-xl" />
                 </div>
             </div>
         )}


        {/* Title Separator (Only if both sections should be visible) */}
        {showFeatured && showRegular && (
             <motion.h2
                className="my-12 text-center text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 md:my-16 md:text-4xl"
                variants={itemFadeUp} initial="hidden" animate="visible"
              >
                Flere Nyheter
             </motion.h2>
        )}

        {/* Regular News Grid */}
        {/* Render if regular items exist and no error */}
        {showRegular && (
             <motion.div
               className={cn(
                 "grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3",
                  // Fade slightly only when loading *next* page
                 (loadingRegular && currentPage > 1) ? "opacity-60" : "opacity-100"
               )}
               variants={listStagger}
               initial="hidden"
               animate="visible"
               key={`regular-grid-${currentPage}`} // Ensures stagger animation runs on page change
             >
               {regularNewsItems.map(article => (
                 <motion.div key={article.id} variants={itemFadeUp}>
                   {/* Use the STANDARD NewsCard here */}
                   <NewsCard
                     article={article}
                     isAdmin={isAdmin}
                     isLoadingAction={isLoadingAction === article.id}
                     onEdit={openEditArticleModal}
                     onDelete={handleDelete}
                     onTogglePublish={handleTogglePublish}
                     // Pass any other props needed by NewsCard
                   />
                 </motion.div>
               ))}
             </motion.div>
        )}

         {/* Skeleton placeholders while loading the NEXT page of regular items */}
         {loadingRegular && regularNewsItems.length > 0 && currentPage > 0 && (
             <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 opacity-60">
                 {[...Array(ITEMS_PER_PAGE_REGULAR)].map((_, i) => <NewsCardSkeleton key={`skel-page-${currentPage+1}-${i}`} />)}
             </div>
         )}

        {/* Pagination Controls */}
        {/* Show pagination only if there are regular items and more than one page */}
        {showRegular && totalPages > 1 && (
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                // Pass fetchRegular directly for page changes
                onPageChange={(newPage) => fetchRegular(newPage, debouncedSearchQuery)}
                isLoading={loadingRegular} // Use regular loading state
            />
        )}
      </>
    );
  };


  // --- Main Render (Header, Content, Modal) ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 sm:py-24 md:py-32">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">

        {/* Page Header (Kept from previous refinement) */}
        <motion.header
            className="mb-16 text-center md:mb-20 lg:mb-24"
            variants={pageFadeIn} initial="hidden" animate="visible"
        >
            <h1 className="text-5xl font-bold leading-tight tracking-tighter text-gray-900 dark:text-white md:text-6xl lg:text-7xl">Siste Nytt</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 md:text-xl">Hold deg oppdatert på alt som skjer i discgolf-verdenen.</p>
            <div className="mt-10 flex w-full max-w-xl mx-auto flex-col items-center gap-4 sm:flex-row">
                {/* Search Input */}
                <div className="relative flex-grow w-full">
                   <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                   <Input type="search" placeholder="Søk etter artikler..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 w-full rounded-full border-gray-200 bg-white pl-12 pr-10 text-base shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/50" aria-label="Søk i nyheter" />
                   {searchQuery && (<Button variant="ghost" size="icon" className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" onClick={() => setSearchQuery('')} aria-label="Nullstill søk"> <X className="h-5 w-5" /> </Button>)}
                </div>
                {/* Admin Button */}
                <div className="w-full flex-shrink-0 sm:w-auto">
                   {loadingUser ? (<Skeleton className="h-12 w-full rounded-full sm:w-40" />)
                    : isAdmin ? (<Button onClick={openNewArticleModal} size="lg" className="h-12 w-full sm:w-auto rounded-full bg-emerald-600 px-6 text-base text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors shadow-sm hover:shadow-md flex items-center justify-center"><Plus className="-ml-1 mr-2 h-5 w-5" /> Ny Artikkel</Button>)
                    : null}
                 </div>
            </div>
        </motion.header>

        {/* Main Content Area */}
        <main>
          {/* Use AnimatePresence for smooth transitions between states if needed, requires consistent key */}
          <AnimatePresence mode="wait">
             {/* Key helps AnimatePresence diff between states */}
             <motion.div key={isLoadingInitial ? 'loading' : error ? 'error' : (featuredArticles.length === 0 && regularNewsItems.length === 0) ? 'empty' : `content-page-${currentPage}`}>
                 {renderContent()}
             </motion.div>
          </AnimatePresence>
        </main>

        {/* News Form Modal (Conditionally rendered) */}
        {isModalOpen && (
          <NewsFormModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSuccess={handleModalSuccess}
            initialData={selectedArticle}
          />
        )}

      </div> {/* End Container */}
    </div> // End Page Wrapper
  );
}