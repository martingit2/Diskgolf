"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Newspaper, AlertTriangle, Search, X } from 'lucide-react';
import { NewsArticle, User, UserRole, Category } from '@prisma/client';
import toast from 'react-hot-toast';
import { NewsFormModal } from '../_components/news-form-modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsCard } from '../_components/newscard';
import { NewsCardSkeleton } from '../_components/news-card-skeleton';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/app/hooks/use-debounce';
import { FeaturedNews } from '../_components/featured-news-card';


type NewsArticleWithDetails = NewsArticle & {
  author: { name: string | null; image: string | null } | null;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};

type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'image' | 'role'> | null;

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
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 my-12 bg-gradient-to-br from-background to-slate-50 dark:to-slate-900/30 border border-dashed rounded-xl border-border/70 shadow-sm">
      <Icon className="h-16 w-16 text-muted-foreground/40 mb-6" strokeWidth={1.2} />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsArticleWithDetails[]>([]);
  const [user, setUser] = useState<SessionUser>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorNews, setErrorNews] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleWithDetails | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isAdmin = user?.role === UserRole.ADMIN;

  const featuredArticles = newsItems
    .filter(article => article.isPublished)
    .slice(0, 3);

  useEffect(() => {
    setLoadingUser(true);
    fetch("/api/auth")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data as SessionUser))
      .catch(() => {
        console.error("Kunne ikke hente brukerdata");
        setUser(null);
      })
      .finally(() => setLoadingUser(false));
  }, []);

  const fetchNews = useCallback(async (page = 1, limit = 9, search = '', shouldAppend = false) => {
    if (!shouldAppend) {
      setLoadingNews(true);
    } else {
      setLoadingMore(true);
    }
    setErrorNews(null);

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
      setNewsItems(prev => shouldAppend ? [...prev, ...fetchedArticles] : fetchedArticles);
      setCurrentPage(page);
      setHasMore(newHasMore);

    } catch (error) {
      console.error("Feil ved henting av nyheter:", error);
      const defaultError = "Kunne ikke laste nyheter. Vennligst prøv igjen.";
      setErrorNews(
        axios.isAxiosError(error)
          ? error.response?.data?.error || defaultError
          : defaultError
      );
      if (!shouldAppend) {
        setNewsItems([]);
        setHasMore(false);
      }
    } finally {
      if (!shouldAppend) {
        setLoadingNews(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!loadingUser) {
      setNewsItems([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchNews(1, 9, debouncedSearchQuery, false);
    }
  }, [loadingUser, debouncedSearchQuery, fetchNews]);

  useEffect(() => {
    if (loadingNews || loadingMore || !hasMore || !loadMoreRef.current) return;

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchNews(currentPage + 1, 9, debouncedSearchQuery, true);
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.8,
    });

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
      observerRef.current = null;
    };
  }, [loadingNews, loadingMore, hasMore, currentPage, debouncedSearchQuery, fetchNews]);

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

  const openNewArticleModal = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const openEditArticleModal = (article: NewsArticleWithDetails) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

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
  }, []);

  const handleTogglePublish = useCallback(async (article: NewsArticleWithDetails) => {
    setIsLoadingAction(article.id);
    const newPublishState = !article.isPublished;
    try {
      const formData = new FormData();
      formData.append('isPublished', String(newPublishState));

      const response = await axios.put<NewsArticleWithDetails>(
        `/api/news/${article.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setNewsItems(items => items.map(item => item.id === article.id ? response.data : item));
      toast.success(`Artikkelen ble ${newPublishState ? 'publisert' : 'avpublisert'}.`);
    } catch (error) {
      handleApiError(error, 'Kunne ikke endre publiseringsstatus.');
    } finally {
      setIsLoadingAction(null);
    }
  }, []);

  const renderNewsContent = () => {
    if (loadingNews && newsItems.length === 0) {
      return (
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => <NewsCardSkeleton key={`skel-${index}`} />)}
        </div>
      );
    }

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
              onClick={() => fetchNews(1, 9, debouncedSearchQuery, false)}
              className="p-0 h-auto ml-2 underline"
            >
              Prøv igjen
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (!loadingNews && newsItems.length === 0) {
      const isSearchActive = debouncedSearchQuery.length > 0;
      return (
        <EmptyState
          title={isSearchActive ? "Ingen treff funnet" : "Ingen nyheter publisert"}
          description={isSearchActive ? "Prøv å justere søket ditt, eller nullstill det." : "Det ser ikke ut til å være noen nyhetsartikler her ennå."}
          icon={isSearchActive ? Search : Newspaper}
          action={isAdmin && !isSearchActive ? (
            <Button onClick={openNewArticleModal}>
              <PlusCircle className="mr-2 h-4 w-4" /> Opprett første artikkel
            </Button>
          ) : undefined}
        />
      );
    }

    const regularNewsItems = newsItems.filter(
      (article) => !featuredArticles.some(featured => featured.id === article.id)
    );

    if (regularNewsItems.length > 0) {
      return (
        <>
          {featuredArticles.length > 0 && (
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6 mt-10 md:mt-12 border-t pt-8">
              Flere Nyheter
            </h2>
          )}
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {regularNewsItems.map(article => (
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
        </>
      );
    }

    return null;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <header className="mb-10 md:mb-12 lg:mb-16 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Nyheter & Oppdateringer
              </h1>
              <p className="mt-2 text-base text-muted-foreground max-w-xl">
                Hold deg oppdatert på det siste innen discgolf.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Søk i nyheter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
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
              <div className="flex-shrink-0 w-full sm:w-auto">
                {loadingUser ? (
                  <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
                ) : isAdmin ? (
                  <Button onClick={openNewArticleModal} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Opprett Nyhet
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main>
          {!loadingNews && !errorNews && featuredArticles.length > 0 && (
            <FeaturedNews articles={featuredArticles} />
          )}

          {renderNewsContent()}

          <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-10">
            {loadingMore && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Laster flere nyheter...</span>
              </div>
            )}
            {!loadingMore && !hasMore && newsItems.length > 0 &&
              newsItems.filter(a => !featuredArticles.some(f => f.id === a.id)).length > 0 && (
              <p className="text-sm text-muted-foreground">Ingen flere nyheter å vise.</p>
            )}
          </div>
        </main>

        {isModalOpen && (
          <NewsFormModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSuccess={() => {
              fetchNews(1, 9, debouncedSearchQuery, false);
              closeModal();
            }}
            initialData={selectedArticle}
          />
        )}
      </div>
    </div>
  );
}