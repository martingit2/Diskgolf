// app/(undersider)/tournament/[id]/page.tsx ELLER der filen din ligger
"use client";

import { useState, useEffect, use, useCallback } from "react"; // Lagt til useCallback
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TournamentStatus } from "@prisma/client";
import { Loader2, Play, ExternalLink, Settings, ListChecks } from "lucide-react"; // Nye ikoner

// Interfaces (Tournament, User - som før)
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
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null); // NY: For aktiv spill-ID
  const [isLoadingSessionId, setIsLoadingSessionId] = useState(false); // NY: Laster spill-ID?
  const [isStartingRound, setIsStartingRound] = useState(false); // NY: Starter runde?

  const router = useRouter();
  const { id: tournamentId } = use(params);

  // Hent brukerdata
  useEffect(() => {
    fetch("/api/auth")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  // Hent turneringsdata
  useEffect(() => {
    if (!tournamentId) return;
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
  }, [tournamentId, router]);


  // --- NY FUNKSJON: Hent aktiv sesjons-ID ---
  const fetchActiveSession = useCallback(async () => {
      if (!tournamentId || !user) return; // Trenger ID og bruker
      setIsLoadingSessionId(true);
      try {
          const res = await fetch(`/api/tournaments/${tournamentId}/active-session`);
          if (!res.ok) {
              console.error("Kunne ikke hente aktiv sesjon:", res.statusText);
              setActiveSessionId(null);
              return;
          }
          const data = await res.json();
          setActiveSessionId(data.sessionId);
      } catch (error) {
          console.error("Feil ved henting av aktiv sesjon:", error);
          setActiveSessionId(null);
      } finally {
          setIsLoadingSessionId(false);
      }
  }, [tournamentId, user]);

   // --- NY EFFEKT: Kall fetchActiveSession når turneringen er IN_PROGRESS ---
   useEffect(() => {
       // Sjekk at tournament finnes før vi sjekker status
       if (tournament && tournament.status === TournamentStatus.IN_PROGRESS) {
           fetchActiveSession();
       } else {
           setActiveSessionId(null); // Nullstill hvis status ikke er IN_PROGRESS eller tournament er null
       }
   }, [tournament, fetchActiveSession]); // Kjør når tournament (og dermed status) endres


  // Påmeldingslogikk
  const handleRegister = async () => {
      if (!user) { toast.error("Du må være logget inn for å melde deg på"); return; }
      // Sjekk at tournament finnes før vi bruker det
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
          if (!response.ok) { /* ... feilhåndtering ... */ throw new Error("..."); }
          const updatedTournament = await response.json();
          setTournament(updatedTournament);
          toast.success("Påmelding vellykket!");
      } catch (error) { /* ... feilhåndtering ... */ }
      finally { setIsRegistering(false); }
  };

  // --- NY FUNKSJON: Start runde (for arrangør) ---
  const handleStartRound = async () => {
      // Sjekk at tournament og user finnes, og at bruker er arrangør
      if (!tournament || !user || user.id !== tournament.organizer.id || isStartingRound) return;

      setIsStartingRound(true);
      try {
          const response = await fetch(`/api/tournaments/${tournament.id}/start-round`, {
              method: 'POST',
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Kunne ikke starte runde.");
          }
          const data = await response.json();
          setActiveSessionId(data.sessionId);
          toast.success("Runde startet og spillobby er klar!");
      } catch (error) {
          console.error("Feil ved start av runde:", error);
          toast.error(error instanceof Error ? error.message : "Ukjent feil.");
      } finally {
          setIsStartingRound(false);
      }
  };


  // Statusoppdatering
  const handleStatusUpdate = async (newStatus: TournamentStatus) => {
      // Sjekk at tournament og user finnes, og at bruker er arrangør
      if (!user || !tournament || user.id !== tournament.organizer.id) return;
      setIsUpdatingStatus(true);
      try {
          const response = await fetch("/api/tournaments/status", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ tournamentId: tournament.id, status: newStatus }),
          });
          if (!response.ok) { /* ... feilhåndtering ... */ throw new Error("..."); }
          const updatedTournament = await response.json();
          setTournament(updatedTournament); // Oppdater state med ny turneringsdata
          toast.success("Status oppdatert!");
          // Merk: fetchActiveSession vil kjøre automatisk via useEffect hvis status blir IN_PROGRESS
      } catch (error) { /* ... feilhåndtering ... */ }
      finally { setIsUpdatingStatus(false); }
  };

  // Loading State
  if (loading) {
     return ( // Returnerer Skeleton UI
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

  // Ingen turnering funnet (etter lasting)
  if (!tournament) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-red-500">Turnering ikke funnet.</div>;
  }

  // --- Beregnede verdier (bruk ! siden vi nå vet at tournament finnes) ---
  const isOrganizer = user?.id === tournament.organizer.id;
  const isParticipant = tournament.participants.some((p) => p.id === user?.id);
  const isRegistrationOpen = tournament.status === TournamentStatus.REGISTRATION_OPEN;
  const canRegister = user && !isOrganizer && !isParticipant && isRegistrationOpen && (!tournament.maxParticipants || tournament._count.participants < tournament.maxParticipants);
  const canViewStandings = tournament.status === TournamentStatus.COMPLETED;
  const isInProgress = tournament.status === TournamentStatus.IN_PROGRESS;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen"> {/* Lys bakgrunn */}

      {/* Overskrift og Rediger-knapp */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
          <p className="text-gray-700 mt-1 text-sm">
            Arrangert av {tournament.organizer.name || 'Ukjent arrangør'}
            {tournament.club && ` • ${tournament.club.name}`}
          </p>
          <p className="text-gray-600 text-sm">
            Bane: <Link href={`/course/${tournament.course.id}`} className="text-blue-600 hover:underline hover:text-blue-800">{tournament.course.name}</Link> ({tournament.location})
          </p>
        </div>
        {isOrganizer && (
          <Link href={`/tournament/${tournament.id}/edit`}>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                <Settings className="mr-2 h-4 w-4"/> Rediger
            </Button>
          </Link>
        )}
      </div>

       {/* Status/Handlings-banner for IN_PROGRESS */}
        {isInProgress && (
            <div className={`my-5 p-4 rounded-lg border ${activeSessionId ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                     <div className='flex items-center'>
                         {/* Viser lasting-ikon spesifikt for sesjons-ID */}
                         {isLoadingSessionId ? (
                             <Loader2 className="h-5 w-5 mr-2 animate-spin text-gray-500" />
                         ) : (
                             <Loader2 className={`h-5 w-5 mr-2 animate-spin ${activeSessionId ? 'text-green-600' : 'text-yellow-600'}`} />
                         )}
                         <p className={`font-medium ${activeSessionId ? 'text-green-800' : 'text-yellow-800'}`}>
                             {isLoadingSessionId ? 'Sjekker spillstatus...' :
                              activeSessionId ? 'Turneringen pågår!' : 'Turneringen pågår! Venter på at spillet skal klargjøres...'}
                         </p>
                     </div>

                     {/* Knapper basert på rolle og sesjonsstatus */}
                     {activeSessionId ? (
                         // Sesjon er aktiv
                         isParticipant && (
                             <Link href={`/turnerings-spill/${activeSessionId}/lobby`}>
                                 <Button className="bg-green-600 hover:bg-green-700">
                                     <Play className="mr-2 h-4 w-4"/> Gå til Spillobby
                                 </Button>
                             </Link>
                         )
                     ) : (
                         // Sesjon er IKKE aktiv (eller laster)
                         isOrganizer && !isLoadingSessionId && ( // Vis kun hvis lasting er ferdig
                             <Button
                                 onClick={handleStartRound}
                                 disabled={isStartingRound}
                                 variant="secondary"
                                 className="bg-yellow-500 hover:bg-yellow-600 text-black"
                             >
                                 {isStartingRound ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4"/>}
                                 {isStartingRound ? 'Starter Runde...' : 'Start Runde 1'}
                             </Button>
                         )
                     )}
                 </div>
             </div>
        )}


      {/* Hovedinnhold Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Turneringsdetaljer */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 border-b border-gray-200 pb-2 text-gray-800">Turneringsinfo</h2>
          <div className="space-y-2 text-sm text-gray-700">
             <p><strong>Start:</strong> {new Date(tournament.startDate).toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
             {tournament.endDate && ( <p><strong>Slutt:</strong> {new Date(tournament.endDate).toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })}</p> )}
             <p><strong>Status:</strong> <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                 tournament.status === TournamentStatus.REGISTRATION_OPEN ? 'bg-green-100 text-green-800' :
                 tournament.status === TournamentStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800' :
                 tournament.status === TournamentStatus.COMPLETED ? 'bg-gray-100 text-gray-800' :
                 'bg-blue-100 text-blue-800' // PLANNING
             }`}>{tournament.status.replace("_", " ")}</span></p>
             <p><strong>Påmeldte:</strong> {tournament._count.participants} {tournament.maxParticipants ? `/ ${tournament.maxParticipants}` : '(ubegrenset)'}</p>
             {tournament.description && ( <p className="mt-4 pt-4 border-t border-gray-200">{tournament.description}</p> )}
             {/* Lenke til Endelig Stilling */}
             {canViewStandings && (
                 <div className="mt-4 pt-4 border-t border-gray-200">
                     <Link href={`/tournament/${tournament.id}/standings`}>
                         <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                            <ListChecks className="mr-1 h-4 w-4"/> Se Sluttstilling
                         </Button>
                     </Link>
                 </div>
             )}
          </div>
        </div>

        {/* Deltakere */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
            <h2 className="text-xl font-semibold text-gray-800">Påmeldte spillere</h2>
            {/* Påmeldingsknapp */}
            {canRegister && ( <Button onClick={handleRegister} disabled={isRegistering} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"> {isRegistering ? <Loader2 className="h-4 w-4 animate-spin"/> : "Meld på"} </Button> )}
            {/* Meldinger */}
             {isParticipant && !isOrganizer && ( <span className="text-sm text-green-600 font-medium">✓ Påmeldt</span> )}
             {!canRegister && isRegistrationOpen && !isParticipant && tournament.maxParticipants && tournament._count.participants >= tournament.maxParticipants && ( <span className="text-sm text-red-600 font-medium">Fulltegnet</span> )}
             {!isRegistrationOpen && !isParticipant && !isInProgress && tournament.status !== 'COMPLETED' && ( <span className="text-sm text-gray-500">Påmelding stengt</span> )}
          </div>
            {/* Deltakerliste */}
           {tournament.participants.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm">
                    {tournament.participants.map((player) => (
                        <li key={player.id} className="flex items-center justify-between border-b border-gray-100 pb-1 last:border-b-0">
                            <span className="text-gray-800">{player.name || `Bruker ${player.id.substring(0,6)}`}</span>
                            {/* TODO: Fjern-knapp */}
                        </li>
                    ))}
                </ul>
            ) : ( <p className="mt-4 text-gray-500 text-sm">Ingen påmeldte ennå.</p> )}
        </div>
      </div>

      {/* Administrasjon */}
      {isOrganizer && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 border-b border-gray-200 pb-2 text-gray-800">
             <Settings className="inline-block mr-2 h-5 w-5 align-text-bottom"/> Administrasjon
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-4 items-center">
            {/* Statusvelger */}
            <div className="flex items-center gap-2">
              <label htmlFor="statusSelect" className="text-sm font-medium text-gray-700">Endre status:</label>
              <Select value={tournament.status} onValueChange={(value) => handleStatusUpdate(value as TournamentStatus)} disabled={isUpdatingStatus}>
                  <SelectTrigger id="statusSelect" className="w-[180px] bg-white border-gray-300" disabled={isUpdatingStatus}>
                      <SelectValue placeholder="Velg status" />
                  </SelectTrigger>
                  <SelectContent>
                      {Object.values(TournamentStatus).map(s => ( <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem> ))}
                  </SelectContent>
              </Select>
              {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin text-gray-500"/>}
            </div>

            {/* Start Runde / Gå til Lobby Knapper */}
            {isInProgress && !activeSessionId && (
                 <Button onClick={handleStartRound} disabled={isStartingRound || isLoadingSessionId} variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                     {isStartingRound ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4"/>}
                     {isStartingRound ? 'Starter...' : 'Start Runde 1'}
                 </Button>
            )}
            {isInProgress && activeSessionId && (
                  <Link href={`/turnerings-spill/${activeSessionId}/lobby`}>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                          <ExternalLink className="mr-2 h-4 w-4"/> Gå til Spillobby
                      </Button>
                  </Link>
            )}
          </div>
           {/* Info om status/spill */}
            {isInProgress && !activeSessionId && !isLoadingSessionId && <p className="text-xs text-gray-500 mt-3">Klikk "Start Runde" for å la deltakere gå til spillobbyen.</p>}
             {isInProgress && isLoadingSessionId && <p className="text-xs text-gray-500 mt-3">Sjekker spillstatus...</p>}
            {isInProgress && activeSessionId && <p className="text-xs text-green-600 mt-3">Spillobbyen er klar. Deltakere kan nå bli med.</p>}
        </div>
      )}
    </div>
  );
}