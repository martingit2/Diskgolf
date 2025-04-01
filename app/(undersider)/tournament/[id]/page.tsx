// app/(undersider)/tournament/[id]/page.tsx
"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TournamentStatus } from "@prisma/client"; // Behold denne
import { Loader2, Play, Settings, ListChecks, AlertCircle, TrendingUp, ArrowRight } from "lucide-react"; // Fjernet ExternalLink hvis ikke brukt
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Importer alle detalj-komponentene
import { TournamentHeader } from "@/components/tournaments/details/TournamentHeader";
import { TournamentStatusBanner } from "@/components/tournaments/details/TournamentStatusBanner";
import { TournamentDetailsCard } from "@/components/tournaments/details/TournamentDetailsCard";
import { TournamentAdminPanel } from "@/components/tournaments/details/TournamentAdminPanel";
import { TournamentLeaderboardPreview } from "@/components/tournaments/details/TournamentLeaderbordPreview";
import { TournamentParticipantsCard } from "@/components/tournaments/details/TournamentParticipantCard";
// --- VIKTIG: Importer Vinner-komponenten ---
import { TournamentWinnerDisplay } from "@/components/tournaments/details/TournamentWinnerDisplay";

// --- Typer ---
import type { PlayData } from '@/app/api/tournament-sessions/[sessionId]/play-data/route'; // For Leaderboard

// Interface for spiller i leaderboard (fra calculateResults)
interface PlayerResult {
    rank: number; playerId: string; playerName: string; totalStrokes: number;
    totalOb: number; totalScore: number; scoreRelativeToPar: number; holeScores: any[];
}

// Interface for Turneringsdata (hentet fra API)
interface Tournament {
    id: string; name: string; description: string | null; startDate: string;
    endDate: string | null; status: TournamentStatus; maxParticipants: number | null;
    location: string; image: string | null;
    course: { id: string; name: string; location: string | null; image: string | null; par: number | null; numHoles: number | null; baskets: {id: string}[] | null };
    organizer: { id: string; name: string | null; }; club: { id: string; name: string; } | null;
    participants: { id: string; name: string | null; }[];
    _count: { participants: number; };
}
// Interface for Brukerdata
interface User { id: string; name: string | null; email: string | null; }

// Type for sesjonsstatus
type SessionStatus = 'waiting' | 'inProgress' | 'completed' | null;

// --- NYTT: Interface for spiller i Standings (match med TournamentWinnerDisplay) ---
interface StandingPlayer {
    rank: number;
    playerId: string;
    playerName: string;
    playerImage?: string | null;
    totalScore: number;
    tournamentId: string; // Viktig for lenken
}

