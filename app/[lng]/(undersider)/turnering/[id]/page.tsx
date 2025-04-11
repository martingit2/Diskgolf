// Fil: src/app/tournament/[id]/page.tsx
// Formål: Viser detaljsiden for en spesifikk turnering. Henter og viser informasjon om turneringen, bane, deltakere, og tillater påmelding/statusoppdatering. Tilbyr lenker til redigering og resultatvisning.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation"; // Bruk next/navigation
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton"; // Sørg for at denne komponenten er lagt til via shadcn/ui
import { TournamentStatus } from "@prisma/client"; // Importer enum for status

// Interface som matcher data fra GET /api/tournaments/[id]
interface Tournament {
  id: string;
  name: string;
  description: string | null;
  startDate: string; // ISO String
  endDate: string | null; // ISO String or null
  status: TournamentStatus; // Bruk enum
  maxParticipants: number | null;
  location: string;
  image: string | null;
  course: {
    id: string;
    name: string;
    location: string | null;
    image: string | null;
  };
  organizer: {
    id: string;
    name: string | null;
  };
  club: {
    id: string;
    name: string;
  } | null;
  participants: {
    id: string;
    name: string | null;
  }[];
  _count: {
    participants: number;
  };
}

// Interface for brukerdata
interface User {
  id: string;
  name: string | null;
  email: string | null;
}

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const router = useRouter();

  // Hent ID fra params promise
  const { id: tournamentId } = use(params); // Unngå å bruke variabelnavnet 'id' hvis User også har 'id'

  // Hent brukerdata
  useEffect(() => {
    fetch("/api/auth")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch((error) => {
        console.error("Feil ved henting av bruker:", error);
        setUser(null);
      });
  }, []);

  // Hent turneringsdata
  useEffect(() => {
    if (!tournamentId) return; // Ikke hent hvis ID mangler

    setLoading(true);
    fetch(`/api/tournaments/${tournamentId}`)
      .then((res) => {
        if (!res.ok) {
            if (res.status === 404) throw new Error("Turnering ikke funnet");
            throw new Error("Kunne ikke hente turnering");
        }
        return res.json();
      })
      .then((data) => setTournament(data))
      .catch((error) => {
        console.error("Feil ved henting av turnering:", error);
        toast.error(error instanceof Error ? error.message : "Turnering ikke funnet");
        router.push("/turneringer"); // Send til oversikt ved feil
      })
      .finally(() => setLoading(false));
  }, [tournamentId, router]); // Kjør på nytt hvis ID endres

  // Påmeldingslogikk
  const handleRegister = async () => {
    if (!user) { toast.error("Du må være logget inn for å melde deg på"); return; }
    if (!tournament) return;

    setIsRegistering(true);
    try {
      const response = await fetch("/api/tournaments/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournament.id,
          playerId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Påmelding feilet");
      }
      // Oppdater turneringsobjektet i state med data fra API-responsen
      const updatedTournament = await response.json();
      setTournament(updatedTournament);
      toast.success("Påmelding vellykket!");
    } catch (error) {
      console.error("Påmelding feilet:", error);
      toast.error(error instanceof Error ? error.message : "Påmelding feilet");
    } finally {
      setIsRegistering(false);
    }
  };

  // Statusoppdateringslogikk (for arrangør)
  const handleStatusUpdate = async (newStatus: TournamentStatus) => {
    if (!user || !tournament || user.id !== tournament.organizer.id) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch("/api/tournaments/status", { // Kaller riktig API
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournament.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Statusoppdatering feilet");
      }
      const updatedTournament = await response.json();
      setTournament(updatedTournament); // Oppdater state med returnert data
      toast.success("Status oppdatert!");
    } catch (error) {
      console.error("Statusoppdatering feilet:", error);
      toast.error(error instanceof Error ? error.message : "Statusoppdatering feilet");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="flex justify-between items-start">
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-10 w-20 rounded" />
          </div>
          <Skeleton className="h-5 w-1/2 rounded" />
         <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                 <Skeleton className="h-6 w-1/3 rounded" />
                 <Skeleton className="h-4 w-full rounded" />
                 <Skeleton className="h-4 w-full rounded" />
                 <Skeleton className="h-4 w-2/3 rounded" />
             </div>
             <div className="space-y-4">
                <Skeleton className="h-6 w-1/2 rounded" />
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
             </div>
         </div>
      </div>
    );
  }

  // --- Ingen turnering funnet ---
  if (!tournament) {
    // Feilmelding håndteres i fetch, men en fallback kan være greit
    return <div className="max-w-4xl mx-auto p-6 text-center text-red-500">Turnering ikke funnet.</div>;
  }

  // --- Beregnede verdier ---
  const isOrganizer = user?.id === tournament.organizer.id;
  const isParticipant = tournament.participants.some((p) => p.id === user?.id);
  const isRegistrationOpen = tournament.status === TournamentStatus.REGISTRATION_OPEN;
  const canRegister =
    user && // Må være logget inn
    !isOrganizer && // Arrangør kan ikke melde seg på? (Valgfritt)
    !isParticipant && // Ikke allerede påmeldt
    isRegistrationOpen && // Påmelding må være åpen
    (!tournament.maxParticipants || // Enten ubegrenset plasser
      tournament._count.participants < tournament.maxParticipants); // eller ledige plasser

  // *** KORRIGERT LINJE ***
  const canViewResults = tournament.status === TournamentStatus.IN_PROGRESS || tournament.status === TournamentStatus.COMPLETED;
  // *** KORRIGERT LINJE ***
  const canRegisterResults = isOrganizer && (tournament.status === TournamentStatus.IN_PROGRESS || tournament.status === TournamentStatus.COMPLETED);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Overskrift og Rediger-knapp */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Arrangert av {tournament.organizer.name || 'Ukjent arrangør'}
            {tournament.club && ` • ${tournament.club.name}`}
          </p>
          <p className="text-gray-600 text-sm">
            Bane: <Link href={`/course/${tournament.course.id}`} className="text-blue-600 hover:underline">{tournament.course.name}</Link> ({tournament.location})
          </p>
        </div>
        {isOrganizer && (
          <Link href={`/tournament/${tournament.id}/edit`}>
            <Button variant="outline">Rediger</Button>
          </Link>
        )}
      </div>

      {/* Hovedinnhold Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Turneringsdetaljer */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Turneringsinfo</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Start:</strong> {new Date(tournament.startDate).toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            {tournament.endDate && (
              <p><strong>Slutt:</strong> {new Date(tournament.endDate).toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            )}
             <p><strong>Status:</strong> <span className={`font-medium ${
                 tournament.status === TournamentStatus.REGISTRATION_OPEN ? 'text-green-600' :
                 tournament.status === TournamentStatus.IN_PROGRESS ? 'text-yellow-600' :
                 tournament.status === TournamentStatus.COMPLETED ? 'text-gray-600' : 'text-blue-600' // PLANNING
             }`}>{tournament.status.replace("_", " ")}</span></p>
             <p><strong>Påmeldte:</strong> {tournament._count.participants} {tournament.maxParticipants ? `/ ${tournament.maxParticipants}` : '(ubegrenset)'}</p>
             {tournament.description && (
               <p className="mt-4 pt-4 border-t">{tournament.description}</p>
             )}
              {/* Lenke til Resultater/Stilling */}
             {canViewResults && (
                 <div className="mt-4 pt-4 border-t">
                     <Link href={`/tournament/${tournament.id}/standings`}>
                         <Button variant="link" className="p-0 h-auto">Se Stilling</Button>
                     </Link>
                 </div>
             )}
          </div>
        </div>

        {/* Deltakere */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <h2 className="text-xl font-semibold">Påmeldte spillere</h2>
            {/* Påmeldingsknapp */}
            {canRegister && (
              <Button
                onClick={handleRegister}
                disabled={isRegistering}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRegistering ? "Melder på..." : "Meld meg på"}
              </Button>
            )}
            {/* Melding hvis påmeldt */}
            {isParticipant && !isOrganizer && (
                <span className="text-sm text-green-600 font-medium">Du er påmeldt</span>
            )}
             {/* Melding hvis fullt */}
             {!canRegister && isRegistrationOpen && !isParticipant && tournament.maxParticipants && tournament._count.participants >= tournament.maxParticipants && (
                  <span className="text-sm text-red-600 font-medium">Turneringen er full</span>
             )}
             {/* Melding hvis ikke åpen */}
             {!isRegistrationOpen && !isParticipant && (
                 <span className="text-sm text-gray-500">Påmelding er ikke åpen</span>
             )}
          </div>

          {tournament.participants.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {tournament.participants.map((player) => (
                <li key={player.id} className="flex items-center justify-between">
                  <span>{player.name || `Bruker ${player.id.substring(0,6)}`}</span>
                  {/* TODO: Knapp for å fjerne deltaker (kun for arrangør) */}
                  {/* {isOrganizer && (
                    <Button
                      onClick={() => { toast("Fjerningsfunksjon må lages"); }}
                      variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-auto p-1"
                    >
                      Fjern
                    </Button>
                  )} */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-500 text-sm">Ingen påmeldte ennå.</p>
          )}
        </div>
      </div>

      {/* Administrasjon (kun for arrangør) */}
      {isOrganizer && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Administrasjon</h2>
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            {/* Statusvelger */}
            <div className="flex items-center gap-2">
              <label htmlFor="statusSelect" className="text-sm font-medium">Endre status:</label>
              <Select
                value={tournament.status}
                onValueChange={(value) => handleStatusUpdate(value as TournamentStatus)}
                disabled={isUpdatingStatus}
              >
                  <SelectTrigger id="statusSelect" className="w-[180px]" disabled={isUpdatingStatus}>
                      <SelectValue placeholder="Velg status" />
                  </SelectTrigger>
                  <SelectContent>
                      {Object.values(TournamentStatus).map(s => (
                          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              {isUpdatingStatus && <span className="text-xs text-gray-500">Oppdaterer...</span>}
            </div>

             {/* Lenke til Registrer resultater */}
            {canRegisterResults && (
                <Link href={`/tournament/${tournament.id}/results`}>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700">Registrer resultater</Button>
                </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}