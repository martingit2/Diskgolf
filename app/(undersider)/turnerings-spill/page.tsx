// app/(undersider)/turnerings-spill/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Users, ArrowLeft, ShieldCheck, User as UserIcon } from 'lucide-react';

// Interface for data hentet fra GET /api/tournament-sessions/[sessionId]
interface ParticipantData {
    id: string; // Participation ID
    playerId: string;
    playerName: string;
    playerImage: string | null;
    isReady: boolean;
}

interface GameSessionData {
    id: string;
    status: string;
    roundNumber: number;
    tournamentId: string;
    tournamentName: string;
    course: {
        id: string;
        name: string;
        holes: any[];
    };
    participants: ParticipantData[];
}

export default function TournamentGameLobbyPage() {
    const [gameSession, setGameSession] = useState<GameSessionData | null>(null);
    const [currentUserIsReady, setCurrentUserIsReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMarkingReady, setIsMarkingReady] = useState(false);

    const router = useRouter();
    const params = useParams();
    const { data: session, status: authStatus } = useSession();

    const sessionId = params?.sessionId as string | undefined;

    // Hovedfunksjon for å hente data
    const fetchSessionData = useCallback(async () => {
        if (!sessionId || authStatus !== 'authenticated') return;

        try {
            const res = await fetch(`/api/tournament-sessions/${sessionId}`);
            if (!res.ok) {
                const status = res.status;
                const errorData = await res.json().catch(() => ({}));
                if (status === 404) throw new Error(errorData.error || "Turneringsrunden finnes ikke.");
                if (status === 403) throw new Error(errorData.error || "Du har ikke tilgang til denne runden.");
                throw new Error(errorData.error || "Kunne ikke hente rundeinformasjon.");
            }

            const data: GameSessionData = await res.json();
            setGameSession(data);

            if (data.status === 'inProgress') {
                router.replace(`/tournament-game/${sessionId}/play`);
                return;
            }
            if (data.status === 'completed') {
                toast.error("Denne runden er allerede fullført.");
                router.push(`/tournament/${data.tournamentId}`);
                return;
            }

            const currentUserParticipant = data.participants.find(p => p.playerId === session?.user?.id);
            setCurrentUserIsReady(currentUserParticipant?.isReady ?? false);
            setError(null);

        } catch (err) {
            console.error('Feil ved henting av turneringsrunde:', err);
            const errorMessage = err instanceof Error ? err.message : "En ukjent feil oppstod";
            setError(errorMessage);
            // Ikke nullstill gameSession her, behold siste kjente state ved feil under polling
            // setGameSession(null);
        } finally {
           if(loading) setLoading(false);
        }
    }, [sessionId, authStatus, session?.user?.id, router, loading]);

    // Initial Fetch og Polling
    useEffect(() => {
        if (!sessionId) {
            setError("Mangler ID for turneringsrunde.");
            setLoading(false);
            return;
        }
        if (authStatus === 'loading') return;
        if (authStatus === 'unauthenticated') {
            setError("Du må være logget inn for å delta.");
            setLoading(false);
            return;
        }

        fetchSessionData();
        const intervalId = setInterval(fetchSessionData, 5000);
        return () => clearInterval(intervalId);
    }, [sessionId, authStatus, fetchSessionData]);


    // Håndter "Klar"-knapp
    const handleReadyClick = async () => {
        if (!sessionId || !session?.user?.id || currentUserIsReady || isMarkingReady) return;

        setIsMarkingReady(true);
        setError(null);
        try {
            const response = await fetch(`/api/tournament-sessions/${sessionId}/ready`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: session.user.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Kunne ikke markere som klar.");
            }

            const result = await response.json();

            toast.success("Du er markert som klar!");
            setCurrentUserIsReady(true);

            if (result.gameStarted) {
                 setTimeout(() => { router.replace(`/tournament-game/${sessionId}/play`); }, 500);
            } else {
                // --- KORRIGERT STATE UPDATE ---
                setGameSession(prev => {
                    if (!prev) return null; // Returner null hvis forrige state var null
                    return { // Returner et komplett GameSessionData objekt
                        ...prev, // Behold all annen data
                        participants: prev.participants.map(p => // Oppdater kun deltakerlisten
                            p.playerId === session?.user?.id ? { ...p, isReady: true } : p
                        )
                    };
                });
                // -----------------------------
            }

        } catch (err) {
            console.error("Feil ved markering som klar:", err);
            toast.error(err instanceof Error ? err.message : "En feil oppstod.");
            // Vurder om currentUserIsReady skal settes tilbake til false her?
            // setCurrentUserIsReady(false);
        } finally {
            setIsMarkingReady(false);
        }
    };

    // Beregnede verdier
    const participants = gameSession?.participants ?? [];
    const readyCount = participants.filter(p => p.isReady).length;
    const totalParticipants = participants.length;
    const allReady = totalParticipants > 0 && readyCount === totalParticipants;

    // --- Rendering ---

    if (!sessionId) {
        return <div className="min-h-screen bg-gray-100 text-gray-900 p-8 flex items-center justify-center">Mangler sesjons-ID.</div>;
    }

    if (loading) {
        // Skeleton Loader (som før)
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    {/* ... skeleton elementer ... */}
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2 mb-6" />
                    <Skeleton className="h-6 w-1/4 mb-4" />
                    <div className="space-y-3 mb-8">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                </div>
            </div>
        );
    }

    if (error && !gameSession) { // Vis feil kun hvis vi *ikke* har noe data å vise
        return (
            <div className="min-h-screen bg-gray-100 text-gray-900 p-8 flex flex-col items-center justify-center">
                <p className="text-red-600 mb-4 text-center">{error}</p>
                {/* --- KORRIGERT FALLBACK KNAPP --- */}
                 <Button variant="outline" onClick={() => router.push(`/turneringer`)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Til turneringslisten
                 </Button>
                 {/* ----------------------------- */}
            </div>
        );
    }

    if (!gameSession) {
         // Fallback hvis gameSession fortsatt er null etter lasting (bør ikke skje ofte)
        return <div className="min-h-screen bg-gray-100 text-gray-900 p-8 flex items-center justify-center">Kunne ikke laste rundeinformasjon.</div>;
    }

    // --- Vellykket lasting - Vis lobbyen ---
    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-start">
            <div className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200 relative">
                {/* --- KORRIGERT TILBAKE-KNAPP --- */}
                <Button variant="ghost" size="sm" onClick={() => router.push(`/tournament/${gameSession.tournamentId}`)} className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 z-10">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Tilbake
                </Button>
                {/* ----------------------------- */}

                {/* Vis feilmelding øverst hvis den oppstod under polling */}
                 {error && (
                     <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                         {error} (Prøver fortsatt å oppdatere...)
                     </div>
                 )}


                {/* Tittel og info (som før) */}
                <div className="text-center mb-6 pt-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{gameSession.tournamentName}</h1>
                    {/* ... (resten av tittel/info) ... */}
                     <p className="text-lg text-gray-600">Runde {gameSession.roundNumber} - Lobby</p>
                     <p className="text-sm text-gray-500 mt-1">Bane: {gameSession.course.name}</p>
                </div>

                {/* Deltakerliste (som før) */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center justify-center gap-2">
                        <Users className="h-5 w-5" /> Deltakere ({totalParticipants})
                    </h2>
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 border rounded-md p-3 bg-gray-50">
                         {/* ... (mapping av participants med Image/UserIcon fallback som før) ... */}
                          {participants.map((p) => (
                              <li key={p.id} className={`flex items-center justify-between p-3 rounded transition-colors ${p.playerId === session?.user?.id ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-200'}`}>
                                  <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                           {p.playerImage ? (
                                               <Image src={p.playerImage} alt={p.playerName} width={32} height={32} className="w-full h-full object-cover" />
                                           ) : (
                                               <UserIcon className="w-5 h-5 text-gray-500" />
                                           )}
                                       </div>
                                      <span className={`font-medium truncate ${p.playerId === session?.user?.id ? 'text-blue-800' : 'text-gray-800'}`} title={p.playerName}>
                                          {p.playerName} {p.playerId === session?.user?.id ? '(Deg)' : ''}
                                      </span>
                                  </div>
                                  {p.isReady ? (
                                      <span className="flex items-center text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                          <ShieldCheck className="h-3 w-3 mr-1" /> Klar
                                      </span>
                                  ) : (
                                      <span className="text-xs font-medium text-gray-500">Venter...</span>
                                  )}
                              </li>
                          ))}
                          {participants.length === 0 && <p className="text-center text-gray-500 py-4">Venter på deltakere...</p>}
                    </ul>
                </div>

                {/* Klar-knapp og status (som før) */}
                <div className="flex flex-col items-center text-center">
                     {/* ... (logikk for knapp/status som før) ... */}
                       {!currentUserIsReady ? (
                         <Button onClick={handleReadyClick} disabled={isMarkingReady} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                             {isMarkingReady ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                             {isMarkingReady ? 'Markerer...' : 'Jeg er klar!'}
                         </Button>
                     ) : (
                         <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                             <p className="text-green-700 font-semibold text-lg mb-1">Du er klar!</p>
                             <p className="text-sm text-gray-600">{readyCount} av {totalParticipants} klare.</p>
                             <p className="text-sm text-gray-600 mt-2">{allReady ? "Starter spillet..." : "Venter på de andre spillerne..."}</p>
                             {allReady && <Loader2 className="h-5 w-5 text-gray-500 animate-spin mx-auto mt-2"/>}
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
}