// --- Hovedkomponent ---
export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
    // --- State Variabler ---
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Initial loading
    const [isRegistering, setIsRegistering] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isStartingRound, setIsStartingRound] = useState(false);

    // State for aktiv runde
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [activeSessionStatus, setActiveSessionStatus] = useState<SessionStatus>(null);
    const [isLoadingSessionId, setIsLoadingSessionId] = useState(false);

    // State for leaderboard preview (for pågående runde)
    const [leaderboardData, setLeaderboardData] = useState<PlayData | null>(null);
    const [leaderboardResults, setLeaderboardResults] = useState<PlayerResult[]>([]);
    const [leaderboardTotalPar, setLeaderboardTotalPar] = useState<number>(0);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
    const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

    // --- NY STATE for endelige resultater (standings) ---
    const [standings, setStandings] = useState<StandingPlayer[]>([]);
    const [isLoadingStandings, setIsLoadingStandings] = useState(false);
    const [standingsError, setStandingsError] = useState<string | null>(null);
    // --- SLUTT NY STATE ---

    const router = useRouter();
    const { id: tournamentId } = use(params); // Hent ID fra params

    // --- Datahenting Callbacks ---

    // Hent brukerdata
    useEffect(() => { fetch("/api/auth").then((res) => (res.ok ? res.json() : null)).then(setUser).catch(() => setUser(null)); }, []);

    // Hent turneringsdata
    useEffect(() => {
        if (!tournamentId) return;
        setLoading(true);
        fetch(`/api/tournaments/${tournamentId}`)
            .then((res) => { if (!res.ok) { if (res.status === 404) throw new Error("Turnering ikke funnet"); throw new Error("Kunne ikke hente turnering"); } return res.json(); })
            .then(setTournament)
            .catch((error) => { console.error("Feil ved henting av turnering:", error); toast.error(error instanceof Error ? error.message : "Feil"); router.push("/turneringer"); })
            .finally(() => setLoading(false));
    }, [tournamentId, router]);

    // Hent aktiv spillrunde (ID og status)
    const fetchActiveSession = useCallback(async () => {
        if (!tournamentId || !user) return;
        setIsLoadingSessionId(true); setActiveSessionId(null); setActiveSessionStatus(null);
        try {
            const res = await fetch(`/api/tournaments/${tournamentId}/active-session`);
            if (!res.ok) return;
            const data = await res.json();
            setActiveSessionId(data?.sessionId ?? null);
            setActiveSessionStatus(data?.sessionStatus ?? null);
        } catch (error) { console.error("Feil ved henting av aktiv sesjon:", error); }
        finally { setIsLoadingSessionId(false); }
    }, [tournamentId, user]);

    // Beregn leaderboard-resultater (brukes av fetchLeaderboardData)
    const calculateResults = useCallback((data: PlayData): { results: PlayerResult[], par: number } => {
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

    // Hent leaderboard-data for aktiv runde
    const fetchLeaderboardData = useCallback(async () => {
        if (!activeSessionId) return; // Guard
        setIsLoadingLeaderboard(true); setLeaderboardError(null);
        try {
            const res = await fetch(`/api/tournament-sessions/${activeSessionId}/play-data`);
            if (!res.ok) { let err = "Kunne ikke hente leaderboard-data."; try { err = (await res.json()).error || err; } catch (e) {} if (res.status === 409) err = `Leaderboard ikke klar (status: ${activeSessionStatus || 'ukjent'}).`; throw new Error(err); }
            const data: PlayData = await res.json();
            setLeaderboardData(data);
            if (data?.course?.holes) { const { results, par } = calculateResults(data); setLeaderboardResults(results); setLeaderboardTotalPar(par); }
            else { throw new Error("Mangler banedata i leaderboard-respons."); }
        } catch (err) { console.error("Feil ved henting av leaderboard:", err); setLeaderboardError(err instanceof Error ? err.message : "Ukjent feil"); setLeaderboardData(null); setLeaderboardResults([]); setLeaderboardTotalPar(0); }
        finally { setIsLoadingLeaderboard(false); }
    }, [activeSessionId, activeSessionStatus, calculateResults]);

    // --- NY: Hent endelige resultater (standings) ---
    const fetchStandings = useCallback(async () => {
        if (!tournamentId) return;
        setIsLoadingStandings(true); setStandingsError(null);
        console.log(`Fetching final standings for tournament ${tournamentId}`);
        try {
            const res = await fetch(`/api/tournaments/${tournamentId}/standings`);
            if (!res.ok) { let err = "Kunne ikke hente endelige resultater."; try { err = (await res.json()).error || err; } catch (e) {} throw new Error(err); }
            const data: StandingPlayer[] = await res.json();
            console.log("Fetched standings data:", data);
            // Legg til tournamentId i hvert objekt for lenking
            const dataWithTournamentId = data.map(s => ({ ...s, tournamentId }));
            setStandings(dataWithTournamentId);
        } catch (err) { console.error("Feil ved henting av standings:", err); setStandingsError(err instanceof Error ? err.message : "Ukjent feil"); setStandings([]); }
        finally { setIsLoadingStandings(false); }
    }, [tournamentId]);
    // --- SLUTT NY ---

    // --- useEffects for å styre datahenting ---

    // Hent aktiv sesjon når turnering er IN_PROGRESS
    useEffect(() => {
        if (tournament?.status === TournamentStatus.IN_PROGRESS && user) { fetchActiveSession(); }
        else { setActiveSessionId(null); setActiveSessionStatus(null); }
    }, [tournament?.status, user, fetchActiveSession]); // Kjør når status eller bruker endres

    // Hent leaderboard når sesjon er aktiv og 'inProgress'
    useEffect(() => {
        if (activeSessionId && activeSessionStatus === 'inProgress') { fetchLeaderboardData(); }
        else { setLeaderboardData(null); setLeaderboardResults([]); setLeaderboardTotalPar(0); setLeaderboardError(null); }
    }, [activeSessionId, activeSessionStatus, fetchLeaderboardData]);

    // --- NY: Hent standings når turnering er COMPLETED ---
    useEffect(() => {
        if (tournament?.status === TournamentStatus.COMPLETED) { fetchStandings(); }
        else { setStandings([]); setStandingsError(null); }
    }, [tournament?.status, fetchStandings]);
    // --- SLUTT NY ---

    // --- Handlingsfunksjoner (Callbacks) ---
    const handleRegister = useCallback(async () => { if (!user || !tournament) return; setIsRegistering(true); try { const r = await fetch("/api/tournaments/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tournamentId:tournament.id,playerId:user.id})}); if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Påmelding feilet")} setTournament(await r.json());toast.success("Påmeldt!")} catch(e){console.error(e);toast.error(e instanceof Error?e.message:"Feil")} finally{setIsRegistering(false)} }, [user, tournament]);
    const handleStartRound = useCallback(async () => { if (!tournament || !user || user.id !== tournament.organizer.id || isStartingRound) return; setIsStartingRound(true); try { const r = await fetch(`/api/tournaments/${tournament.id}/start-round`,{method:'POST'}); if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Kunne ikke starte")} const { sessionId } = await r.json(); setActiveSessionId(sessionId); setActiveSessionStatus('waiting'); toast.success("Runde startet, lobby er klar!") } catch(e){console.error(e);toast.error(e instanceof Error?e.message:"Feil")} finally{setIsStartingRound(false)} }, [tournament, user, isStartingRound]);
    const handleStatusUpdate = useCallback(async (newStatus: TournamentStatus) => { if (!user || !tournament || user.id !== tournament.organizer.id) return; setIsUpdatingStatus(true); try { const r = await fetch("/api/tournaments/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tournamentId:tournament.id,status:newStatus})}); if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Statusoppd. feilet")} setTournament(await r.json());toast.success("Status oppdatert!")} catch(e){console.error(e);toast.error(e instanceof Error?e.message:"Feil")} finally{setIsUpdatingStatus(false)} }, [user, tournament]);

    // --- Loading State ---
    if (loading) { return ( <div className="max-w-4xl mx-auto p-6 space-y-6"> {/* Skeleton JSX */} {/* ... (som før) ... */ } </div> ); }
    if (!tournament) { return <div className="max-w-4xl mx-auto p-6 text-center text-red-500">Turnering ikke funnet.</div>; }

    // --- Beregnede verdier ---
    const isOrganizer = user?.id === tournament.organizer.id;
    const isParticipant = tournament.participants.some((p) => p.id === user?.id);
    const isInProgress = tournament.status === TournamentStatus.IN_PROGRESS;
    const isCompleted = tournament.status === TournamentStatus.COMPLETED;
    const isRegistrationOpen = tournament.status === TournamentStatus.REGISTRATION_OPEN;

    // --- Returnerer JSX ---
    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen space-y-6"> {/* La til space-y for generell avstand */}

            {/* NY: Vinner Display (vises øverst når ferdig) */}
            {isCompleted && (
                <TournamentWinnerDisplay
                    standings={standings}
                    isLoading={isLoadingStandings}
                    error={standingsError}
                    tournamentId={tournamentId}
                />
            )}

            {/* Turnerings Header (vises alltid) */}
            <TournamentHeader tournament={tournament} isOrganizer={isOrganizer} />

             {/* Status Banner (vises kun når IN_PROGRESS) */}
            {isInProgress && (
                <TournamentStatusBanner
                    user={user} isOrganizer={isOrganizer} isParticipant={isParticipant}
                    activeSessionId={activeSessionId} activeSessionStatus={activeSessionStatus}
                    isLoadingSessionId={isLoadingSessionId} isStartingRound={isStartingRound}
                    onStartRound={handleStartRound}
                />
            )}

            {/* Leaderboard Preview (vises kun når aktiv runde spilles) */}
            {isInProgress && activeSessionId && activeSessionStatus === 'inProgress' && (
                 <>
                    {isLoadingLeaderboard && (<Card><CardHeader><CardTitle className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Laster leaderboard...</CardTitle></CardHeader></Card>)}
                     {leaderboardError && !isLoadingLeaderboard && (<Card className="bg-red-50 border-red-200"><CardHeader><CardTitle className="flex items-center gap-2 text-red-700"><AlertCircle className="h-5 w-5" />Feil</CardTitle><CardDescription className="text-red-600">{leaderboardError}</CardDescription></CardHeader></Card>)}
                     {!isLoadingLeaderboard && !leaderboardError && leaderboardResults.length > 0 && (<TournamentLeaderboardPreview results={leaderboardResults} sessionId={activeSessionId} totalPar={leaderboardTotalPar} limit={5} />)}
                     {!isLoadingLeaderboard && !leaderboardError && leaderboardResults.length === 0 && leaderboardData && (<Card><CardHeader><CardTitle>Leaderboard</CardTitle><CardDescription>Ingen scores registrert ennå.</CardDescription></CardHeader></Card>)}
                 </>
            )}
            {/* Lobby Melding (vises kun når aktiv runde venter) */}
             {isInProgress && activeSessionId && activeSessionStatus === 'waiting' && !isLoadingLeaderboard && (
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

            {/* Hovedinnhold Grid (Detaljer og Deltakere) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TournamentDetailsCard tournament={tournament} />
                <TournamentParticipantsCard
                    tournament={tournament} user={user} isOrganizer={isOrganizer}
                    isParticipant={isParticipant} isRegistrationOpen={isRegistrationOpen}
                    isRegistering={isRegistering} onRegister={handleRegister}
                />
            </div>

            {/* Admin Panel (kun for arrangør) */}
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