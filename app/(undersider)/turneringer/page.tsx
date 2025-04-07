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
import { useDebounce } from "@/app/hooks/use-debounce";
import { MapPin, CalendarDays, Users, Search, ArrowRight, Check, Trophy, ExternalLink, Loader2 } from "lucide-react";

// --- Interfaces ---
interface Tournament {
    id: string;
    name: string;
    description: string | null;
    location: string;
    startDate: string; // ISO date string from API
    endDate: string | null; // ISO date string from API or null
    status: string; // e.g., 'REGISTRATION_OPEN', 'COMPLETED'
    maxParticipants: number | null;
    image?: string | null;
    course: { id: string; name: string; location: string | null; image?: string | null; };
    organizer: { id: string; name: string | null; };
    club: { id: string; name: string; } | null;
    _count: { participants: number; };
    participants?: { id: string }[];
}
interface User { id: string; name: string | null; email: string | null; }

const ITEMS_PER_PAGE = 8; // *** VIKTIG: Må matche verdien i API-et ***

// --- Badge Utility Functions ---
// Fjernet de dupliserte definisjonene herfra

// Korrekt definisjon av getStatusBadgeVariant
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'REGISTRATION_OPEN': return 'default'; // Grønn i stil
        case 'IN_PROGRESS': return 'secondary'; // Gul i stil
        case 'COMPLETED': return 'outline'; // Grå i stil
        case 'PLANNING': return 'secondary'; // Blå i stil
        default: return 'outline'; // Sørg for default return
    }
};

// Korrekt definisjon av getStatusBadgeStyle
const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
        case 'REGISTRATION_OPEN': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
        case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
        case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700';
        case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
        default: return 'border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-500'; // Sørg for default return
    }
};

// Korrekt definisjon av getStatusText
const getStatusText = (status: string): string => {
  switch (status) {
      case 'REGISTRATION_OPEN': return 'Åpen påmelding';
      case 'IN_PROGRESS': return 'Pågår';
      case 'COMPLETED': return 'Avsluttet';
      case 'PLANNING': return 'Planlegges';
      default: return status; // Sørg for default return
  }
};


// --- Tournament Card Component Props ---
interface TournamentCardProps {
    tournament: Tournament;
    user: User | null;
    isParticipant: boolean;
    onRegisterClick: (tournamentId: string) => void;
}

