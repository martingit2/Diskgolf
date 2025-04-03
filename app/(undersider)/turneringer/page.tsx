// /turneringer page component (e.g., app/turneringer/page.tsx)
'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/app/hooks/use-debounce"; // Verify path
import { MapPin, CalendarDays, Users, Search, ArrowRight, Check, Trophy, ExternalLink, Loader2 } from "lucide-react";

// --- Interfaces ---
interface Tournament {
    id: string;
    name: string;
    description: string | null;
    location: string;
    startDate: string; // Expect ISO date string from API
    endDate: string | null;
    status: string;
    maxParticipants: number | null;
    image?: string | null;
    course: { id: string; name: string; location: string | null; image?: string | null; };
    organizer: { id: string; name: string | null; };
    club: { id: string; name: string; } | null;
    _count: { participants: number; };
    participants?: { id: string }[]; // List of participant IDs (ensure API provides this via includeParticipants=true)
}
interface User { id: string; name: string | null; email: string | null; }

const ITEMS_PER_PAGE = 8; // Number of tournaments to display per page

// --- Badge Utility Functions ---
// Determines the visual variant of the status badge
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'REGISTRATION_OPEN': return 'default';
        case 'IN_PROGRESS': return 'secondary';
        case 'COMPLETED': return 'outline';
        case 'PLANNING': return 'secondary';
        default: return 'outline';
    }
};
// Applies specific Tailwind classes for badge styling based on status
const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
        case 'REGISTRATION_OPEN': return 'bg-green-100 text-green-800 border-green-300';
        case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-300';
        case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-300';
        default: return 'border-gray-300 text-gray-500';
    }
};
// Translates status codes to user-friendly text
const getStatusText = (status: string): string => {
  switch (status) {
      case 'REGISTRATION_OPEN': return 'Åpen for påmelding';
      case 'IN_PROGRESS': return 'Underveis';
      case 'COMPLETED': return 'Avsluttet';
      case 'PLANNING': return 'Planlegging';
      default: return status;
  }
};

// --- Tournament Card Component Props ---
interface TournamentCardProps {
    tournament: Tournament;
    user: User | null; // Current logged-in user
    isParticipant: boolean; // Whether the current user is registered for this tournament
    onRegisterClick: (tournamentId: string) => void; // Callback when register button is clicked
}

