// app/turneringer/page.tsx
'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card"; // Importer Card
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/app/hooks/use-debounce";
import { MapPin, CalendarDays, Users, Search, ArrowRight, PlusCircle } from "lucide-react"; // Importer flere ikoner

// Interface for turneringsdata (samme som før)
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
  course: {
    id: string;
    name: string;
    location: string | null;
    image?: string | null;
  };
  organizer: {
    id: string;
    name: string | null;
  };
  club: {
      id: string;
      name: string;
  } | null;
  _count: {
    participants: number;
  };
}

// Interface for brukerdata (samme som før)
interface User {
    id: string;
    name: string | null;
    email: string | null;
}

const ITEMS_PER_PAGE = 10;

// --- Hjelpefunksjon for status-badge (Lys modus) ---
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    // Vi kan bruke varianter for å styre base-styling, men overstyrer farger for spesifisitet
    switch (status) {
        case 'REGISTRATION_OPEN': return 'default';
        case 'IN_PROGRESS': return 'secondary';
        case 'COMPLETED': return 'outline';
        case 'PLANNING': return 'secondary';
        default: return 'outline';
    }
};
// Definer farger for lys modus badge
const getStatusBadgeColorLight = (status: string): string => {
     switch (status) {
         case 'REGISTRATION_OPEN': return 'bg-green-100 text-green-800 border-green-200';
         case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
         case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
         case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-200';
         default: return 'border-gray-300 text-gray-500';
     }
 };