// --- Tournament Card Component ---
const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, user, isParticipant, onRegisterClick }) => {
    const canRegister = user && !isParticipant && tournament.status === 'REGISTRATION_OPEN' && (!tournament.maxParticipants || (tournament._count?.participants ?? 0) < tournament.maxParticipants);
    const isFull = tournament.maxParticipants !== null && (tournament._count?.participants ?? 0) >= tournament.maxParticipants;
    const startDateFormatted = tournament.startDate ? new Date(tournament.startDate).toLocaleString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Dato ikke satt';

    return (
        <Card key={tournament.id} className="group flex flex-col md:flex-row overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800/50">
            {/* Image Section */}
            <Link href={`/tournament/${tournament.id}`} className="block md:w-64 lg:w-72 flex-shrink-0 overflow-hidden relative">
                 <Image
                    src={tournament.image || tournament.course?.image || "/placeholder-image.webp"}
                    alt={`Bilde for ${tournament.name}`}
                    width={400}
                    height={250}
                    className="object-cover w-full h-48 md:h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                    priority={false}
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent md:rounded-l-lg pointer-events-none"></div>
            </Link>

            {/* Info Section */}
            <div className="p-4 md:p-5 flex flex-col justify-between flex-1 text-gray-800 dark:text-gray-200">
                 <div className="flex-1">
                     {/* Status Badge */}
                     <div className="flex justify-end mb-2 md:mb-1">
                        <Badge variant={getStatusBadgeVariant(tournament.status)} className={`${getStatusBadgeStyle(tournament.status)} text-[11px] font-bold px-2 py-0.5`}>
                             {getStatusText(tournament.status)}
                         </Badge>
                     </div>

                    {/* Title */}
                    <Link href={`/tournament/${tournament.id}`} className="block mb-1.5 group/title">
                         <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors duration-200 line-clamp-2">
                             {tournament.name}
                         </h3>
                     </Link>

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2 mb-3">
                         <div className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="font-medium">{startDateFormatted}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="truncate">{tournament.location || 'Sted ikke satt'} (<span className="italic">{tournament.course?.name || 'Ukjent bane'}</span>)</span>
                         </div>
                         {tournament.club && (
                            <div className="flex items-center gap-1.5">
                                <Users size={14} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                <span className="truncate font-medium text-gray-600 dark:text-gray-300">{tournament.club.name}</span>
                             </div>
                         )}
                         {tournament.maxParticipants != null && (
                            <div className="flex items-center gap-1.5">
                                <Users size={14} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                <span>
                                     {(tournament._count?.participants ?? 0)} / {tournament.maxParticipants} plasser
                                     {isFull && !canRegister && tournament.status !== 'COMPLETED' ? <span className="text-red-600 dark:text-red-500 font-medium ml-1">(Fullt)</span> : ''}
                                 </span>
                             </div>
                         )}
                     </div>
                 </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center gap-3">
                     <Link href={`/tournament/${tournament.id}`}>
                         <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700/50 px-2 h-8 text-sm">
                            {tournament.status === 'COMPLETED' ? <Trophy size={14} className="mr-1.5" /> : <ExternalLink size={14} className="mr-1.5" />}
                            {tournament.status === 'COMPLETED' ? 'Resultater' : 'Detaljer'}
                        </Button>
                     </Link>
                     <div className="text-right">
                        {canRegister ? (
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 dark:text-white px-3 h-8 shadow-sm hover:shadow text-sm"
                                onClick={() => onRegisterClick(tournament.id)}
                             >
                                Meld på <ArrowRight size={14} className="ml-1" />
                             </Button>
                         ) : isParticipant ? (
                             <span className="inline-flex items-center text-xs text-green-700 dark:text-green-300 font-semibold bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full">
                                <Check size={14} className="mr-1" /> Påmeldt
                             </span>
                         ) : isFull && tournament.status !== 'COMPLETED' ? (
                            <Badge variant="secondary" className="bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 text-xs font-medium">Fulltegnet</Badge>
                         ) : tournament.status === 'COMPLETED' ? (
                             <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700 text-xs font-medium">Avsluttet</Badge>
                         ) : null }
                     </div>
                 </div>
             </div>
         </Card>
    );
};

