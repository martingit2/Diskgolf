// Fil: src/app/(undersider)/turnerings-spill/[sessionId]/lobby/page.tsx
// Formål: Viser lobbyen for en turneringsrunde. Lister opp påmeldte deltakere, deres klar-status, og lar den innloggede brukeren markere seg som klar. Oppdaterer data jevnlig og navigerer automatisk til spill-siden når alle er klare.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.




'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Removed notFound as it's less common for client pages
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image'; // Riktig Image-import
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge'; // Pass på at Badge er importert hvis du bruker den
import { CheckCircle2, Loader2, Users, ArrowLeft, ShieldCheck, User as UserIcon, AlertCircle } from 'lucide-react'; // La til AlertCircle for feil

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
    status: string; // 'waiting', 'inProgress', 'completed'
    roundNumber: number;
    tournamentId: string;
    tournamentName: string;
    course: {
        id: string;
        name: string;
        holes: any[]; // Kan defineres mer spesifikt senere hvis nødvendig
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

    // Hovedfunksjon for å hente data (med debugging)
    const fetchSessionData = useCallback(async () => {
        if (!sessionId || authStatus !== 'authenticated' || !session?.user?.id) {
            return;
        }

        try {
            // console.log("Fetching session data..."); // FJERN ELLER KOMMENTER UT ETTER FEILSØKING
            const res = await fetch(`/api/tournament-sessions/${sessionId}`);

            if (!res.ok) {
                const status = res.status;
                let errorMsg = "Kunne ikke hente rundeinformasjon.";
                try { const errorData = await res.json(); errorMsg = errorData.error || errorMsg; } catch (e) {/* Ignorer json parse feil */ }
                if (status === 404) throw new Error("Turneringsrunden finnes ikke.");
                if (status === 403) throw new Error("Du har ikke tilgang til denne runden.");
                throw new Error(errorMsg);
            }

            const data: GameSessionData = await res.json();
            // console.log("Received data:", data); // FJERN ELLER KOMMENTER UT ETTER FEILSØKING

            // --- VIKTIG ENDRING: Sjekk status FØR state-sammenligning ---
            if (data.status === 'inProgress') {
                // console.log("Status is inProgress. Preparing redirect..."); // FJERN ELLER KOMMENTER UT
                toast.success("Alle er klare! Starter spillet...", { duration: 2000 });
                setTimeout(() => {
                    // console.log(`Redirecting to /turnerings-spill/${sessionId}/play`); // FJERN ELLER KOMMENTER UT
                    router.replace(`/turnerings-spill/${sessionId}/play`); // Bruk riktig path
                }, 1500);
                return; // Ikke gjør mer etter redirect er planlagt
            }
            if (data.status === 'completed') {
                // console.log("Status is completed. Redirecting to tournament page."); // FJERN ELLER KOMMENTER UT
                toast.error("Denne runden er allerede fullført.");
                 router.push(`/tournament/${data.tournamentId}`);
                return;
            }
            // -------------------------------------------------------------

            // Oppdater state (kan forenkles ved å fjerne JSON.stringify-sjekken hvis den skaper trøbbel)
            // Enklere oppdatering:
            // console.log("Updating state with new data."); // FJERN ELLER KOMMENTER UT
            setGameSession(data);
            const currentUserParticipant = data.participants.find(p => p.playerId === session.user.id);
            setCurrentUserIsReady(currentUserParticipant?.isReady ?? false);


            /* Alternativ med sjekk (behold hvis du vil optimalisere):
            if (JSON.stringify(data) !== JSON.stringify(gameSession)) {
                 console.log("Updating state with new data."); // FJERN ELLER KOMMENTER UT
                 setGameSession(data);
                 const currentUserParticipant = data.participants.find(p => p.playerId === session.user.id);
                 setCurrentUserIsReady(currentUserParticipant?.isReady ?? false);
             } else {
                 console.log("Data hasn't changed, skipping state update."); // FJERN ELLER KOMMENTER UT
             }
            */

            setError(null); // Nullstill feil ved suksess

        } catch (err) {
            console.error('Feil ved henting av turneringsrunde:', err);
            const errorMessage = err instanceof Error ? err.message : "En ukjent feil oppstod";
            setError(errorMessage); // Sett feilmelding for visning
        } finally {
            if (loading) setLoading(false); // Sett loading til false kun første gang
        }
    // gameSession fjernet fra dependencies for å unngå potensielle løkker med JSON.stringify
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
            toast.error("Vennligst logg inn.");
            // router.push('/login'); // Vurder redirect til login
            return;
        }

        fetchSessionData(); // Hent data umiddelbart
        const intervalId = setInterval(fetchSessionData, 5000); // Start polling
        return () => clearInterval(intervalId); // Rydd opp intervallet

    }, [sessionId, authStatus, fetchSessionData]);


    // Håndter "Klar"-knapp
    const handleReadyClick = async () => {
        if (!sessionId || !session?.user?.id || currentUserIsReady || isMarkingReady || !gameSession) return;

        setIsMarkingReady(true);
        setError(null);
        try {
            const response = await fetch(`/api/tournament-sessions/${sessionId}/ready`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: session.user.id }),
            });

            if (!response.ok) {
                let errorMsg = "Kunne ikke markere som klar.";
                try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) { /* Ignorer */ }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            toast.success("Du er markert som klar!");
            setCurrentUserIsReady(true);

            // Oppdater gameSession state manuelt for umiddelbar visuell endring
            setGameSession(prev => {
                 if (!prev) return null;
                 return {
                     ...prev,
                     participants: prev.participants.map(p =>
                         p.playerId === session?.user?.id ? { ...p, isReady: true } : p
                     )
                 };
             });

            if (result.gameStarted) {
                 // APIet indikerer at spillet startet
                 // console.log("API reported game started. Preparing redirect..."); // FJERN ELLER KOMMENTER UT
                 toast.success("Alle er klare! Starter spillet...", { duration: 2000 });
                 setTimeout(() => {
                    // console.log(`Redirecting from handleReadyClick to /turnerings-spill/${sessionId}/play`); // FJERN ELLER KOMMENTER UT
                    router.replace(`/turnerings-spill/${sessionId}/play`);
                 }, 1500);
            }
            // Polling vil uansett fange opp endelig status

        } catch (err) {
            console.error("Feil ved markering som klar:", err);
            const errorMessage = err instanceof Error ? err.message : "En feil oppstod.";
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsMarkingReady(false);
        }
    };

    // --- Rendering ---

    if (!sessionId) {
        return <div className="min-h-screen bg-gray-100 text-gray-900 p-8 flex items-center justify-center">Mangler sesjons-ID. Gå tilbake til turneringen.</div>;
    }

    if (loading) {
        // Skeleton Loader (som før)
        return (
            <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-start">
                 <div className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200">
                     <Skeleton className="h-8 w-1/4 mb-4 absolute top-4 left-4" /> {/* Back button placeholder */}
                     <Skeleton className="h-8 w-3/4 mx-auto mb-2" /> {/* Title */}
                     <Skeleton className="h-5 w-1/2 mx-auto mb-1" /> {/* Subtitle */}
                     <Skeleton className="h-4 w-1/3 mx-auto mb-6" /> {/* Course */}
                     <Skeleton className="h-6 w-1/3 mx-auto mb-4" /> {/* Participants header */}
                     <div className="space-y-3 mb-8 max-h-60 overflow-hidden">
                         {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
                     </div>
                     <Skeleton className="h-12 w-1/2 mx-auto rounded-lg" /> {/* Ready button placeholder */}
                 </div>
             </div>
        );
    }

    if (error && !gameSession) {
        // Feilmelding hvis ingen data kunne lastes (som før)
        return (
            <div className="min-h-screen bg-gray-100 text-gray-900 p-8 flex flex-col items-center justify-center text-center">
                 <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                 <h2 className="text-xl font-semibold text-red-700 mb-2">Oida, noe gikk galt</h2>
                <p className="text-red-600 mb-6">{error}</p>
                 <Button variant="outline" onClick={() => router.back()}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Prøv igjen / Tilbake
                 </Button>
            </div>
        );
    }

    if (!gameSession) {
        // Fallback hvis data mangler etter lasting (som før)
        return <div className="min-h-screen bg-gray-100 text-gray-900 p-8 flex items-center justify-center">Kunne ikke laste rundeinformasjon. Prøv å gå tilbake til turneringen.</div>;
    }

    // --- Beregnede verdier (som før) ---
    const participants = gameSession.participants ?? [];
    const readyCount = participants.filter(p => p.isReady).length;
    const totalParticipants = participants.length;
    const allReady = totalParticipants > 0 && readyCount === totalParticipants;

    // --- Vellykket lasting - Vis lobbyen ---
    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center items-start">
            <div className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200 relative">
                {/* Tilbake-knapp (som før) */}
                 <Button variant="ghost" size="sm" onClick={() => router.push(`/tournament/${gameSession.tournamentId}`)} className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 z-10">
                     <ArrowLeft className="mr-1 h-4 w-4" /> Tilbake til turnering
                 </Button>

                {/* Vis feilmelding under polling (som før) */}
                 {error && (
                     <div className="mb-4 mt-10 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-2">
                         <AlertCircle className="h-4 w-4 flex-shrink-0"/>
                         <span>{error} (Prøver fortsatt å oppdatere...)</span>
                     </div>
                 )}

                {/* Tittel og info (som før) */}
                <div className="text-center mb-6 pt-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{gameSession.tournamentName}</h1>
                    <p className="text-lg text-gray-600">Runde {gameSession.roundNumber} - Lobby</p>
                    <p className="text-sm text-gray-500 mt-1">Bane: {gameSession.course.name}</p>
                </div>

                {/* Deltakerliste (som før) */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center justify-center gap-2">
                        <Users className="h-5 w-5" /> Deltakere ({totalParticipants})
                    </h2>
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 border rounded-md p-3 bg-gray-50">
                        {participants.map((p) => (
                            <li key={p.id} className={`flex items-center justify-between p-3 rounded transition-colors duration-150 ${p.playerId === session?.user?.id ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-300">
                                         {p.playerImage ? (
                                             <Image
                                                 src={p.playerImage}
                                                 alt={p.playerName}
                                                 width={32}
                                                 height={32}
                                                 className="w-full h-full object-cover"
                                             />
                                         ) : (
                                             <UserIcon className="w-5 h-5 text-gray-500" />
                                         )}
                                     </div>
                                    <span className={`font-medium truncate ${p.playerId === session?.user?.id ? 'text-blue-800' : 'text-gray-800'}`} title={p.playerName}>
                                        {p.playerName} {p.playerId === session?.user?.id ? '(Deg)' : ''}
                                    </span>
                                </div>
                                {p.isReady ? (
                                    <span className="flex items-center text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full flex-shrink-0">
                                        <ShieldCheck className="h-3 w-3 mr-1" /> Klar
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-gray-500 flex-shrink-0">Venter...</span>
                                )}
                            </li>
                        ))}
                         {participants.length === 0 && <p className="text-center text-gray-500 py-4">Venter på at deltakere skal koble til...</p>}
                    </ul>
                </div>

                {/* Klar-knapp og status (som før) */}
                <div className="flex flex-col items-center text-center">
                     {!currentUserIsReady ? (
                         <Button
                            onClick={handleReadyClick}
                            disabled={isMarkingReady || !!error}
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white shadow-md w-full sm:w-auto px-8 disabled:bg-gray-400"
                         >
                             {isMarkingReady ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                             {isMarkingReady ? 'Markerer...' : 'Jeg er klar!'}
                         </Button>
                     ) : (
                         <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg w-full">
                             <p className="text-green-700 font-semibold text-lg mb-1 flex items-center justify-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-green-600"/> Du er klar!
                             </p>
                             <p className="text-sm text-gray-600">{readyCount} av {totalParticipants} klare.</p>
                             <p className="text-sm text-gray-600 mt-2 font-medium">{allReady ? "Starter spillet..." : "Venter på de andre spillerne..."}</p>
                             {allReady && <Loader2 className="h-5 w-5 text-green-500 animate-spin mx-auto mt-2"/>}
                             {!allReady && totalParticipants > 0 && (
                                 <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-3">
                                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(readyCount / totalParticipants) * 100}%` }}></div>
                                </div>
                             )}
                         </div>
                     )}
                     {error && !isMarkingReady && !currentUserIsReady && (
                        <p className="text-red-600 text-sm mt-3">Kunne ikke markere som klar på grunn av en feil. Se melding øverst.</p>
                     )}
                </div>
            </div>
        </div>
    );
}