// --- Tournament Card Component ---
const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, user, isParticipant, onRegisterClick }) => {
    // Determine if the user can register for the tournament
    const canRegister = user && !isParticipant && tournament.status === 'REGISTRATION_OPEN' && (!tournament.maxParticipants || (tournament._count?.participants ?? 0) < tournament.maxParticipants);
    // Determine if the tournament is full
    const isFull = tournament.maxParticipants !== null && (tournament._count?.participants ?? 0) >= tournament.maxParticipants;

    return (
        <Card key={tournament.id} className="group flex flex-col md:flex-row overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300">
            {/* Image Section */}
            <Link href={`/tournament/${tournament.id}`} className="block md:w-64 lg:w-72 flex-shrink-0 overflow-hidden relative">
                <Image
                    src={tournament.image || tournament.course?.image || "/placeholder-image.webp"} // Use course image or placeholder as fallback
                    alt={`Bilde for ${tournament.name}`}
                    width={400}
                    height={250}
                    className="object-cover w-full h-48 md:h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                    priority={false}
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:rounded-l-lg pointer-events-none"></div>
            </Link>

            {/* Info Section */}
            <div className="p-5 flex flex-col justify-between flex-1">
                <div className="flex-1">
                    {/* Status Badge */}
                    <div className="flex justify-end mb-2">
                        <Badge variant={getStatusBadgeVariant(tournament.status)} className={`${getStatusBadgeStyle(tournament.status)} text-[11px] font-bold px-2 py-0.5`}>
                            {getStatusText(tournament.status)}
                        </Badge>
                    </div>

                    {/* Title */}
                    <Link href={`/tournament/${tournament.id}`}>
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 mb-1.5 line-clamp-2">
                            {tournament.name}
                        </h3>
                    </Link>

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-gray-500 mt-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="font-medium">
                                {tournament.startDate ? new Date(tournament.startDate).toLocaleString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Dato ikke satt'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="truncate">{tournament.location || 'Sted ikke satt'} ({tournament.course?.name || 'Ukjent bane'})</span>
                        </div>
                        {tournament.club && (
                            <div className="flex items-center gap-1.5">
                                <Users size={14} className="flex-shrink-0 text-gray-400" />
                                <span className="truncate font-medium text-gray-600">{tournament.club.name}</span>
                            </div>
                        )}
                        {tournament.maxParticipants != null && (
                            <div className="flex items-center gap-1.5">
                                <Users size={14} className="flex-shrink-0 text-gray-400" />
                                <span>{(tournament._count?.participants ?? 0)} / {tournament.maxParticipants} plasser {isFull && !canRegister && tournament.status !== 'COMPLETED' ? <span className="text-red-600 font-medium">(Fullt)</span> : ''}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center gap-3">
                    <Link href={`/tournament/${tournament.id}`}>
                        <Button variant="ghost" size="sm" className="text-gray-900 hover:text-blue-800 hover:bg-blue-50 px-2 h-8 text-sm">
                            {tournament.status === 'COMPLETED' ? <Trophy size={14} className="mr-1.5" /> : <ExternalLink size={14} className="mr-1.5" />}
                            {tournament.status === 'COMPLETED' ? 'Resultater' : 'Detaljer'}
                        </Button>
                    </Link>
                    <div className="text-right">
                        {canRegister ? (
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white px-3 h-8 shadow-sm hover:shadow text-sm"
                                onClick={() => onRegisterClick(tournament.id)}
                            >
                                Meld på <ArrowRight size={14} className="ml-1" />
                            </Button>
                        ) : isParticipant ? (
                            <span className="inline-flex items-center text-xs text-green-700 font-semibold bg-green-100 px-2 py-1 rounded-full">
                                <Check size={14} className="mr-1" /> Påmeldt
                            </span>
                        ) : isFull && tournament.status !== 'COMPLETED' ? (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 text-xs font-medium">Fulltegnet</Badge>
                        ) : null}
                    </div>
                </div>
            </div>
        </Card>
    );
};

// --- Main Page Component ---
const Turneringer = () => {
    // State for active tab ('upcoming' or 'past')
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    // State for tournament lists (filtered client-side)
    const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
    const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
    // State for pagination
    const [upcomingPage, setUpcomingPage] = useState<number>(1);
    const [pastPage, setPastPage] = useState<number>(1);
    const [upcomingTotalPages, setUpcomingTotalPages] = useState<number>(1);
    const [pastTotalPages, setPastTotalPages] = useState<number>(1);
    // State for loading indicators
    const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
    const [isLoadingPast, setIsLoadingPast] = useState(true);
    // State for search term
    const [searchTerm, setSearchTerm] = useState<string>("");
    // State for user data
    const [user, setUser] = useState<User | null>(null);
    // State for registration dialog
    const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    // Debounced search term to reduce API calls while typing
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch user data on component mount
    useEffect(() => {
        fetch("/api/auth")
            .then((res) => (res.ok ? res.json() : null))
            .then(setUser)
            .catch(err => console.error("Failed to fetch user data:", err));
    }, []);

    // Function to fetch tournaments from the API and apply client-side date filtering
    const fetchTournaments = useCallback(async (page: number, search: string, tabContext: 'upcoming' | 'past') => {
        // Set loading indicators based on which tab initiated the fetch,
        // though both might get updated if API doesn't filter well.
        setIsLoadingUpcoming(true);
        setIsLoadingPast(true);

        try {
            // Fetch data from API. The API might do some filtering (e.g., status), but we ensure date filtering client-side.
            // Including participants is crucial for the 'isParticipant' check.
            const apiUrl = `/api/tournaments?page=${page}&search=${encodeURIComponent(search)}&limit=${ITEMS_PER_PAGE}&includeParticipants=true`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`API Error (${response.status}) for ${apiUrl}: ${errorBody}`);
                throw new Error(`Failed to fetch tournaments (Status: ${response.status})`);
            }

            const data = await response.json();
            if (!data || !Array.isArray(data.tournaments) || typeof data.totalPages !== 'number') {
                console.error("Invalid data format received from API:", data);
                throw new Error("Invalid data format received from API");
            }

            // --- Client-Side Date Filtering Logic ---
            const now = new Date();
            // Set time to 00:00:00 for accurate date comparison
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const validTournaments: Tournament[] = [];
            data.tournaments.forEach((t: Tournament) => {
                if (!t.startDate) {
                    // console.warn(`Tournament ${t.id} missing startDate. Skipping.`); // Optional logging
                    return;
                }
                try {
                    const startDate = new Date(t.startDate);
                    if (isNaN(startDate.getTime())) {
                        // console.warn(`Invalid startDate format for tournament ${t.id}: ${t.startDate}. Skipping.`); // Optional logging
                        return;
                    }
                    validTournaments.push({ ...t /* startDate: startDate */ }); // Add valid tournament
                } catch (e) {
                    console.error(`Error processing tournament date ${t.id}:`, e);
                }
            });

            // Filter into 'upcoming' (today or later) and 'past' (before today)
            const upcoming = validTournaments.filter(t => new Date(t.startDate) >= startOfToday);
            const past = validTournaments.filter(t => new Date(t.startDate) < startOfToday);

            // Update state for both lists
            setUpcomingTournaments(upcoming);
            setPastTournaments(past);

            // Calculate total pages based on the *filtered* client-side lists
            const upcomingPages = Math.ceil(upcoming.length / ITEMS_PER_PAGE) || 1;
            const pastPages = Math.ceil(past.length / ITEMS_PER_PAGE) || 1;
            setUpcomingTotalPages(upcomingPages);
            setPastTotalPages(pastPages);

            // Adjust current page if it exceeds the new total pages after filtering
            if (tabContext === 'upcoming' && page > upcomingPages) setUpcomingPage(upcomingPages);
            if (tabContext === 'past' && page > pastPages) setPastPage(pastPages);
            // If the API returned a page number, use it unless adjusted above
            // (This part might need refinement depending on exact desired pagination behavior with filtering)
            // For simplicity, we might just stick to the page number that triggered the fetch,
            // even if filtering reduces the total pages drastically for that specific page view.
            // A better approach might involve fetching *all* data for the filter and paginating entirely client-side,
            // but that's less scalable. Let's stick to API pagination awareness for now.
             if (tabContext === 'upcoming') setUpcomingPage(page);
             if (tabContext === 'past') setPastPage(page);


        } catch (error) {
            console.error("Error fetching/processing tournaments:", error);
            toast.error(error instanceof Error ? error.message : "An unknown error occurred while fetching tournaments.");
            // Reset state on error
            setUpcomingTournaments([]); setUpcomingTotalPages(1); setUpcomingPage(1);
            setPastTournaments([]); setPastTotalPages(1); setPastPage(1);
        } finally {
            // Reset both loading states as both lists might have been updated
            setIsLoadingUpcoming(false);
            setIsLoadingPast(false);
        }
     // Dependencies: fetchTournaments depends on its own definition, no external state needed here.
    }, []);

    // Effect to trigger fetch when search term, page, or active tab changes
    useEffect(() => {
        const currentPage = activeTab === 'upcoming' ? upcomingPage : pastPage;
        // Pass activeTab as context for potential page adjustments in fetchTournaments
        fetchTournaments(currentPage, debouncedSearchTerm, activeTab);
    // Re-fetch when relevant state changes. fetchTournaments is stable due to useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, debouncedSearchTerm, upcomingPage, pastPage]);

    // Handler for changing pagination page
    const handlePageChange = (page: number, type: 'upcoming' | 'past') => {
        if (type === 'upcoming') setUpcomingPage(page);
        else setPastPage(page);
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    // Handler for initiating tournament registration
    const handleRegister = async () => {
        if (!user || !selectedTournamentId) return;
        setIsRegistering(true);
        try {
            const response = await fetch("/api/tournaments/register", { // Ensure this API endpoint exists and works
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tournamentId: selectedTournamentId, playerId: user.id }),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Unknown registration error' }));
                throw new Error(err.error || `Registration failed (${response.status})`);
            }
            toast.success("Registration successful!");
            setSelectedTournamentId(null); // Close dialog
            // Re-fetch data for the current tab to update participant status immediately
            const currentPage = activeTab === 'upcoming' ? upcomingPage : pastPage;
            fetchTournaments(currentPage, debouncedSearchTerm, activeTab);
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error instanceof Error ? error.message : "An error occurred during registration.");
        } finally {
            setIsRegistering(false);
        }
    };

    // Opens the registration confirmation dialog
    const handleOpenRegisterDialog = (tournamentId: string) => {
        if (!user) {
            toast.error("You must be logged in to register.");
            // Optionally redirect to login: router.push('/login');
            return;
        }
        setSelectedTournamentId(tournamentId);
    };

    // Find the tournament data to display in the dialog
    const selectedTournamentForDialog = [...upcomingTournaments, ...pastTournaments].find(t => t.id === selectedTournamentId);

    // Helper function to render pagination controls
    const renderPagination = (currentPage: number, totalPages: number, type: 'upcoming' | 'past') => {
        if (totalPages <= 1) return null; // Don't render if only one page

        const pageNumbers: (number | string)[] = [];
        const maxPagesToShow = 5; // Max number of page links shown (excluding prev/next/ellipsis)
        const halfMax = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow + 2) { // Show all pages if not many
             for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
             pageNumbers.push(1); // Always show first page
             let rangeStart = Math.max(2, currentPage - halfMax);
             let rangeEnd = Math.min(totalPages - 1, currentPage + halfMax);

             // Adjust range if close to start or end
             if (currentPage - halfMax <= 2) rangeEnd = maxPagesToShow;
             if (currentPage + halfMax >= totalPages -1) rangeStart = totalPages - maxPagesToShow + 1;


             if (rangeStart > 2) pageNumbers.push('...'); // Ellipsis after first page

             for (let i = rangeStart; i <= rangeEnd; i++) pageNumbers.push(i);

             if (rangeEnd < totalPages - 1) pageNumbers.push('...'); // Ellipsis before last page

             pageNumbers.push(totalPages); // Always show last page
        }

        return (
            <div className="mt-10 flex justify-center">
                <Pagination>
                    <PaginationContent className="bg-white border border-gray-200 rounded-md shadow-sm">
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1, type); }}
                                aria-disabled={currentPage === 1}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                        {pageNumbers.map((page, index) => (
                             <PaginationItem key={`${type}-${page}-${index}`}>
                                {typeof page === 'string' ? (
                                    <span className="px-1 py-2 md:px-3 text-gray-400 select-none">…</span> // Use select-none for ellipsis
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); handlePageChange(page, type); }}
                                        isActive={currentPage === page}
                                    >
                                        {page}
                                    </PaginationLink>
                                )}
                             </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1, type); }}
                                aria-disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        );
    };

    // Helper function to render the list of tournaments for a tab
    const renderTournamentList = (tournaments: Tournament[], isLoading: boolean, type: 'upcoming' | 'past') => {
        // Paginate the *full* list for the current tab before rendering
        const currentPage = type === 'upcoming' ? upcomingPage : pastPage;
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedTournaments = tournaments.slice(startIndex, endIndex);

        // Loading state: Show skeletons
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                    {[...Array(ITEMS_PER_PAGE / 2)].map((_, i) => ( // Show a few skeletons
                        <Card key={`skel-${type}-${i}`} className="flex flex-col md:flex-row overflow-hidden rounded-lg border bg-white">
                            <Skeleton className="h-48 md:h-auto md:w-64 lg:w-72 bg-gray-200 animate-pulse" />
                            <div className="p-5 flex-1 space-y-3">
                                <Skeleton className="h-4 w-16 ml-auto bg-gray-300 rounded animate-pulse" />
                                <Skeleton className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                <Skeleton className="h-4 w-1/2 bg-gray-300 rounded animate-pulse" />
                                <Skeleton className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                <Skeleton className="h-4 w-5/6 bg-gray-300 rounded animate-pulse" />
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-4">
                                    <Skeleton className="h-8 w-24 bg-gray-300 rounded-md animate-pulse" />
                                    <Skeleton className="h-8 w-24 bg-gray-300 rounded-md animate-pulse" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            );
        }

        // No tournaments found (after potential filtering)
        if (tournaments.length === 0) {
            return (
                <div className="text-center text-gray-500 mt-12 py-10 border border-dashed border-gray-300 rounded-lg bg-white/50">
                    <h3 className="text-lg font-medium">Ingen {type === 'upcoming' ? 'kommende' : 'tidligere'} turneringer funnet</h3>
                    <p className="text-sm mt-1">{searchTerm ? 'Prøv å justere søket ditt eller fjern filteret.' : (type === 'upcoming' ? 'Sjekk tilbake senere for nye turneringer.' : 'Ingen tidligere turneringer er registrert.')}</p>
                </div>
            );
        }

        // Render the paginated list of tournament cards
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                {paginatedTournaments.map((tournament) => {
                    // Check if the current user is a participant
                    const isParticipant = !!user && !!tournament.participants && tournament.participants.some(p => p.id === user.id);
                    return (
                        <TournamentCard
                            key={tournament.id}
                            tournament={tournament}
                            user={user}
                            isParticipant={isParticipant}
                            onRegisterClick={handleOpenRegisterDialog}
                        />
                    );
                })}
            </div>
        );
    };

    // --- Main Component JSX ---
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 py-10 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                        Turneringer
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Utforsk og meld deg på kommende diskgolf-turneringer, eller se resultater fra tidligere arrangementer.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-10 relative max-w-xl mx-auto">
                    <Input
                        type="text"
                        placeholder="Søk (navn, sted, bane, klubb...)"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            // Reset pagination for both tabs on new search
                            setUpcomingPage(1);
                            setPastPage(1);
                         }}
                        className="w-full h-12 p-4 pl-12 border bg-white border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800 placeholder-gray-400 text-base"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={22} />
                </div>

                {/* Tabs for Upcoming/Past Tournaments */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upcoming' | 'past')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-11 rounded-lg p-1 bg-gray-200/80 mb-8">
                        <TabsTrigger value="upcoming" className="h-full rounded-[6px] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 font-semibold transition-all duration-200">Kommende</TabsTrigger>
                        <TabsTrigger value="past" className="h-full rounded-[6px] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-red-800 font-semibold transition-all duration-200">Avsluttede</TabsTrigger>
                    </TabsList>

                    {/* Content for Upcoming Tab */}
                    <TabsContent value="upcoming">
                        {renderTournamentList(upcomingTournaments, isLoadingUpcoming, 'upcoming')}
                        {renderPagination(upcomingPage, upcomingTotalPages, 'upcoming')}
                    </TabsContent>

                    {/* Content for Past Tab */}
                    <TabsContent value="past">
                        {renderTournamentList(pastTournaments, isLoadingPast, 'past')}
                        {renderPagination(pastPage, pastTotalPages, 'past')}
                    </TabsContent>
                </Tabs>

                {/* Registration Confirmation Dialog */}
                <Dialog open={!!selectedTournamentId} onOpenChange={(open) => !open && setSelectedTournamentId(null)}>
                    <DialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-[425px] rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 text-lg font-semibold">Meld deg på {selectedTournamentForDialog?.name || 'turnering'}</DialogTitle>
                            <DialogDescription className="text-gray-600 text-sm pt-2">
                                Bekreft at du vil melde deg på denne turneringen. Sørg for at du har lest eventuelle turneringsregler.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-5 sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2"> {/* Adjusted spacing for mobile */}
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100" disabled={isRegistering}>
                                    Avbryt
                                </Button>
                            </DialogClose>
                            <Button type="button" onClick={handleRegister} disabled={isRegistering} className="w-full sm:w-auto bg-gray-900 hover:bg-emerald-700 text-white min-w-[150px]">
                                {isRegistering ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Melder på...
                                    </>
                                ) : "Bekreft påmelding"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
};

export default Turneringer;