// --- Main Page Component ---
const Turneringer = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
    const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
    const [upcomingPage, setUpcomingPage] = useState<number>(1);
    const [pastPage, setPastPage] = useState<number>(1);
    const [upcomingTotalPages, setUpcomingTotalPages] = useState<number>(1);
    const [pastTotalPages, setPastTotalPages] = useState<number>(1);
    const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
    const [isLoadingPast, setIsLoadingPast] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [user, setUser] = useState<User | null>(null);
    const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        fetch("/api/auth")
            .then((res) => (res.ok ? res.json() : null))
            .then(setUser)
            .catch(err => console.error("Failed to fetch user data:", err));
    }, []);

    const fetchTournaments = useCallback(async (page: number, search: string, tabToFetch: 'upcoming' | 'past') => {
        if (tabToFetch === 'upcoming') setIsLoadingUpcoming(true);
        else setIsLoadingPast(true);

        try {
            const apiUrl = `/api/tournaments?page=${page}&search=${encodeURIComponent(search)}&limit=${ITEMS_PER_PAGE}&filter=${tabToFetch}&includeParticipants=true`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`API Error (${response.status}) for ${apiUrl}: ${errorBody}`);
                throw new Error(`Failed to fetch ${tabToFetch} tournaments (Status: ${response.status})`);
            }

            const data = await response.json();
            if (!data || !Array.isArray(data.tournaments) || typeof data.totalPages !== 'number' || typeof data.currentPage !== 'number') {
                console.error("Invalid data format received from API:", data);
                throw new Error("Invalid data format received from API");
            }

            if (tabToFetch === 'upcoming') {
                setUpcomingTournaments(data.tournaments);
                setUpcomingTotalPages(data.totalPages);
                setUpcomingPage(data.currentPage);
            } else {
                setPastTournaments(data.tournaments);
                setPastTotalPages(data.totalPages);
                setPastPage(data.currentPage);
            }

        } catch (error) {
            console.error(`Error fetching/processing ${tabToFetch} tournaments:`, error);
            toast.error(error instanceof Error ? error.message : `Kunne ikke laste ${tabToFetch === 'upcoming' ? 'kommende' : 'tidligere'} turneringer.`);
            if (tabToFetch === 'upcoming') {
                setUpcomingTournaments([]); setUpcomingTotalPages(1); setUpcomingPage(1);
            } else {
                setPastTournaments([]); setPastTotalPages(1); setPastPage(1);
            }
        } finally {
            if (tabToFetch === 'upcoming') setIsLoadingUpcoming(false);
            else setIsLoadingPast(false);
        }
    }, []);

    useEffect(() => {
        const currentPage = activeTab === 'upcoming' ? upcomingPage : pastPage;
        fetchTournaments(currentPage, debouncedSearchTerm, activeTab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, debouncedSearchTerm, upcomingPage, pastPage, fetchTournaments]);

    const handlePageChange = (page: number, type: 'upcoming' | 'past') => {
        if (type === 'upcoming') {
            if (page !== upcomingPage) setUpcomingPage(page);
        } else {
            if (page !== pastPage) setPastPage(page);
        }
        window.scrollTo(0, 0);
    };

    const handleRegister = async () => {
        if (!user || !selectedTournamentId) return;
        setIsRegistering(true);
        try {
            const response = await fetch("/api/tournaments/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tournamentId: selectedTournamentId, playerId: user.id }),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Ukjent registreringsfeil' }));
                throw new Error(err.error || `Registrering feilet (${response.status})`);
            }
            toast.success("Påmelding vellykket!");
            setSelectedTournamentId(null);

            const currentPage = activeTab === 'upcoming' ? upcomingPage : pastPage;
            fetchTournaments(currentPage, debouncedSearchTerm, activeTab);

        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error instanceof Error ? error.message : "En feil oppstod under påmelding.");
        } finally {
            setIsRegistering(false);
        }
    };

    const handleOpenRegisterDialog = (tournamentId: string) => {
        if (!user) {
            toast.error("Du må være logget inn for å melde deg på.");
            return;
        }
        setSelectedTournamentId(tournamentId);
    };

    const selectedTournamentForDialog = upcomingTournaments.find(t => t.id === selectedTournamentId) || pastTournaments.find(t => t.id === selectedTournamentId);

    const renderPagination = (currentPage: number, totalPages: number, type: 'upcoming' | 'past') => {
        if (totalPages <= 1) return null;
        const pageNumbers: (number | string)[] = [];
        const maxPagesToShow = 5;
        const halfMax = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow + 2) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(1);
            let rangeStart = Math.max(2, currentPage - halfMax);
            let rangeEnd = Math.min(totalPages - 1, currentPage + halfMax);
            if (currentPage - halfMax <= 2) rangeEnd = Math.min(totalPages - 1, maxPagesToShow);
            if (currentPage + halfMax >= totalPages - 1) rangeStart = Math.max(2, totalPages - maxPagesToShow + 1);
            if (rangeStart > 2) pageNumbers.push('...');
            for (let i = rangeStart; i <= rangeEnd; i++) pageNumbers.push(i);
            if (rangeEnd < totalPages - 1) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }

        return (
             <div className="mt-10 flex justify-center">
                <Pagination>
                     <PaginationContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
                         <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1, type); }} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-100 dark:hover:bg-gray-700"}/>
                         </PaginationItem>
                         {pageNumbers.map((page, index) => (
                             <PaginationItem key={`${type}-${page}-${index}`}>
                                {typeof page === 'string' ? (<span className="px-1 py-2 md:px-3 text-gray-400 dark:text-gray-500 select-none">…</span>) : (
                                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page, type); }} isActive={currentPage === page} className={currentPage === page ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"}>
                                        {page}
                                    </PaginationLink>
                                )}
                             </PaginationItem>
                         ))}
                         <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1, type); }} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-100 dark:hover:bg-gray-700"}/>
                         </PaginationItem>
                     </PaginationContent>
                 </Pagination>
             </div>
         );
    };

    const renderTournamentList = (tournaments: Tournament[], isLoading: boolean, type: 'upcoming' | 'past') => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                    {[...Array(ITEMS_PER_PAGE / 2)].map((_, i) => (
                         <Card key={`skel-${type}-${i}`} className="flex flex-col md:flex-row overflow-hidden rounded-lg border dark:border-gray-700/60 bg-white dark:bg-gray-800/30">
                             <Skeleton className="h-48 md:h-auto md:w-64 lg:w-72 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                             <div className="p-5 flex-1 space-y-3">
                                <Skeleton className="h-4 w-16 ml-auto bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                                <Skeleton className="h-5 w-3/4 bg-gray-200 dark:bg-gray-500 rounded animate-pulse" />
                                <Skeleton className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                                <Skeleton className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                                <Skeleton className="h-4 w-5/6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700/50 mt-4">
                                    <Skeleton className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse" />
                                    <Skeleton className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse" />
                                 </div>
                             </div>
                         </Card>
                    ))}
                </div>
            );
        }

        if (tournaments.length === 0) {
            return (
                 <div className="text-center text-gray-500 dark:text-gray-400 mt-12 py-10 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/20">
                     <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Ingen {type === 'upcoming' ? 'kommende' : 'tidligere'} turneringer funnet</h3>
                     <p className="text-sm mt-1">{searchTerm ? 'Prøv å justere søket ditt.' : (type === 'upcoming' ? 'Sjekk tilbake senere eller opprett en ny turnering!' : 'Ingen tidligere turneringer er registrert.')}</p>
                 </div>
            );
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                {tournaments.map((tournament) => {
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 py-10 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                        Turneringer
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
                            setUpcomingPage(1);
                            setPastPage(1);
                         }}
                         className="w-full h-12 p-4 pl-12 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-base"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" size={22} />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => {
                    const newTab = value as 'upcoming' | 'past';
                    if (newTab === 'upcoming') setUpcomingPage(1);
                    else setPastPage(1);
                    setActiveTab(newTab);
                }} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-11 rounded-lg p-1 bg-gray-200/80 dark:bg-gray-700/50 mb-8">
                        <TabsTrigger value="upcoming" className="h-full rounded-[6px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800/80 data-[state=active]:shadow-md data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 font-semibold transition-all duration-200 text-gray-600 dark:text-gray-400">Kommende</TabsTrigger>
                        <TabsTrigger value="past" className="h-full rounded-[6px] data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800/80 data-[state=active]:shadow-md data-[state=active]:text-red-800 dark:data-[state=active]:text-red-400 font-semibold transition-all duration-200 text-gray-600 dark:text-gray-400">Avsluttede</TabsTrigger>
                    </TabsList>

                    {/* Innhold Kommende */}
                    <TabsContent value="upcoming">
                        {renderTournamentList(upcomingTournaments, isLoadingUpcoming, 'upcoming')}
                        {!isLoadingUpcoming && renderPagination(upcomingPage, upcomingTotalPages, 'upcoming')}
                    </TabsContent>

                    {/* Innhold Avsluttede */}
                    <TabsContent value="past">
                        {renderTournamentList(pastTournaments, isLoadingPast, 'past')}
                        {!isLoadingPast && renderPagination(pastPage, pastTotalPages, 'past')}
                    </TabsContent>
                </Tabs>

                {/* Registration Dialog */}
                <Dialog open={!!selectedTournamentId} onOpenChange={(open) => !open && setSelectedTournamentId(null)}>
                    <DialogContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 sm:max-w-[425px] rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-gray-100 text-lg font-semibold">Meld deg på {selectedTournamentForDialog?.name || 'turnering'}</DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm pt-2">
                                Bekreft at du vil melde deg på denne turneringen. Sørg for at du har lest eventuelle turneringsregler.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedTournamentForDialog && (
                            <div className="my-4 text-sm text-gray-700 dark:text-gray-300 space-y-1 border-t border-b border-gray-200 dark:border-gray-700 py-3">
                                <p><span className="font-semibold">Sted:</span> {selectedTournamentForDialog.location}</p>
                                <p><span className="font-semibold">Dato:</span> {new Date(selectedTournamentForDialog.startDate).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        )}
                        <DialogFooter className="mt-5 sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" disabled={isRegistering}>
                                    Avbryt
                                </Button>
                            </DialogClose>
                            <Button type="button" onClick={handleRegister} disabled={isRegistering} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 dark:text-white min-w-[150px]">
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