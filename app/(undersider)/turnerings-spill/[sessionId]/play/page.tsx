// app/(undersider)/turnerings-spill/[sessionId]/play/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Trophy, Info } from 'lucide-react';
// Importer typen fra API-filen (denne skal nå inkludere obCount i throws)
import type { PlayData } from '@/app/api/tournament-sessions/[sessionId]/play-data/route';
// Juster importstien om nødvendig
import { TournamentScoreForm } from '@/components/tournaments/TournamentScoreForm';

// Type for data som kommer fra formen
interface ScoreInput {
    playerId: string;
    score: number;
    obCount: number;
}

export default function TournamentPlayPage() {
    const [playData, setPlayData] = useState<PlayData | null>(null);
    const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const params = useParams();
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const sessionId = params?.sessionId as string | undefined;

    // --- fetchPlayData (uendret, forventer at APIet returnerer obCount) ---
     const fetchPlayData = useCallback(async () => {
        if (!sessionId || authStatus !== 'authenticated' || !session?.user?.id) return;
        setLoading(true); setError(null); console.log(`Fetching play data for session: ${sessionId}`);
        try {
            const res = await fetch(`/api/tournament-sessions/${sessionId}/play-data`);
            console.log(`Fetch response status: ${res.status}`);
            if (!res.ok) {
                let errorMsg = "Kunne ikke hente spilldata."; let shouldRedirect = false; let redirectPath = '/turneringer';
                try { const d = await res.json(); errorMsg = d.error || errorMsg; console.error("API Error:", errorMsg); } catch (e) { console.error("Failed to parse error JSON:", e); }
                if (res.status === 409) { toast.error(errorMsg || "Spillet er ikke startet ennå."); redirectPath = `/turnerings-spill/${sessionId}/lobby`; shouldRedirect = true; }
                else if (res.status === 403) { toast.error(errorMsg || "Du har ikke tilgang til denne runden."); redirectPath = playData?.tournamentId ? `/tournament/${playData.tournamentId}` : '/turneringer'; shouldRedirect = true; }
                else if (res.status === 404) { toast.error(errorMsg || "Spillrunden finnes ikke."); redirectPath = '/turneringer'; shouldRedirect = true; }
                if (shouldRedirect) { router.replace(redirectPath); setError("Redirecting..."); setLoading(false); return; }
                throw new Error(errorMsg);
            }
            const data: PlayData = await res.json();
            console.log("Successfully fetched play data:", data);
            if (data.status === 'completed') { toast("Runden er allerede fullført."); router.replace(`/tournament/${data.tournamentId}`); return; }
            setPlayData(data); setCurrentHoleIndex(0);
        } catch (err) { console.error("Error in fetchPlayData:", err); const message = err instanceof Error ? err.message : "En ukjent feil oppstod"; if (error !== "Redirecting...") { setError(message); }
        } finally { if (error !== "Redirecting...") { setLoading(false); } }
    }, [sessionId, authStatus, session?.user?.id, router, playData?.tournamentId, error]);

    // --- useEffect for fetch (uendret) ---
     useEffect(() => {
        console.log(`Auth status: ${authStatus}`);
        if (authStatus === 'authenticated') { fetchPlayData(); }
        else if (authStatus === 'unauthenticated') { toast.error("Du må være logget inn for å spille."); router.push('/login'); }
    }, [authStatus, fetchPlayData, router]);


    // --- handleSaveScore (uendret, håndterer obCount) ---
    const handleSaveScore = useCallback(async (scoresForHole: ScoreInput[]) => {
        if (!sessionId || !playData) return;
        const currentHole = playData.course.holes[currentHoleIndex];
        if (!currentHole) return;
        setIsSaving(true); setError(null); console.log(`Saving scores for hole ${currentHole.holeNumber}`, scoresForHole);
        try {
            const response = await fetch(`/api/tournament-sessions/${sessionId}/score`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holeNumber: currentHole.holeNumber, scores: scoresForHole }),
            });
            console.log(`Save score response status: ${response.status}`);
            if (!response.ok) { let errorMsg = "Kunne ikke lagre score."; try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (e) {} throw new Error(errorMsg); }
            toast.success(`Score for hull ${currentHole.holeNumber} lagret!`);
            setPlayData(prevData => { // Oppdaterer lokal state
                if (!prevData) return null;
                const newData = structuredClone(prevData); const participantMap = new Map(newData.participants.map(p => [p.playerId, p.participationId]));
                scoresForHole.forEach(s => {
                    const participationId = participantMap.get(s.playerId);
                    if (participationId) {
                        const existingThrowIndex = newData.throws.findIndex( t => t.participationId === participationId && t.holeNumber === currentHole.holeNumber );
                        if (existingThrowIndex > -1) {
                            newData.throws[existingThrowIndex].score = s.score;
                            newData.throws[existingThrowIndex].obCount = s.obCount; // Oppdaterer OB
                        } else {
                            newData.throws.push({ id: `temp-${Date.now()}-${Math.random()}`, participationId: participationId, score: s.score, obCount: s.obCount, holeNumber: currentHole.holeNumber });
                        }
                    } else { console.warn(`Could not find participationId for ${s.playerId}`); }
                });
                console.log("Local playData state updated:", newData.throws); return newData;
            });
            if (currentHoleIndex < playData.course.holeCount - 1) { setCurrentHoleIndex(prevIndex => prevIndex + 1); }
            else { toast.success("Runde fullført!", { duration: 3000, icon: <Trophy /> }); router.push(`/tournament/${playData.tournamentId}`); }
        } catch (err) { console.error("Error saving score:", err); const errorMsg = err instanceof Error ? err.message : "Ukjent feil ved lagring."; setError(errorMsg); toast.error(errorMsg); }
        finally { setIsSaving(false); }
    }, [sessionId, playData, currentHoleIndex, router]);

    // --- Navigasjonsfunksjoner (uendret) ---
    const goToNextHole = () => { if (!playData || currentHoleIndex >= playData.course.holeCount - 1) return; setCurrentHoleIndex(prev => prev + 1); };
    const goToPreviousHole = () => { if (currentHoleIndex <= 0) return; setCurrentHoleIndex(prev => prev - 1); };


    // --- Rendering ---

    // --- Returnerer Skeleton UI ---
    if (loading || authStatus === 'loading') {
        return (
            <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
                <div className="w-full max-w-xl space-y-6"> {/* Økt bredde */}
                    <Skeleton className="h-10 w-3/4 mx-auto" /> {/* Tittel */}
                    <Skeleton className="h-6 w-1/2 mx-auto" /> {/* Runde/bane */}
                     {/* Skeleton for form */}
                     <div className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                         {/* Grid for layout */}
                         <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 sm:gap-x-4 items-center mb-2">
                              <Skeleton className="h-5 w-1/3" /> {/* Spiller heading */}
                              <Skeleton className="h-5 w-16" /> {/* Kast heading */}
                              <Skeleton className="h-5 w-16" /> {/* OB heading */}
                         </div>
                         {/* Skeleton for player rows */}
                         {[...Array(4)].map((_, i) => (
                              <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-x-3 sm:gap-x-4 items-center">
                                  <Skeleton className="h-6 w-full" /> {/* Player name */}
                                  <Skeleton className="h-10 w-16" /> {/* Score input */}
                                  <Skeleton className="h-10 w-28" /> {/* OB controls */}
                              </div>
                         ))}
                         <Skeleton className="h-11 w-full mt-6" /> {/* Save button */}
                     </div>
                     {/* Skeleton for navigation */}
                    <div className="flex justify-between mt-4">
                         <Skeleton className="h-10 w-28" /> {/* Prev button */}
                         <Skeleton className="h-10 w-28" /> {/* Next button */}
                    </div>
                 </div>
            </div>
        );
    }

    // --- Returnerer Feilside ---
     if (error && error !== "Redirecting...") {
         return (
             <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center text-center">
                 <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                 <h2 className="text-xl font-semibold text-red-700 mb-2">Feil ved lasting av spill</h2>
                 <p className="text-red-600 mb-6">{error}</p>
                  <div className='flex gap-4'>
                     <Button variant="outline" onClick={fetchPlayData} disabled={loading}>
                          Prøv igjen
                     </Button>
                      <Button variant="secondary" onClick={() => router.back()}>
                           Tilbake
                      </Button>
                  </div>
             </div>
         );
     }

    // --- Returnerer Fallback hvis ingen data ---
    if (!playData) {
        return <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">Kunne ikke laste spilldata. Prøv å gå tilbake.</div>;
    }

    // --- Returnerer Fallback hvis ugyldig hull ---
    const currentHole = playData.course.holes[currentHoleIndex];
    if (!currentHole) {
         console.error(`Ugyldig hullindeks: ${currentHoleIndex} for ${playData.course.holeCount} hull.`);
         setError(`Kunne ikke finne data for hull ${currentHoleIndex + 1}.`);
         return (
             <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center text-center">
                 <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                 <h2 className="text-xl font-semibold text-red-700 mb-2">Intern feil</h2>
                 <p className="text-red-600 mb-6">{error || 'Kunne ikke finne hulldata.'}</p>
                  <Button variant="secondary" onClick={() => router.back()}> Tilbake </Button>
             </div>
         );
    }

    // --- Forbered data for form (uendret, henter nå obCount fra throws) ---
    const participantsForForm = playData.participants.map(p => {
        const currentThrow = playData.throws.find( t => t.participationId === p.participationId && t.holeNumber === currentHole.holeNumber );
        return {
            playerId: p.playerId,
            playerName: p.playerName,
            currentScore: currentThrow?.score,
            currentOb: currentThrow?.obCount ?? 0 // Henter obCount
        };
    });

    // --- Hoved-rendering ---
    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
             <div className="text-center mb-6 w-full max-w-xl"> {/* Økt bredde */}
                 <h1 className="text-2xl font-bold text-gray-800">{playData.tournamentName}</h1>
                 <p className="text-lg text-gray-600">Runde {playData.roundNumber} - {playData.course.name}</p>
             </div>

            {/* Scorekort-komponent */}
            <TournamentScoreForm
                key={currentHole.id} // Bruker nå den genererte hull-IDen som key
                holeData={{ id: currentHole.id, holeNumber: currentHole.holeNumber, par: currentHole.par, distance: currentHole.distance }}
                participants={participantsForForm}
                onSaveScore={handleSaveScore}
                isSaving={isSaving}
            />

             {/* Feilmelding */}
             {error && !isSaving && error !== "Redirecting..." && (
                 <p className="text-red-600 text-sm mt-3 text-center max-w-xl">{error}</p>
             )}

            {/* Navigasjonsknapper */}
            <div className="flex justify-between items-center mt-6 w-full max-w-xl">
                <Button onClick={goToPreviousHole} disabled={currentHoleIndex === 0 || isSaving} variant="outline" aria-label="Forrige hull"> <ArrowLeft className="h-4 w-4" /> </Button>
                <span className="text-center font-medium text-gray-700 self-center px-4" aria-live="polite"> Hull {currentHole.holeNumber} / {playData.course.holeCount} </span>
                <Button onClick={goToNextHole} disabled={currentHoleIndex === playData.course.holeCount - 1 || isSaving} variant="outline" aria-label="Neste hull"> <ArrowRight className="h-4 w-4" /> </Button>
            </div>

              {/* Fullfør-knapp */}
              {currentHoleIndex === playData.course.holeCount - 1 && !isSaving && (
                    <Button className="mt-6 bg-green-600 hover:bg-green-700" onClick={() => { toast("Siste hull. Lagre score for å fullføre."); }} disabled={isSaving} >
                        <CheckCircle className="mr-2 h-4 w-4" /> Fullfør & Lagre Siste Hull
                    </Button>
              )}
        </div>
    );
}