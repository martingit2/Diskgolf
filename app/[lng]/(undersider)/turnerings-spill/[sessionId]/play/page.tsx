// Fil: src/app/(undersider)/turnerings-spill/[sessionId]/play/page.tsx
// Formål: Klientkomponent som håndterer selve spillingen av en turneringsrunde. Viser scorekort for gjeldende hull, lar brukeren registrere score, og navigerer mellom hullene.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Trophy, Info, UserX, Sparkles } from 'lucide-react';
import type { PlayData } from '@/app/api/tournament-sessions/[sessionId]/play-data/route';
import { TournamentScoreForm } from '@/components/tournaments/TournamentScoreForm';
import { cn } from '@/app/lib/utils'; // Importer cn hvis ikke allerede gjort

// Typer (uendret)
interface ScoreInput { playerId: string; score: number; obCount: number; }
interface PlayerFormData { playerId: string; playerName: string; currentScore: number | undefined; currentOb: number; }

export default function TournamentPlayPage() {
    const [playData, setPlayData] = useState<PlayData | null>(null);
    const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [loggedInPlayerFormData, setLoggedInPlayerFormData] = useState<PlayerFormData | null>(null);
    const [playersWithHonor, setPlayersWithHonor] = useState<string[]>([]);

    const params = useParams();
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const sessionId = params?.sessionId as string | undefined;

    // --- Funksjon for å beregne Honor ---
    const calculateHonor = useCallback((holeIndex: number, data: PlayData | null): string[] => {
        // --- KORRIGERT: Null-sjekk for data ---
        if (!data || !data.participants || !data.course?.holes) {
            console.warn("calculateHonor kalt uten gyldig playData.");
            return []; // Returner tom array hvis data mangler
        }
        // På hull 1 (indeks 0), har alle honor
        if (holeIndex <= 0) {
            return data.participants.map(p => p.playerId) ?? [];
        }

        const previousHoleNumber = data.course.holes[holeIndex - 1]?.holeNumber;
        if (previousHoleNumber === undefined) {
            console.warn(`Kunne ikke finne forrige hullnummer for indeks ${holeIndex}`);
            return data.participants.map(p => p.playerId) ?? []; // Fallback: alle har honor
        }

        let lowestScore = Infinity;
        const scoresOnPreviousHole: { playerId: string; totalScore: number }[] = [];

        for (const participant of data.participants) {
            const playerThrow = data.throws.find(
                t => t.participationId === participant.participationId && t.holeNumber === previousHoleNumber
            );
            if (playerThrow) {
                const totalScore = playerThrow.score + playerThrow.obCount;
                scoresOnPreviousHole.push({ playerId: participant.playerId, totalScore });
                if (totalScore < lowestScore) {
                    lowestScore = totalScore;
                }
            }
        }

        if (lowestScore === Infinity || scoresOnPreviousHole.length === 0) {
             return data.participants.map(p => p.playerId) ?? [];
        }

        const honoredPlayers = scoresOnPreviousHole
            .filter(scoreData => scoreData.totalScore === lowestScore)
            .map(scoreData => scoreData.playerId);

        return honoredPlayers;
    }, []);

    // --- fetchPlayData ---
     const fetchPlayData = useCallback(async () => {
        if (!sessionId || authStatus !== 'authenticated' || !session?.user?.id) return;
        setLoading(true); setError(null); setLoggedInPlayerFormData(null); setPlayersWithHonor([]);
        console.log(`Fetching play data for session: ${sessionId}`);
        try {
            const res = await fetch(`/api/tournament-sessions/${sessionId}/play-data`);
            console.log(`Fetch response status: ${res.status}`);
             if (!res.ok) {
                 let errorMsg = "Kunne ikke hente spilldata."; let shouldRedirect = false; let redirectPath = '/turneringer';
                 try { const d = await res.json(); errorMsg = d.error || errorMsg; console.error("API Error:", errorMsg); } catch (e) { console.error("Failed to parse error JSON:", e); }
                 if (res.status === 409) { toast.error(errorMsg || "Spillet er ikke startet ennå."); redirectPath = `/turnerings-spill/${sessionId}/lobby`; shouldRedirect = true; }
                 else if (res.status === 403) { const tournamentIdOnError = (await res.clone().json().catch(() => ({})))?.tournamentId; toast.error(errorMsg || "Du har ikke tilgang til denne runden."); redirectPath = tournamentIdOnError ? `/tournament/${tournamentIdOnError}` : '/turneringer'; shouldRedirect = true; }
                 else if (res.status === 404) { toast.error(errorMsg || "Spillrunden finnes ikke."); redirectPath = '/turneringer'; shouldRedirect = true; }
                 if (shouldRedirect) { router.replace(redirectPath); setError("Redirecting..."); setLoading(false); return; }
                 throw new Error(errorMsg);
            }
            const data: PlayData = await res.json();
            console.log("Successfully fetched play data:", data);
            if (data.status === 'completed') { toast.success("Runden er allerede fullført."); router.replace(`/tournament/${data.tournamentId}`); return; }

            setPlayData(data);
            setCurrentHoleIndex(0);

            const loggedInParticipant = data.participants.find(p => p.playerId === session.user.id);
            if (loggedInParticipant && data.course?.holes?.[0]) { // Sikre at første hull finnes
                const firstHoleNumber = data.course.holes[0].holeNumber;
                const firstThrow = data.throws.find(t => t.participationId === loggedInParticipant.participationId && t.holeNumber === firstHoleNumber);
                setLoggedInPlayerFormData({playerId: loggedInParticipant.playerId, playerName: loggedInParticipant.playerName, currentScore: firstThrow?.score, currentOb: firstThrow?.obCount ?? 0, });
                const initialHonors = calculateHonor(0, data);
                setPlayersWithHonor(initialHonors);
            } else {
                 console.error("Innlogget bruker ikke funnet, eller banedata mangler.");
                 setError("Kunne ikke finne din deltakelse eller nødvendig banedata.");
                 setPlayData(null);
            }
        } catch (err) {
            console.error("Error in fetchPlayData:", err);
            const message = err instanceof Error ? err.message : "En ukjent feil oppstod";
            if (error !== "Redirecting...") { setError(message); }
        } finally {
             if (error !== "Redirecting...") { setLoading(false); }
        }
    }, [sessionId, authStatus, session?.user?.id, router, calculateHonor]); // Fjernet 'error' dependency

    // useEffect for fetch
    useEffect(() => {
        if (authStatus === 'authenticated') { fetchPlayData(); }
        else if (authStatus === 'unauthenticated') { toast.error("Du må være logget inn for å spille."); router.push('/login'); }
    }, [authStatus, fetchPlayData, router]);

    // handleSaveScore
    const handleSaveScore = useCallback(async (scoreInput: ScoreInput) => {
        // --- KORRIGERT: Null-sjekk for playData her også ---
        if (!sessionId || !playData || !loggedInPlayerFormData) {
             console.error("handleSaveScore kalt uten nødvendig data.");
             return;
        }
        const currentHole = playData.course.holes[currentHoleIndex];
        if (!currentHole) {
             console.error(`Ugyldig hullindeks ${currentHoleIndex} i handleSaveScore.`);
             return;
        }
        if (scoreInput.playerId !== loggedInPlayerFormData.playerId) { toast.error("Sikkerhetsfeil: Kan ikke lagre score for andre."); return; }

        setIsSaving(true); setError(null);
        let updatedPlayData = playData; // Midlertidig variabel for oppdatert data

        try {
            const response = await fetch(`/api/tournament-sessions/${sessionId}/score`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ holeNumber: currentHole.holeNumber, scores: [scoreInput] }), });
            if (!response.ok) { let errorMsg = "Kunne ikke lagre score."; try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch (e) {} throw new Error(errorMsg); }
            toast.success(`Din score for hull ${currentHole.holeNumber} er lagret!`);

            // Oppdater lokal playData state og lagre i midlertidig variabel
            setPlayData(prevData => {
                if (!prevData) return null;
                const newData = structuredClone(prevData);
                const participationId = loggedInPlayerFormData?.playerId ? prevData.participants.find(p => p.playerId === loggedInPlayerFormData.playerId)?.participationId : null;
                if (participationId) {
                    const existingThrowIndex = newData.throws.findIndex( t => t.participationId === participationId && t.holeNumber === currentHole.holeNumber );
                    if (existingThrowIndex > -1) { newData.throws[existingThrowIndex].score = scoreInput.score; newData.throws[existingThrowIndex].obCount = scoreInput.obCount; }
                    else { newData.throws.push({ id: `temp-${Date.now()}-${Math.random()}`, participationId: participationId, score: scoreInput.score, obCount: scoreInput.obCount, holeNumber: currentHole.holeNumber }); }
                    updatedPlayData = newData; // Oppdater midlertidig variabel
                } else { console.warn(`Could not find participationId`); }
                return newData;
            });

            // Gå til neste hull eller fullfør
            if (currentHoleIndex < playData.course.holeCount - 1) {
                 const nextHoleIndex = currentHoleIndex + 1;
                 // Finn data for neste hull basert på den *oppdaterte* playData
                 const nextHoleNumber = updatedPlayData.course.holes[nextHoleIndex]?.holeNumber;
                 const participationId = loggedInPlayerFormData?.playerId ? updatedPlayData.participants.find(p => p.playerId === loggedInPlayerFormData.playerId)?.participationId : null;
                 const nextThrow = participationId && nextHoleNumber ? updatedPlayData.throws.find(t => t.participationId === participationId && t.holeNumber === nextHoleNumber) : undefined;

                 setLoggedInPlayerFormData(prev => prev ? { ...prev, currentScore: nextThrow?.score, currentOb: nextThrow?.obCount ?? 0 } : null);
                 setCurrentHoleIndex(nextHoleIndex);
                 // Oppdater honor for neste hull, bruk den *oppdaterte* playData
                 const honorsForNext = calculateHonor(nextHoleIndex, updatedPlayData);
                 setPlayersWithHonor(honorsForNext);
            } else {
                toast.success("Runde fullført!", { duration: 3000, icon: <Trophy /> });
                router.push(`/tournament/${playData.tournamentId}`);
            }
        } catch (err) {
            console.error("Error saving score:", err); const errorMsg = err instanceof Error ? err.message : "Ukjent feil ved lagring."; setError(errorMsg); toast.error(errorMsg);
        } finally { setIsSaving(false); }
    }, [sessionId, playData, currentHoleIndex, router, loggedInPlayerFormData, calculateHonor]);

    // updateFormDataForHole
     const updateFormDataForHole = (index: number) => {
         // --- KORRIGERT: Null-sjekk for playData ---
         if (!playData || !loggedInPlayerFormData || !playData.course?.holes || !playData.participants) return;
         const targetHole = playData.course.holes[index];
         if (!targetHole) return;
         const participationId = playData.participants.find(p => p.playerId === loggedInPlayerFormData.playerId)?.participationId;
         if (!participationId) return;
         const targetThrow = playData.throws.find( t => t.participationId === participationId && t.holeNumber === targetHole.holeNumber );
         setLoggedInPlayerFormData(prev => prev ? { ...prev, currentScore: targetThrow?.score, currentOb: targetThrow?.obCount ?? 0, } : null);
     };

    // --- Navigasjonsfunksjoner ---
     const goToNextHole = () => {
         // --- KORRIGERT: Null-sjekk for playData ---
         if (!playData || currentHoleIndex >= playData.course.holeCount - 1) return;
         const nextIndex = currentHoleIndex + 1;
         setCurrentHoleIndex(nextIndex);
         updateFormDataForHole(nextIndex);
         const honors = calculateHonor(nextIndex, playData);
         setPlayersWithHonor(honors);
     };
     const goToPreviousHole = () => {
          // --- KORRIGERT: Null-sjekk for playData ---
         if (!playData || currentHoleIndex <= 0) return;
         const prevIndex = currentHoleIndex - 1;
         setCurrentHoleIndex(prevIndex);
         updateFormDataForHole(prevIndex);
         const honors = calculateHonor(prevIndex, playData);
         setPlayersWithHonor(honors);
     };

    // --- Rendering ---

    // Skeleton
    if (loading || authStatus === 'loading') {
        return (
            <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
                 <div className="w-full max-w-xl space-y-6">
                     <Skeleton className="h-10 w-3/4 mx-auto" />
                     <Skeleton className="h-6 w-1/2 mx-auto mb-5" />
                     {/* Skeleton for Honor Card */}
                     <Skeleton className="h-16 w-full max-w-xl mx-auto mb-5" />
                     {/* Skeleton for Form Card */}
                     <Skeleton className="h-64 w-full max-w-xl mx-auto" />
                     {/* Skeleton for Navigation */}
                     <div className="flex justify-between mt-6 w-full max-w-xl">
                         <Skeleton className="h-10 w-10" />
                         <Skeleton className="h-6 w-24 self-center" />
                         <Skeleton className="h-10 w-10" />
                     </div>
                 </div>
            </div>
        );
    }

    // Feilside
     if (error && error !== "Redirecting...") {
         return (
             <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center text-center">
                 <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                 <h2 className="text-xl font-semibold text-red-700 mb-2">Feil ved lasting av spill</h2>
                 <p className="text-red-600 mb-6">{error}</p>
                  <div className='flex gap-4'>
                     <Button variant="outline" onClick={fetchPlayData} disabled={loading}> Prøv igjen </Button>
                      <Button variant="secondary" onClick={() => router.back()}> Tilbake </Button>
                  </div>
             </div>
         );
     }

    // Fallback hvis ingen spilldata
    if (!playData || !loggedInPlayerFormData) {
        return (
            <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <UserX className="w-12 h-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Ingen spilldata funnet</h2>
                <p className="text-gray-600 mb-6">Kunne ikke laste spilldata, eller du er ikke registrert som deltaker i denne runden.</p>
                 <Button variant="secondary" onClick={() => router.back()}> Tilbake </Button>
            </div>
        );
    }

    // Fallback hvis ugyldig hull
    const currentHole = playData.course.holes[currentHoleIndex];
    if (!currentHole) {
         console.error(`Ugyldig hullindeks: ${currentHoleIndex} for ${playData.course.holeCount} hull.`);
         setError(`Kunne ikke finne data for hull ${currentHoleIndex + 1}.`); // Sett error state slik at feilsiden vises
         return ( // Returnerer en tom div mens state oppdateres og re-render skjer
             <div>Laster feilmelding...</div>
         );
    }

    // --- KORRIGERT: Opprett array kun hvis data finnes ---
    const participantsForFormArray: PlayerFormData[] = loggedInPlayerFormData ? [loggedInPlayerFormData] : [];

    // --- Hoved-rendering ---
    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
             <div className="text-center mb-6 w-full max-w-xl">
                 <h1 className="text-2xl font-bold text-gray-800">{playData.tournamentName}</h1>
                 <p className="text-lg text-gray-600">Runde {playData.roundNumber} - {playData.course.name}</p>
             </div>

             {/* Honor Display */}
             {/* --- KORRIGERT: La til null-sjekker og optional chaining --- */}
             {playData && playersWithHonor.length > 0 && currentHole && (
                 <Card className="w-full max-w-xl mx-auto mb-5 border-blue-200 bg-blue-50 shadow-sm">
                     <CardHeader className="p-3 px-4">
                         <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                             <Sparkles className="w-4 h-4 text-blue-600" />
                             Starter på hull {currentHole.holeNumber}:
                         </CardTitle>
                         <CardDescription className="text-base text-blue-900 font-semibold pt-1">
                             {(currentHoleIndex === 0 || playersWithHonor.length === playData.participants?.length)
                                  ? "Alle spillere"
                                  : playersWithHonor.map(playerId =>
                                       playData.participants?.find(p => p.playerId === playerId)?.playerName ?? 'Ukjent'
                                    ).join(' / ')
                              }
                         </CardDescription>
                     </CardHeader>
                 </Card>
             )}

            {/* Score Form - Vis kun hvis vi har data */}
            {participantsForFormArray.length > 0 && (
                 <TournamentScoreForm
                     key={`${sessionId}-${currentHole.holeNumber}`}
                     holeData={{ id: `hole-${currentHole.holeNumber}`, holeNumber: currentHole.holeNumber, par: currentHole.par, distance: currentHole.distance }}
                     participants={participantsForFormArray}
                     onSaveScore={async (scores: ScoreInput[]) => { if (scores && scores.length > 0) { await handleSaveScore(scores[0]); } else { console.error("Tom score-array."); toast.error("Kunne ikke lagre score: Manglende data."); } }}
                     isSaving={isSaving}
                 />
            )}

             {/* Feilmelding */}
             {error && !isSaving && error !== "Redirecting..." && ( <p className="text-red-600 text-sm mt-3 text-center max-w-xl">{error}</p> )}

            {/* Navigasjonsknapper */}
             {/* --- KORRIGERT: Null-sjekk for playData før rendering --- */}
             {playData && (
                 <div className="flex justify-between items-center mt-6 w-full max-w-xl">
                     <Button onClick={goToPreviousHole} disabled={currentHoleIndex === 0 || isSaving} variant="outline" aria-label="Forrige hull"> <ArrowLeft className="h-4 w-4" /> </Button>
                     <span className="text-center font-medium text-gray-700 self-center px-4" aria-live="polite"> Hull {currentHole.holeNumber} / {playData.course.holeCount} </span>
                     <Button onClick={goToNextHole} disabled={currentHoleIndex === playData.course.holeCount - 1 || isSaving} variant="outline" aria-label="Neste hull"> <ArrowRight className="h-4 w-4" /> </Button>
                 </div>
             )}

            {/* Fullfør-knapp */}
             {/* --- KORRIGERT: Null-sjekk for playData før rendering --- */}
            {playData && currentHoleIndex === playData.course.holeCount - 1 && !isSaving && (
                <Button className="mt-6 bg-green-600 hover:bg-green-700" onClick={() => { toast("Lagre score for siste hull for å fullføre runden."); }} disabled={isSaving} >
                    <CheckCircle className="mr-2 h-4 w-4" /> Lagre Siste Hull & Fullfør
                </Button>
            )}
        </div>
    );
}