// --- Sub-komponent for Turneringskort (Lys modus) ---
interface TournamentCardProps {
    tournament: Tournament;
    user: User | null;
    onRegisterClick: (tournamentId: string) => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, user, onRegisterClick }) => {
    const isParticipant = false; // Midlertidig
    const canRegister = user && !isParticipant && tournament.status === 'REGISTRATION_OPEN' && (!tournament.maxParticipants || tournament._count.participants < tournament.maxParticipants);

    return (
        <Card key={tournament.id} className="shadow-md border border-gray-200 flex flex-col md:flex-row transform transition-all duration-300 hover:shadow-xl rounded-xl overflow-hidden bg-white">
            {/* Bilde-seksjon */}
            <div className="md:w-1/3 flex-shrink-0 relative">
                 {/* Valgfri: liten gradient overlay nederst */}
                 {/* <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/5 to-transparent pointer-events-none md:rounded-l-xl"></div> */}
                <Link href={`/tournament/${tournament.id}`} className="block h-full">
                    <Image
                        src={tournament.image || tournament.course.image || "/placeholder-image.webp"}
                        alt={tournament.name}
                        width={400}
                        height={250}
                        className="object-cover w-full h-48 md:h-full md:rounded-l-xl md:rounded-t-none rounded-t-xl" // Justert rounding
                    />
                </Link>
            </div>

            {/* Info-seksjon */}
            <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                    {/* Tittel og Status */}
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <Link href={`/tournament/${tournament.id}`}>
                            <h3 className="text-xl font-bold text-gray-800 hover:text-blue-700 transition-colors">
                                {tournament.name}
                            </h3>
                        </Link>
                         <Badge variant={getStatusBadgeVariant(tournament.status)} className={`${getStatusBadgeColorLight(tournament.status)} flex-shrink-0 text-xs font-semibold`}>
                            {tournament.status.replace("_", " ")}
                        </Badge>
                    </div>
                    {/* Separator som i CourseCard */}
                    <hr className="my-3 border-t border-gray-200" />

                    {/* Viktige Detaljer med Ikoner */}
                    <div className="space-y-1.5 text-sm text-gray-600 mt-3 mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="flex-shrink-0 text-gray-400" />
                            <span>{tournament.location} ({tournament.course.name}) {tournament.club && `• ${tournament.club.name}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDays size={16} className="flex-shrink-0 text-gray-400" />
                            <span>{new Date(tournament.startDate).toLocaleString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {tournament.maxParticipants != null && (
                             <div className="flex items-center gap-2">
                                <Users size={16} className="flex-shrink-0 text-gray-400" />
                                <span>{tournament._count.participants} / {tournament.maxParticipants} påmeldte</span>
                            </div>
                        )}
                    </div>

                    {/* Beskrivelse */}
                    <p className="text-gray-700 text-sm line-clamp-3">{tournament.description}</p>
                </div>

                {/* Handlinger (Knapper) - nederst */}
                <div className="mt-5 pt-4 flex justify-between items-center gap-3">
                     {/* Knapper på venstre side */}
                     <div className="flex gap-2">
                        <Link href={`/tournament/${tournament.id}`}>
                            <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Se detaljer
                            </Button>
                        </Link>
                     </div>

                    {/* Knapper/status på høyre side */}
                     <div>
                         {canRegister ? (
                             <Button
                                 size="sm"
                                 className="bg-gray-900 hover:bg-green-600 text-white px-4" // Matcher "Start Banespill" farge? Eller grønn?
                                 onClick={() => onRegisterClick(tournament.id)}
                             >
                                Meld deg på <ArrowRight size={16} className="ml-1"/>
                             </Button>
                         ) : isParticipant ? (
                             <span className="text-sm text-green-600 font-medium">✓ Påmeldt</span>
                         ) : tournament.status === 'COMPLETED' ? (
                             <Badge variant="outline" className={getStatusBadgeColorLight(tournament.status)}>Fullført</Badge>
                          ) : !canRegister && tournament.maxParticipants && tournament._count.participants >= tournament.maxParticipants ? (
                              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Fulltegnet</Badge>
                         ) : null }
                     </div>
                </div>
            </div>
        </Card>
    );
}

// --- Hovedkomponent for Turneringssiden (Lys modus) ---
const Turneringer = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Hent brukerdata
  useEffect(() => {
    fetch("/api/auth")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  // Hent turneringer
  const fetchTournaments = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tournaments?page=${page}&search=${encodeURIComponent(search)}&limit=${ITEMS_PER_PAGE}`);
      if (!response.ok) throw new Error("Kunne ikke hente turneringer");
      const data = await response.json();
      if (!data.tournaments || typeof data.totalPages !== 'number') throw new Error("Ugyldig data");
      setTournaments(data.tournaments);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error(error); toast.error(error instanceof Error ? error.message : "Feil ved henting");
      setTournaments([]); setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effekt for å hente data
  useEffect(() => {
    fetchTournaments(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchTournaments]);


  const nextPage = () => { if (currentPage < totalPages) { setCurrentPage(prev => prev + 1); } };
  const prevPage = () => { if (currentPage > 1) { setCurrentPage(prev => prev - 1); } };

  // Håndter påmelding
  const handleRegister = async () => {
    if (!user) { toast.error("Du må være logget inn."); return; }
    if (!selectedTournamentId) return;
    setIsRegistering(true);
    try {
      const response = await fetch("/api/tournaments/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tournamentId: selectedTournamentId, playerId: user.id }), });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || "Påmelding feilet"); }
      toast.success("Du er nå påmeldt!");
      setSelectedTournamentId(null);
      fetchTournaments(currentPage, debouncedSearchTerm);
    } catch (error) { console.error(error); toast.error(error instanceof Error ? error.message : "En feil oppstod."); }
    finally { setIsRegistering(false); }
  };

  const handleOpenRegisterDialog = (tournamentId: string) => {
      setSelectedTournamentId(tournamentId);
  };

  const selectedTournamentForDialog = tournaments.find(t => t.id === selectedTournamentId);

  return (
    // Sett lys bakgrunn på siden
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                DiskGolf Turneringer
            </h1>
            <p className="mt-3 text-lg text-gray-600">
                Finn og delta i kommende turneringer.
            </p>
          </div>

        {/* Søkefelt */}
        <div className="mb-8 relative">
            <Input
                type="text"
                placeholder="Søk etter turnering (navn, sted, bane...)"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full p-3 pl-10 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
            />
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Lasteindikator (Skeleton for lys modus) */}
        {loading && (
             <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="shadow-md border border-gray-200 flex flex-col md:flex-row rounded-xl overflow-hidden bg-white">
                        <Skeleton className="h-48 md:h-auto md:w-1/3 bg-gray-200" />
                        <div className="p-5 flex-1 space-y-3">
                            <Skeleton className="h-6 w-3/4 bg-gray-200" />
                            <Skeleton className="h-4 w-1/2 bg-gray-300" />
                            <Skeleton className="h-4 w-full bg-gray-300" />
                            <Skeleton className="h-4 w-5/6 bg-gray-300" />
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                                <Skeleton className="h-8 w-24 bg-gray-300" />
                                <Skeleton className="h-8 w-32 bg-gray-300" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )}

        {/* Turneringsliste */}
        {!loading && (
          <>
            <div className="space-y-6"> {/* Normalt mellomrom */}
              {tournaments.length > 0 ? (
                tournaments.map((tournament) => (
                  <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      user={user}
                      onRegisterClick={handleOpenRegisterDialog}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 mt-12 py-10 border border-dashed border-gray-300 rounded-lg bg-white">
                    <h3 className="text-lg font-medium">Ingen turneringer funnet</h3>
                    <p className="text-sm mt-1">{searchTerm ? 'Prøv å justere søket ditt.' : 'Sjekk tilbake senere eller opprett en ny!'}</p>
                </div>
              )}
            </div>

            {/* Paginering (Lys modus) */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent className="bg-white border border-gray-300 rounded-md px-1 shadow-sm">
                    <PaginationItem><PaginationPrevious onClick={prevPage} href="#" aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : undefined} className={`hover:bg-gray-100 rounded-l-md ${currentPage === 1 ? "pointer-events-none opacity-50 text-gray-400" : "text-gray-600 hover:text-gray-800"}`} /></PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(pageNumber => pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1))
                            .map((pageNumber, index, arr) => (
                               <PaginationItem key={pageNumber}>
                                  {index > 0 && pageNumber > arr[index-1] + 1 && <span className="px-2 text-gray-400">...</span>}
                                  <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(pageNumber); }} isActive={currentPage === pageNumber} className={`hover:bg-gray-100 ${currentPage === pageNumber ? 'bg-blue-600 text-white hover:bg-blue-700 font-semibold' : 'text-gray-600 hover:text-gray-800'}`}>
                                     {pageNumber}
                                  </PaginationLink>
                               </PaginationItem>
                       ))}
                    <PaginationItem><PaginationNext onClick={nextPage} href="#" aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : undefined} className={`hover:bg-gray-100 rounded-r-md ${currentPage === totalPages ? "pointer-events-none opacity-50 text-gray-400" : "text-gray-600 hover:text-gray-800"}`} /></PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Påmeldingsdialog (Lys modus) */}
            <Dialog open={!!selectedTournamentId} onOpenChange={(open) => !open && setSelectedTournamentId(null)}>
              <DialogContent className="bg-white border-gray-300 text-gray-900">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Meld deg på {selectedTournamentForDialog?.name}</DialogTitle>
                  <DialogDescription className="text-gray-600">Bekreft at du vil melde deg på denne turneringen.</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                   <DialogClose asChild><Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" disabled={isRegistering}>Avbryt</Button></DialogClose>
                  <Button onClick={handleRegister} disabled={isRegistering} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isRegistering ? "Melder på..." : "Bekreft påmelding"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Knappen for å opprette ny turnering */}
        {user && (
            <div className="mt-16 text-center border-t border-gray-200 pt-10">
                <Link href="/dashboard/tournaments/create">
                    <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white py-3 px-8 rounded-lg transition duration-300 font-semibold shadow hover:shadow-md">
                        <PlusCircle size={20} className="mr-2"/> Opprett ny turnering
                    </Button>
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default Turneringer;