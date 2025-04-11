// Fil: src/app/(undersider)/turneringer/page.tsx
// Formål: Klientkomponent som viser en oversikt over discgolf-turneringer, fordelt på "Kommende" og "Avsluttede" faner. Inkluderer søk, paginering og mulighet for påmelding til turneringer.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


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
import { useDebounce } from "@/app/hooks/use-debounce"; // Verify path if issues arise
import { MapPin, CalendarDays, Users, Disc, // Using Disc icon for course
         Search, ArrowRight, Check, Trophy, ExternalLink, Loader2 } from "lucide-react";

// Data structure definitions for Tournament and User objects
interface Tournament {
    id: string;
    name: string;
    description: string | null;
    location: string;
    startDate: string; // ISO date string from API
    endDate: string | null; // ISO date string from API or null
    status: string;
    maxParticipants: number | null;
    image?: string | null;
    course: { id: string; name: string; location: string | null; image?: string | null; };
    organizer: { id: string; name: string | null; };
    club: { id: string; name: string; } | null;
    _count: { participants: number; };
    participants?: { id: string }[]; // Conditionally included based on API parameter
}
interface User { id: string; name: string | null; email: string | null; }

// Config: Number of items per page. MUST match the value in /api/tournaments/route.ts
const ITEMS_PER_PAGE = 8;

// Badge variant mapping based on tournament status
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'REGISTRATION_OPEN': return 'default';
        case 'IN_PROGRESS': return 'secondary';
        case 'COMPLETED': return 'outline';
        case 'PLANNING': return 'secondary';
        default: return 'outline';
    }
};

// Badge styling classes based on tournament status (light mode only, as per original request)
const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
        case 'REGISTRATION_OPEN': return 'bg-green-100 text-green-800 border-green-300';
        case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-300';
        case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-300';
        default: return 'border-gray-300 text-gray-500';
    }
};

// User-friendly text for tournament status codes
const getStatusText = (status: string): string => {
  switch (status) {
      case 'REGISTRATION_OPEN': return 'Åpen for påmelding';
      case 'IN_PROGRESS': return 'Underveis';
      case 'COMPLETED': return 'Avsluttet';
      case 'PLANNING': return 'Planlegging';
      default: return status;
  }
};

interface TournamentCardProps {
    tournament: Tournament;
    user: User | null;
    isParticipant: boolean;
    onRegisterClick: (tournamentId: string) => void;
}

// Renders a single tournament card
const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, user, isParticipant, onRegisterClick }) => {
    const canRegister = user && !isParticipant && tournament.status === 'REGISTRATION_OPEN' && (!tournament.maxParticipants || (tournament._count?.participants ?? 0) < tournament.maxParticipants);
    const isFull = tournament.maxParticipants !== null && (tournament._count?.participants ?? 0) >= tournament.maxParticipants;

    return (
        <Card key={tournament.id} className="group flex flex-col md:flex-row overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300">
            <Link href={`/tournament/${tournament.id}`} className="block md:w-64 lg:w-72 flex-shrink-0 overflow-hidden relative">
                <Image
                    src={tournament.image || tournament.course?.image || "/placeholder-image.webp"}
                    alt={`Bilde for ${tournament.name}`}
                    width={400}
                    height={250}
                    className="object-cover w-full h-48 md:h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                    priority={false} // Optimize LCP by setting priority=false for non-critical images
                    loading="lazy"    // Defer loading off-screen images
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:rounded-l-lg pointer-events-none"></div>
            </Link>

            <div className="p-5 flex flex-col justify-between flex-1">
                <div className="flex-1">
                    <div className="flex justify-end mb-2">
                        <Badge variant={getStatusBadgeVariant(tournament.status)} className={`${getStatusBadgeStyle(tournament.status)} text-[11px] font-bold px-2 py-0.5`}>
                            {getStatusText(tournament.status)}
                        </Badge>
                    </div>

                    <Link href={`/tournament/${tournament.id}`}>
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 mb-1.5 line-clamp-2">
                            {tournament.name}
                        </h3>
                    </Link>

                    <div className="space-y-1.5 text-xs text-gray-500 mt-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="font-medium">
                                {tournament.startDate ? new Date(tournament.startDate).toLocaleString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Dato ikke satt'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="truncate">{tournament.location || 'Sted ikke satt'}</span>
                        </div>
                        {/* Display Course on a separate line */}
                        <div className="flex items-center gap-1.5">
                            <Disc size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="truncate">{tournament.course?.name || 'Ukjent bane'}</span>
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
                        ) : null /* No action shown if user cannot register and is not participant */}
                    </div>
                </div>
            </div>
        </Card>
    );
};

