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
import { MapPin, CalendarDays, Users, Search, ArrowRight, Check, Trophy, ExternalLink } from "lucide-react";

// --- Interfaces ---
interface Tournament {
    id: string;
    name: string;
    description: string | null;
    location: string;
    startDate: string;
    endDate: string | null;
    status: string;
    maxParticipants: number | null;
    image?: string | null;
    course: { id: string; name: string; location: string | null; image?: string | null; };
    organizer: { id: string; name: string | null; };
    club: { id: string; name: string; } | null;
    _count: { participants: number; };
    // --- VIKTIG: APIet må inkludere denne listen med deltaker-IDer ---
    participants?: { id: string }[];
}
interface User { id: string; name: string | null; email: string | null; }

const ITEMS_PER_PAGE = 8;

// --- Hjelpefunksjoner for status-badge ---
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'REGISTRATION_OPEN': return 'default';
        case 'IN_PROGRESS': return 'secondary';
        case 'COMPLETED': return 'outline';
        case 'PLANNING': return 'secondary';
        default: return 'outline';
    }
};
const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
        case 'REGISTRATION_OPEN': return 'bg-green-100 text-green-800 border-green-300';
        case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-300';
        case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-300';
        default: return 'border-gray-300 text-gray-500';
    }
};
const getStatusText = (status: string): string => {
  switch (status) {
      case 'REGISTRATION_OPEN': 
          return 'Åpen for påmelding';
      case 'IN_PROGRESS': 
          return 'Underveis';
      case 'COMPLETED': 
          return 'Avsluttet';
      case 'PLANNING': 
          return 'Planlegging';
      default: 
          return status;
  }
};

// --- Props for Turneringskort ---
interface TournamentCardProps {
    tournament: Tournament;
    user: User | null;
    // --- FIX: Legg til isParticipant her ---
    isParticipant: boolean;
    onRegisterClick: (tournamentId: string) => void;
}

