// app/(undersider)/tournament/[id]/page.tsx
"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TournamentStatus } from "@prisma/client";
import { Loader2, Play, Settings, ListChecks, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Komponenter
import { TournamentHeader } from "@/components/tournaments/details/TournamentHeader";
import { TournamentStatusBanner } from "@/components/tournaments/details/TournamentStatusBanner";
import { TournamentDetailsCard } from "@/components/tournaments/details/TournamentDetailsCard";
import { TournamentAdminPanel } from "@/components/tournaments/details/TournamentAdminPanel";
import { TournamentLeaderboardPreview } from "@/components/tournaments/details/TournamentLeaderbordPreview";
import { TournamentParticipantsCard } from "@/components/tournaments/details/TournamentParticipantCard";
import { TournamentWinnerDisplay } from "@/components/tournaments/details/TournamentWinnerDisplay"; // Vinner-display

// Typer
import type { PlayData } from '@/app/api/tournament-sessions/[sessionId]/play-data/route';

interface PlayerResult {
    rank: number; playerId: string; playerName: string; totalStrokes: number;
    totalOb: number; totalScore: number; scoreRelativeToPar: number; holeScores: any[];
}

interface Tournament {
    id: string; name: string; description: string | null; startDate: string;
    endDate: string | null; status: TournamentStatus; maxParticipants: number | null;
    location: string; image: string | null;
    course: { id: string; name: string; location: string | null; image: string | null; par: number | null; numHoles: number | null; baskets: {id: string}[] | null };
    organizer: { id: string; name: string | null; }; club: { id: string; name: string; } | null;
    participants: { id: string; name: string | null; }[];
    _count: { participants: number; };
}

interface User { id: string; name: string | null; email: string | null; }
type SessionStatus = 'waiting' | 'inProgress' | 'completed' | null;

// Interface for endelige resultater (standings)
interface StandingPlayer {
    rank: number; playerId: string; playerName: string;
    playerImage?: string | null; totalScore: number; totalOb: number;
    tournamentId: string;
}

// --- Hovedkomponent ---
export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
    // --- State ---
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isStartingRound, setIsStartingRound] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [activeSessionStatus, setActiveSessionStatus] = useState<SessionStatus>(null);
    const [isLoadingSessionId, setIsLoadingSessionId] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState<PlayData | null>(null);
    const [leaderboardResults, setLeaderboardResults] = useState<PlayerResult[]>([]);
    const [leaderboardTotalPar, setLeaderboardTotalPar] = useState<number>(0);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
    const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
    const [standings, setStandings] = useState<StandingPlayer[]>([]);
    const [isLoadingStandings, setIsLoadingStandings] = useState(false);
    const [standingsError, setStandingsError] = useState<string | null>(null);

    const router = useRouter();
    const { id: tournamentId } = use(params);

    // --- Callbacks for Datahenting ---
    useEffect(() => { fetch("/api/auth").then((res) => (res.ok ? res.json() : null)).then(setUser).catch(() => setUser(null)); }, []);

    useEffect(() => {
        if (!tournamentId) return;
        setLoading(true);
        fetch(`/api/tournaments/${tournamentId}`)
            .then((res) => { if (!res.ok) throw new Error(res.status === 404 ? "Turnering ikke funnet" : "Kunne ikke hente turnering"); return res.json(); })
            .then(setTournament)
            .catch((error) => { console.error("Feil henting turnering:", error); toast.error(error.message); router.push("/turneringer"); })
            .finally(() => setLoading(false));
    }, [tournamentId, router]);

    const fetchActiveSession = useCallback(async () => {
        if (!tournamentId || !user) return;
        setIsLoadingSessionId(true); setActiveSessionId(null); setActiveSessionStatus(null);
        try {
            const res = await fetch(`/api/tournaments/${tournamentId}/active-session`);
            if (!res.ok) return; // Ikke nødvendigvis en feil hvis ingen aktiv sesjon finnes
            const data = await res.json();
            setActiveSessionId(data?.sessionId ?? null);
            setActiveSessionStatus(data?.sessionStatus ?? null);
        } catch (error) { console.error("Feil henting aktiv sesjon:", error); }
        finally { setIsLoadingSessionId(false); }
    }, [tournamentId, user]);

    const calculateResults = useCallback((data: PlayData): { results: PlayerResult[], par: number } => {
        // ... (samme beregningslogikk som før) ...
         if (!data || !data.participants || !data.course?.holes || data.course.holes.length === 0) return { results: [], par: 0 };
         const calculatedTotalPar = data.course.holes.reduce((sum, hole) => sum + (hole.par ?? 3), 0);
         const participantScores: { [key: string]: Omit<PlayerResult, 'rank'> & { participationId: string } } = {};
         data.participants.forEach(p => { participantScores[p.participationId] = { participationId: p.participationId, playerId: p.playerId, playerName: p.playerName, totalStrokes: 0, totalOb: 0, totalScore: 0, scoreRelativeToPar: 0, holeScores: data.course.holes.map(h => ({ holeNumber: h.holeNumber, strokes: null, obCount: null, scoreRelativeToPar: null })) }; });
         data.throws.forEach(t => { const pr = participantScores[t.participationId]; if (pr) { pr.totalStrokes += t.score; pr.totalOb += t.obCount; const holeIndex = pr.holeScores.findIndex(hs => hs.holeNumber === t.holeNumber); if (holeIndex > -1) { const holePar = data.course.holes.find(h => h.holeNumber === t.holeNumber)?.par ?? 3; pr.holeScores[holeIndex].strokes = t.score; pr.holeScores[holeIndex].obCount = t.obCount; pr.holeScores[holeIndex].scoreRelativeToPar = t.score + t.obCount - holePar; } } });
         const results: Omit<PlayerResult, 'rank'>[] = Object.values(participantScores).map(p => { const totalScore = p.totalStrokes + p.totalOb; const scoreRelativeToPar = totalScore - calculatedTotalPar; return { ...p, totalScore, scoreRelativeToPar }; });
         results.sort((a, b) => { if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore; return a.playerName.localeCompare(b.playerName); });
         const rankedResults: PlayerResult[] = []; let currentRank = 0;
         results.forEach((result, index) => { if (index === 0 || result.totalScore > (results[index - 1]?.totalScore ?? -Infinity)) { currentRank = index + 1; } rankedResults.push({ ...result, rank: currentRank }); });
         return { results: rankedResults, par: calculatedTotalPar };
    }, []);

    const fetchLeaderboardData = useCallback(async () => {
        if (!activeSessionId) return;
        setIsLoadingLeaderboard(true); setLeaderboardError(null);
        try {
            const res = await fetch(`/api/tournament-sessions/${activeSessionId}/play-data`);
            if (!res.ok) { let err = "Kunne ikke hente leaderboard."; try { err = (await res.json()).error || err; } catch (e) {} if (res.status === 409) err = `Leaderboard ikke klar (status: ${activeSessionStatus || 'ukjent'}).`; throw new Error(err); }
            const data: PlayData = await res.json();
            setLeaderboardData(data);
            if (data?.course?.holes) { const { results, par } = calculateResults(data); setLeaderboardResults(results); setLeaderboardTotalPar(par); }
            else { throw new Error("Mangler banedata i leaderboard."); }
        } catch (err) { console.error("Feil henting leaderboard:", err); setLeaderboardError(err instanceof Error ? err.message : "Ukjent feil"); setLeaderboardData(null); setLeaderboardResults([]); setLeaderboardTotalPar(0); }
        finally { setIsLoadingLeaderboard(false); }
    }, [activeSessionId, activeSessionStatus, calculateResults]);

    // Hent endelige resultater (standings)
    const fetchStandings = useCallback(async () => {
        if (!tournamentId) return;
        setIsLoadingStandings(true); setStandingsError(null);
        console.log(`Fetching final standings for tournament ${tournamentId}`); // Logging
        try {
            const res = await fetch(`/api/tournaments/${tournamentId}/standings`);
            if (!res.ok) { let err = "Kunne ikke hente resultater."; try { err = (await res.json()).error || err; } catch (e) {} throw new Error(err); }
            const data: StandingPlayer[] = await res.json();
            console.log("Fetched final standings data:", data); // Logging
            setStandings(data); // Data har allerede tournamentId fra API
        } catch (err) { console.error("Feil henting standings:", err); setStandingsError(err instanceof Error ? err.message : "Ukjent feil"); setStandings([]); }
        finally { setIsLoadingStandings(false); }
    }, [tournamentId]);

    // --- useEffects ---
    useEffect(() => { if (tournament?.status === TournamentStatus.IN_PROGRESS && user) fetchActiveSession(); else { setActiveSessionId(null); setActiveSessionStatus(null); } }, [tournament?.status, user, fetchActiveSession]);
    useEffect(() => { if (activeSessionId && activeSessionStatus === 'inProgress') fetchLeaderboardData(); else { setLeaderboardData(null); setLeaderboardResults([]); setLeaderboardTotalPar(0); setLeaderboardError(null); } }, [activeSessionId, activeSessionStatus, fetchLeaderboardData]);
    useEffect(() => { if (tournament?.status === TournamentStatus.COMPLETED) fetchStandings(); else { setStandings([]); setStandingsError(null); } }, [tournament?.status, fetchStandings]);

    // --- Handlings-Callbacks ---
    const handleRegister = useCallback(async () => { if (!user || !tournament) return; setIsRegistering(true); try { const r = await fetch("/api/tournaments/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tournamentId:tournament.id,playerId:user.id})}); if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Påmelding feilet")} setTournament(await r.json());toast.success("Påmeldt!")} catch(e){console.error(e);toast.error(e instanceof Error?e.message:"Feil")} finally{setIsRegistering(false)} }, [user, tournament]);
    const handleStartRound = useCallback(async () => { if (!tournament || !user || user.id !== tournament.organizer.id || isStartingRound) return; setIsStartingRound(true); try { const r = await fetch(`/api/tournaments/${tournament.id}/start-round`,{method:'POST'}); if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Kunne ikke starte runde")} const { sessionId } = await r.json(); setActiveSessionId(sessionId); setActiveSessionStatus('waiting'); toast.success("Runde startet, lobby er klar!") } catch(e){console.error(e);toast.error(e instanceof Error?e.message:"Feil")} finally{setIsStartingRound(false)} }, [tournament, user, isStartingRound]);

    // --- OPPGRADERT handleStatusUpdate ---
    const handleStatusUpdate = useCallback(async (newStatus: TournamentStatus) => {
        if (!user || !tournament || user.id !== tournament.organizer.id) return;
        setIsUpdatingStatus(true);
        let statusUpdateSuccess = false;
        try {
            // 1. Oppdater status
            const statusResponse = await fetch("/api/tournaments/status", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tournamentId: tournament.id, status: newStatus })
            });
            if (!statusResponse.ok) { const err = await statusResponse.json().catch(() => ({})); throw new Error(err.error || "Statusoppdatering feilet"); }

            const updatedTournament = await statusResponse.json();
            setTournament(updatedTournament); // Viktig: Oppdater state FØR finalize
            toast.success("Status oppdatert!");
            statusUpdateSuccess = true;

            // 2. Kall finalize hvis status er COMPLETED
            if (newStatus === TournamentStatus.COMPLETED) {
                console.log(`Status satt til COMPLETED for ${tournament.id}. Kaller finalize API...`);
                toast.loading("Lagrer endelige resultater...");

                const finalizeResponse = await fetch(`/api/tournaments/${tournament.id}/finalize`, { method: 'POST' });
                toast.dismiss();

                if (!finalizeResponse.ok) { const finalizeError = await finalizeResponse.json().catch(() => ({})); throw new Error(finalizeError.error || "Kunne ikke lagre resultater."); }

                const finalizeResult = await finalizeResponse.json();
                console.log("Finalize API response:", finalizeResult);
                toast.success(finalizeResult.message || "Endelige resultater lagret!");
                fetchStandings(); // Hent standings på nytt for å vise dem
            }

        } catch (e) {
            console.error("Feil under statusoppdatering/finalisering:", e);
            toast.error(e instanceof Error ? e.message : "En feil oppstod");
        } finally {
            setIsUpdatingStatus(false);
        }
    }, [user, tournament, fetchStandings]); // Legg til fetchStandings
    // --- SLUTT OPPGRADERING ---


    // --- Render ---
    if (loading) { return ( <div className="max-w-4xl mx-auto p-6 space-y-6"> <Skeleton className="h-48 w-full" /> <Skeleton className="h-12 w-1/2" /> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div> </div> ); }
    if (!tournament) { return <div className="max-w-4xl mx-auto p-6 text-center text-red-500">Turnering ikke funnet.</div>; }

    const isOrganizer = user?.id === tournament.organizer.id;
    const isParticipant = tournament.participants.some((p) => p.id === user?.id);
    const isInProgress = tournament.status === TournamentStatus.IN_PROGRESS;
    const isCompleted = tournament.status === TournamentStatus.COMPLETED;
    const isRegistrationOpen = tournament.status === TournamentStatus.REGISTRATION_OPEN;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen space-y-6">

            {/* Vis Vinner Display FØR header når ferdig */}
            {isCompleted && (
                <TournamentWinnerDisplay
                    standings={standings}
                    isLoading={isLoadingStandings}
                    error={standingsError}
                    tournamentId={tournamentId}
                />
            )}

            <TournamentHeader tournament={tournament} isOrganizer={isOrganizer} />

            {isInProgress && (
                <TournamentStatusBanner
                    user={user} isOrganizer={isOrganizer} isParticipant={isParticipant}
                    activeSessionId={activeSessionId} activeSessionStatus={activeSessionStatus}
                    isLoadingSessionId={isLoadingSessionId} isStartingRound={isStartingRound}
                    onStartRound={handleStartRound}
                />
            )}

            {/* Live Leaderboard eller Lobby Melding */}
             {isInProgress && activeSessionId && (
                <>
                    {activeSessionStatus === 'inProgress' && (
                         <>
                            {isLoadingLeaderboard && (<Card><CardHeader><CardTitle className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Laster leaderboard...</CardTitle></CardHeader></Card>)}
                             {leaderboardError && !isLoadingLeaderboard && (<Card className="bg-red-50 border-red-200"><CardHeader><CardTitle className="flex items-center gap-2 text-red-700"><AlertCircle className="h-5 w-5" />Feil</CardTitle><CardDescription className="text-red-600">{leaderboardError}</CardDescription></CardHeader></Card>)}
                             {!isLoadingLeaderboard && !leaderboardError && leaderboardResults.length > 0 && (<TournamentLeaderboardPreview results={leaderboardResults} sessionId={activeSessionId} totalPar={leaderboardTotalPar} limit={5} />)}
                             {!isLoadingLeaderboard && !leaderboardError && leaderboardResults.length === 0 && leaderboardData && (<Card><CardHeader><CardTitle>Leaderboard</CardTitle><CardDescription>Ingen scores registrert ennå.</CardDescription></CardHeader></Card>)}
                         </>
                    )}
                    {activeSessionStatus === 'waiting' && !isLoadingLeaderboard && (
                         <Card className="bg-blue-50 border-blue-200">
                             <CardHeader>
                                 <CardTitle className="text-blue-700">Spillobby aktiv</CardTitle>
                                 <CardDescription className="text-blue-600">
                                    Runden venter på spillere.
                                    {(isParticipant || isOrganizer) && (
                                        <Link href={`/turnerings-spill/${activeSessionId}/lobby`} className="ml-2 inline-block">
                                            <Button variant="link" size="sm" className="p-0 h-auto text-blue-700 hover:text-blue-900">Gå til lobby <ArrowRight className="ml-1 h-4 w-4" /></Button>
                                        </Link>
                                     )}
                                 </CardDescription>
                             </CardHeader>
                         </Card>
                     )}
                </>
             )}


            {/* Hovedinnhold Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TournamentDetailsCard tournament={tournament} />
                <TournamentParticipantsCard
                    tournament={tournament} user={user} isOrganizer={isOrganizer}
                    isParticipant={isParticipant} isRegistrationOpen={isRegistrationOpen}
                    isRegistering={isRegistering} onRegister={handleRegister}
                />
            </div>

            {/* Admin Panel */}
            {isOrganizer && (
                <TournamentAdminPanel
                    tournament={tournament} isOrganizer={isOrganizer} isUpdatingStatus={isUpdatingStatus}
                    activeSessionId={activeSessionId} isLoadingSessionId={isLoadingSessionId}
                    isStartingRound={isStartingRound} onStatusUpdate={handleStatusUpdate}
                    onStartRound={handleStartRound}
                 />
             )}
        </div>
    );
}