// Main component for displaying the list of tournaments
const Turneringer = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    // Separate state for each tab's tournament list
    const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
    const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
    // Pagination state for each tab
    const [upcomingPage, setUpcomingPage] = useState<number>(1);
    const [pastPage, setPastPage] = useState<number>(1);
    const [upcomingTotalPages, setUpcomingTotalPages] = useState<number>(1);
    const [pastTotalPages, setPastTotalPages] = useState<number>(1);
    // Loading state specific to each tab for better UX
    const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
    const [isLoadingPast, setIsLoadingPast] = useState(false); // Only load 'upcoming' initially
    // Search state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce API calls during search input
    // User authentication state
    const [user, setUser] = useState<User | null>(null);
    // State for the registration confirmation dialog
    const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    // Fetch current user session on component mount
    useEffect(() => {
        fetch("/api/auth") // Assumes an API route exists to provide session info
            .then((res) => (res.ok ? res.json() : null))
            .then(setUser)
            .catch(err => console.error("Failed to fetch user data:", err));
    }, []);

    // Fetches tournaments for a specific tab, page, and search term from the API
    const fetchTournaments = useCallback(async (page: number, search: string, tabToFetch: 'upcoming' | 'past') => {
        // Set loading state only for the tab being fetched
        if (tabToFetch === 'upcoming') setIsLoadingUpcoming(true);
        else setIsLoadingPast(true);

        try {
            // API endpoint now handles filtering via 'filter' parameter
            const apiUrl = `/api/tournaments?page=${page}&search=${encodeURIComponent(search)}&limit=${ITEMS_PER_PAGE}&filter=${tabToFetch}&includeParticipants=true`;

            // Consider adding { cache: 'no-store' } if aggressive caching becomes an issue after deployment
            const response = await fetch(apiUrl /*, { cache: 'no-store' } */);

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`API Error (${response.status}) fetching ${tabToFetch} tournaments: ${errorBody} from ${apiUrl}`);
                throw new Error(`Failed to fetch ${tabToFetch} tournaments (Status: ${response.status})`);
            }

            const data = await response.json();
            // Basic validation of the API response structure
            if (!data || !Array.isArray(data.tournaments) || typeof data.totalPages !== 'number' || typeof data.currentPage !== 'number') {
                console.error("Invalid data format received from API:", data);
                throw new Error("Invalid data format received from API");
            }

            // Update state for the fetched tab directly from API response
            if (tabToFetch === 'upcoming') {
                setUpcomingTournaments(data.tournaments);
                setUpcomingTotalPages(data.totalPages);
                setUpcomingPage(data.currentPage); // Trust API's current page number
            } else {
                setPastTournaments(data.tournaments);
                setPastTotalPages(data.totalPages);
                setPastPage(data.currentPage); // Trust API's current page number
            }

        } catch (error) {
            console.error(`Error in fetchTournaments (${tabToFetch}):`, error);
            toast.error(error instanceof Error ? error.message : `Kunne ikke laste ${tabToFetch === 'upcoming' ? 'kommende' : 'tidligere'} turneringer.`);
            // Reset state for the specific tab on error to prevent inconsistent UI
            if (tabToFetch === 'upcoming') {
                setUpcomingTournaments([]); setUpcomingTotalPages(1); setUpcomingPage(1);
            } else {
                setPastTournaments([]); setPastTotalPages(1); setPastPage(1);
            }
        } finally {
            // Clear loading state for the fetched tab
            if (tabToFetch === 'upcoming') setIsLoadingUpcoming(false);
            else setIsLoadingPast(false);
        }
    // fetchTournaments itself has no external state dependencies, uses parameters
    }, []);

    // Effect to trigger fetching data when relevant state changes
    useEffect(() => {
        // Determine the current page number based on the active tab
        const currentPage = activeTab === 'upcoming' ? upcomingPage : pastPage;
        // Fetch data for the currently active tab
        fetchTournaments(currentPage, debouncedSearchTerm, activeTab);

    // Re-run effect when tab, search term (debounced), or pagination changes for either tab.
    // Also include fetchTournaments as it's defined with useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, debouncedSearchTerm, upcomingPage, pastPage, fetchTournaments]);

    // Handles changing the page number for a specific tab
    const handlePageChange = (page: number, type: 'upcoming' | 'past') => {
        // Update the page state for the corresponding tab
        if (type === 'upcoming') {
            // Avoid redundant fetches if page hasn't changed
            if (page !== upcomingPage) setUpcomingPage(page);
        } else {
            if (page !== pastPage) setPastPage(page);
        }
        // Scroll to top for better UX on page change
        window.scrollTo(0, 0);
    };

    // Handles the tournament registration process
    const handleRegister = async () => {
        if (!user || !selectedTournamentId) return; // Guard clauses
        setIsRegistering(true);
        try {
            // API endpoint for registration (ensure this exists and handles POST)
            const response = await fetch("/api/tournaments/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tournamentId: selectedTournamentId, playerId: user.id }),
            });
            if (!response.ok) {
                // Try to parse error message from API response
                const err = await response.json().catch(() => ({ error: 'Ukjent registreringsfeil' }));
                throw new Error(err.error || `Registrering feilet (${response.status})`);
            }
            toast.success("Påmelding vellykket!");
            setSelectedTournamentId(null); // Close the dialog

            // Re-fetch data for the currently active tab to reflect the change immediately
            const currentPage = activeTab === 'upcoming' ? upcomingPage : pastPage;
            fetchTournaments(currentPage, debouncedSearchTerm, activeTab);

        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error instanceof Error ? error.message : "En feil oppstod under påmelding.");
        } finally {
            setIsRegistering(false); // Reset loading state for the button
        }
    };

    // Opens the registration confirmation dialog if user is logged in
    const handleOpenRegisterDialog = (tournamentId: string) => {
        if (!user) {
            toast.error("Du må være logget inn for å melde deg på.");
            // Potential enhancement: Redirect to login page
            // router.push('/login?callbackUrl=/turneringer');
            return;
        }
        setSelectedTournamentId(tournamentId);
    };

    // Finds the tournament data for the dialog from the currently loaded lists
    const selectedTournamentForDialog = upcomingTournaments.find(t => t.id === selectedTournamentId) || pastTournaments.find(t => t.id === selectedTournamentId);

    // Renders the pagination controls
    const renderPagination = (currentPage: number, totalPages: number, type: 'upcoming' | 'past') => {
        if (totalPages <= 1) return null; // Don't render pagination if only one page

        // Logic to generate page numbers with ellipsis (...)
        const pageNumbers: (number | string)[] = [];
        const maxPagesToShow = 5; // How many page links to show around the current page
        const halfMax = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow + 2) { // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else { // Logic for showing ellipsis
            pageNumbers.push(1); // Always show first page
            let rangeStart = Math.max(2, currentPage - halfMax);
            let rangeEnd = Math.min(totalPages - 1, currentPage + halfMax);

            // Adjust range if near the start or end
            if (currentPage - halfMax <= 2) rangeEnd = Math.min(totalPages - 1, maxPagesToShow);
            if (currentPage + halfMax >= totalPages - 1) rangeStart = Math.max(2, totalPages - maxPagesToShow + 1);

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
                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1, type); }} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                         </PaginationItem>
                         {pageNumbers.map((page, index) => (
                             <PaginationItem key={`${type}-${page}-${index}`}>
                                {typeof page === 'string' ? (<span className="px-1 py-2 md:px-3 text-gray-400 select-none">…</span>) : (
                                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page, type); }} isActive={currentPage === page}>
                                        {page}
                                    </PaginationLink>
                                )}
                             </PaginationItem>
                         ))}
                         <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1, type); }} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                         </PaginationItem>
                     </PaginationContent>
                 </Pagination>
             </div>
         );
    };

    // Renders the list of tournaments or loading/empty state for a tab
    const renderTournamentList = (tournaments: Tournament[], isLoading: boolean, type: 'upcoming' | 'past') => {
        // Display skeletons while loading data
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                    {/* Render a few skeleton cards based on ITEMS_PER_PAGE */}
                    {[...Array(ITEMS_PER_PAGE / 2)].map((_, i) => (
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

        // Display message if no tournaments are found after loading
        if (tournaments.length === 0) {
            return (
                 <div className="text-center text-gray-500 mt-12 py-10 border border-dashed border-gray-300 rounded-lg bg-white/50">
                     <h3 className="text-lg font-medium">Ingen {type === 'upcoming' ? 'kommende' : 'tidligere'} turneringer funnet</h3>
                     <p className="text-sm mt-1">{searchTerm ? 'Prøv å justere søket ditt.' : (type === 'upcoming' ? 'Sjekk tilbake senere eller opprett en ny turnering!' : 'Ingen tidligere turneringer er registrert.')}</p>
                 </div>
            );
        }

        // Render the actual list of tournament cards
        // Client-side pagination using .slice() is NO LONGER needed here as API handles pagination.
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                {tournaments.map((tournament) => {
                    // Check participation status (requires `participants` array from API)
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

    // Main component render
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 py-10 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                        Turneringer
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Utforsk og meld deg på kommende diskgolf-turneringer, eller se resultater fra tidligere arrangementer.
                    </p>
                </div>

                <div className="mb-10 relative max-w-xl mx-auto">
                    <Input
                        type="text"
                        placeholder="Søk (navn, sted, bane, klubb...)"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            // Reset pagination for BOTH tabs on new search to start from page 1
                            setUpcomingPage(1);
                            setPastPage(1);
                         }}
                         className="w-full h-12 p-4 pl-12 border bg-white border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800 placeholder-gray-400 text-base"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={22} />
                </div>

                <Tabs value={activeTab} onValueChange={(value) => {
                    const newTab = value as 'upcoming' | 'past';
                     // Reset pagination for the newly selected tab when switching
                     if (newTab === 'upcoming') setUpcomingPage(1);
                     else setPastPage(1);
                    setActiveTab(newTab);
                }} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-11 rounded-lg p-1 bg-gray-200/80 mb-8">
                        <TabsTrigger value="upcoming" className="h-full rounded-[6px] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 font-semibold transition-all duration-200">Kommende</TabsTrigger>
                        <TabsTrigger value="past" className="h-full rounded-[6px] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-red-800 font-semibold transition-all duration-200">Avsluttede</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming">
                        {renderTournamentList(upcomingTournaments, isLoadingUpcoming, 'upcoming')}
                        {/* Only render pagination controls when not loading */}
                        {!isLoadingUpcoming && renderPagination(upcomingPage, upcomingTotalPages, 'upcoming')}
                    </TabsContent>

                    <TabsContent value="past">
                        {renderTournamentList(pastTournaments, isLoadingPast, 'past')}
                        {/* Only render pagination controls when not loading */}
                        {!isLoadingPast && renderPagination(pastPage, pastTotalPages, 'past')}
                    </TabsContent>
                </Tabs>

                {/* Dialog for Registration Confirmation */}
                <Dialog open={!!selectedTournamentId} onOpenChange={(open) => !open && setSelectedTournamentId(null)}>
                    <DialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-[425px] rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 text-lg font-semibold">Meld deg på {selectedTournamentForDialog?.name || 'turnering'}</DialogTitle>
                            <DialogDescription className="text-gray-600 text-sm pt-2">
                                Bekreft at du vil melde deg på denne turneringen. Sørg for at du har lest eventuelle turneringsregler.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-5 sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100" disabled={isRegistering}>
                                    Avbryt
                                </Button>
                            </DialogClose>
                            <Button type="button" onClick={handleRegister} disabled={isRegistering} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white min-w-[150px]">
                                {isRegistering ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Melder på... </> ) : "Bekreft påmelding"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Turneringer;