// --- Redesignet Turneringskort ---
const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, user, isParticipant, onRegisterClick }) => {
    const canRegister = user && !isParticipant && tournament.status === 'REGISTRATION_OPEN' && (!tournament.maxParticipants || tournament._count.participants < tournament.maxParticipants);
    const isFull = tournament.maxParticipants !== null && tournament._count.participants >= tournament.maxParticipants;

    return (
        <Card key={tournament.id} className="group flex flex-col md:flex-row overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300">
            {/* Bilde-seksjon */}
            <Link href={`/tournament/${tournament.id}`} className="block md:w-64 lg:w-72 flex-shrink-0 overflow-hidden relative">
                <Image
                    src={tournament.image || tournament.course.image || "/placeholder-image.webp"}
                    alt={`Bilde for ${tournament.name}`}
                    width={400}
                    height={250}
                    className="object-cover w-full h-48 md:h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:rounded-l-lg pointer-events-none"></div>
            </Link>

            {/* Info-seksjon */}
            <div className="p-5 flex flex-col justify-between flex-1">
                <div className="flex-1">
                    {/* Status Badge */}
                    <div className="flex justify-end">
                        <Badge variant={getStatusBadgeVariant(tournament.status)} className={`${getStatusBadgeStyle(tournament.status)} text-[11px] font-bold px-2 py-0.5`}>
                            {getStatusText(tournament.status)}
                        </Badge>
                    </div>

                    {/* Tittel */}
                    <Link href={`/tournament/${tournament.id}`}>
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 mb-1.5 line-clamp-2 pr-16 md:pr-0">
                            {tournament.name}
                        </h3>
                    </Link>

                    {/* Viktige Detaljer */}
                    <div className="space-y-1.5 text-xs text-gray-500 mt-2 mb-3">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="font-medium">{new Date(tournament.startDate).toLocaleString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="truncate">{tournament.location} ({tournament.course.name})</span>
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
                                <span>{tournament._count.participants} / {tournament.maxParticipants} plasser {isFull && !canRegister && tournament.status !== 'COMPLETED' ? <span className="text-red-600 font-medium">(Fullt)</span> : ''}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Handlinger (Knapper) */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center gap-3">
                    {/* Venstre side */}
                    <Link href={`/tournament/${tournament.id}`}>
                        <Button variant="ghost" size="sm" className="text-gray-900 hover:text-blue-800 hover:bg-blue-50 px-2 h-8 text-sm">
                            {tournament.status === 'COMPLETED' ? <Trophy size={14} className="mr-1.5" /> : <ExternalLink size={14} className="mr-1.5" />}
                            {tournament.status === 'COMPLETED' ? 'Resultater' : 'Detaljer'}
                        </Button>
                    </Link>

                    {/* Høyre side */}
                    <div className="text-right">
                        {canRegister ? (
                            <Button
                                size="sm"
                                className="bg-gray-900 hover:bg-green-700 text-white px-3 h-8 shadow-sm hover:shadow text-sm"
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
}

// --- Hovedsidekomponent ---
const Turneringer = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
    const [pastTournaments, setPastTournaments] = useState<Tournament[]>([]);
    const [upcomingPage, setUpcomingPage] = useState<number>(1);
    const [pastPage, setPastPage] = useState<number>(1);
    const [upcomingTotalPages, setUpcomingTotalPages] = useState<number>(1);
    const [pastTotalPages, setPastTotalPages] = useState<number>(1);
    const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
    const [isLoadingPast, setIsLoadingPast] = useState(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [user, setUser] = useState<User | null>(null);
    const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Hent brukerdata
    useEffect(() => {
        fetch("/api/auth")
            .then((res) => (res.ok ? res.json() : null))
            .then(setUser);
    }, []);

    // Hent turneringer med filtrering basert på dagens dato
    const fetchTournaments = useCallback(async (page: number, search: string, filter: 'upcoming' | 'past') => {
        if (filter === 'upcoming') setIsLoadingUpcoming(true);
        else setIsLoadingPast(true);

        try {
            // Antar at APIet støtter &includeParticipants=true og returnerer participants med id
            const response = await fetch(`/api/tournaments?page=${page}&search=${encodeURIComponent(search)}&limit=${ITEMS_PER_PAGE}&filter=${filter}&includeParticipants=true`);
            if (!response.ok) throw new Error(`Kunne ikke hente ${filter} turneringer`);
            const data = await response.json();
            if (!data.tournaments || typeof data.totalPages !== 'number') throw new Error("Ugyldig data mottatt");

            const now = new Date();
            if (filter === 'upcoming') {
                // Bare inkluder turneringer med startdato i dag eller senere
                const filtered = data.tournaments.filter((t: Tournament) => new Date(t.startDate) >= now);
                setUpcomingTournaments(filtered);
                setUpcomingTotalPages(data.totalPages);
                setUpcomingPage(data.currentPage);
            } else {
                // Inkluder kun turneringer med startdato før i dag
                const filtered = data.tournaments.filter((t: Tournament) => new Date(t.startDate) < now);
                setPastTournaments(filtered);
                setPastTotalPages(data.totalPages);
                setPastPage(data.currentPage);
            }
        } catch (error) {
            console.error("Feil ved henting av turneringer:", error);
            toast.error(error instanceof Error ? error.message : "En ukjent feil oppstod ved henting av turneringer.");
            if (filter === 'upcoming') { setUpcomingTournaments([]); setUpcomingTotalPages(1); }
            else { setPastTournaments([]); setPastTotalPages(1); }
        } finally {
            if (filter === 'upcoming') setIsLoadingUpcoming(false);
            else setIsLoadingPast(false);
        }
    }, []);

    // Effekt for å hente data
    useEffect(() => {
        if (activeTab === 'upcoming') {
            fetchTournaments(upcomingPage, debouncedSearchTerm, 'upcoming');
        } else {
            fetchTournaments(pastPage, debouncedSearchTerm, 'past');
        }
    }, [activeTab, debouncedSearchTerm, upcomingPage, pastPage, fetchTournaments]);

    // Paginering Handler
    const handlePageChange = (page: number, type: 'upcoming' | 'past') => {
        if (type === 'upcoming') setUpcomingPage(page);
        else setPastPage(page);
        window.scrollTo(0, 0); // Scroll til toppen ved sidebytte
    };

    // Påmelding Handler
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
                const err = await response.json();
                throw new Error(err.error || "Påmelding feilet");
            }
            toast.success("Du er nå påmeldt!");
            setSelectedTournamentId(null);
            // Re-fetch den aktive taben for å oppdatere 'Påmeldt'-status umiddelbart
            fetchTournaments(activeTab === 'upcoming' ? upcomingPage : pastPage, debouncedSearchTerm, activeTab);
        } catch (error) {
            console.error("Feil ved påmelding:", error);
            toast.error(error instanceof Error ? error.message : "En feil oppstod ved påmelding.");
        } finally {
            setIsRegistering(false);
        }
    };

    const handleOpenRegisterDialog = (tournamentId: string) => {
        setSelectedTournamentId(tournamentId);
    };
    const selectedTournamentForDialog = [...upcomingTournaments, ...pastTournaments].find(t => t.id === selectedTournamentId);

    // Hjelpefunksjon for Paginering
    const renderPagination = (currentPage: number, totalPages: number, type: 'upcoming' | 'past') => {
        if (totalPages <= 1) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        const pagesToShow = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);
        let lastShown = 0;

        return (
            <div className="mt-10 flex justify-center">
                <Pagination>
                    <PaginationContent className="bg-white border border-gray-200 rounded-md shadow-sm">
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1, type); }}
                                aria-disabled={currentPage === 1}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                            />
                        </PaginationItem>
                        {pagesToShow.map(pageNumber => {
                            const showEllipsis = lastShown > 0 && pageNumber > lastShown + 1;
                            lastShown = pageNumber;
                            return (
                                <React.Fragment key={`${type}-${pageNumber}`}>
                                    {showEllipsis && <PaginationItem><span className="px-3 py-2 text-gray-400">…</span></PaginationItem>}
                                    <PaginationItem>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); handlePageChange(pageNumber, type); }}
                                            isActive={currentPage === pageNumber}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                </React.Fragment>
                            );
                        })}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1, type); }}
                                aria-disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        );
    };

    // Hjelpefunksjon for Turneringsliste
    const renderTournamentList = (tournaments: Tournament[], isLoading: boolean, type: 'upcoming' | 'past') => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                    {[...Array(ITEMS_PER_PAGE / 2)].map((_, i) => (
                        <Card key={`skel-${type}-${i}`} className="flex flex-col md:flex-row overflow-hidden rounded-lg border bg-white">
                            <Skeleton className="h-48 md:h-auto md:w-64 lg:w-72 bg-gray-200" />
                            <div className="p-5 flex-1 space-y-2.5">
                                <Skeleton className="h-4 w-16 ml-auto bg-gray-300 rounded" />
                                <Skeleton className="h-5 w-3/4 bg-gray-200 rounded" />
                                <Skeleton className="h-4 w-1/2 bg-gray-300 rounded" />
                                <Skeleton className="h-4 w-full bg-gray-300 rounded" />
                                <Skeleton className="h-4 w-5/6 bg-gray-300 rounded" />
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                                    <Skeleton className="h-8 w-24 bg-gray-300 rounded-md" />
                                    <Skeleton className="h-8 w-24 bg-gray-300 rounded-md" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            );
        }
        if (tournaments.length === 0) {
            return (
                <div className="text-center text-gray-500 mt-12 py-10 border border-dashed border-gray-300 rounded-lg bg-white/50">
                    <h3 className="text-lg font-medium">Ingen {type === 'upcoming' ? 'kommende' : 'tidligere'} turneringer funnet</h3>
                    <p className="text-sm mt-1">{searchTerm ? 'Prøv å justere søket ditt.' : 'Sjekk tilbake senere.'}</p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                {tournaments.map((tournament) => {
                    // Beregn isParticipant her basert på data fra API
                    const isParticipant = !!user && !!tournament.participants?.some(p => p.id === user.id);
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

    // --- Hoved-JSX ---
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 py-10 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                        Turneringer
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Utforsk og meld deg på kommende diskgolf-turneringer, eller se resultater fra tidligere arrangementer.
                    </p>
                </div>

                {/* Søkefelt */}
                <div className="mb-10 relative max-w-xl mx-auto">
                    <Input
                        type="text"
                        placeholder="Søk (navn, sted, bane, klubb...)"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setUpcomingPage(1); setPastPage(1); }}
                        className="w-full h-12 p-4 pl-12 border bg-white border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800 placeholder-gray-400 text-base"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={22} />
                </div>

                {/* Tabs for Kommende/Tidligere */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upcoming' | 'past')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-11 rounded-lg p-1 bg-gray-200/80 mb-8">
                        <TabsTrigger value="upcoming" className="h-full rounded-[6px] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 font-semibold transition-all duration-200">Kommende</TabsTrigger>
                        <TabsTrigger value="past" className="h-full rounded-[6px] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 font-semibold transition-all duration-200">Tidligere</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming">
                        {renderTournamentList(upcomingTournaments, isLoadingUpcoming, 'upcoming')}
                        {renderPagination(upcomingPage, upcomingTotalPages, 'upcoming')}
                    </TabsContent>

                    <TabsContent value="past">
                        {renderTournamentList(pastTournaments, isLoadingPast, 'past')}
                        {renderPagination(pastPage, pastTotalPages, 'past')}
                    </TabsContent>
                </Tabs>

                {/* Påmeldingsdialog */}
                <Dialog open={!!selectedTournamentId} onOpenChange={(open) => !open && setSelectedTournamentId(null)}>
                    <DialogContent className="bg-white border-gray-300 text-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900">Meld deg på {selectedTournamentForDialog?.name}</DialogTitle>
                            <DialogDescription className="text-gray-600">Bekreft at du vil melde deg på denne turneringen.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" disabled={isRegistering}>
                                    Avbryt
                                </Button>
                            </DialogClose>
                            <Button onClick={handleRegister} disabled={isRegistering} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isRegistering ? "Melder på..." : "Bekreft påmelding"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
};

export default Turneringer;
