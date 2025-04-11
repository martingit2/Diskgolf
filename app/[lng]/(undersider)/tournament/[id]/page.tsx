// Fil: src/app/(undersider)/tournament/[id]/page.tsx
// Formål: Viser detaljsiden for en spesifikk turnering. Inkluderer header, statusbanner, detaljer, deltakerliste, leaderboard-preview (live), adminpanel og resultatvisning (for fullførte). Håndterer brukerregistrering/avmelding og admin-handlinger.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TournamentStatus } from "@prisma/client";
import { Loader2, Play, Settings, ListChecks, AlertCircle, TrendingUp, ArrowRight, LogIn, LogOut } from "lucide-react"; // La til LogIn, LogOut for knapper
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
    const [isUnregistering, setIsUnregistering] = useState(false); // NY: State for avmelding
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

    const fetchTournamentData = useCallback(async () => {
        if (!tournamentId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tournaments/${tournamentId}`);
            if (!res.ok) throw new Error(res.status === 404 ? "Turnering ikke funnet" : "Kunne ikke hente turnering");
            const data = await res.json();
            setTournament(data);
        } catch (error) {
            console.error("Feil henting turnering:", error);
            toast.error(error instanceof Error ? error.message : "Kunne ikke laste turnering.");
            router.push("/turneringer");
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tournamentId, router]); // Bare kjør når tournamentId endres

    useEffect(() => {
        fetchTournamentData();
    }, [fetchTournamentData]); // Hent data når komponenten lastes


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

    const fetchStandings = useCallback(async () => {
        if (!tournamentId) return;
        setIsLoadingStandings(true); setStandingsError(null);
        try {
            const res = await fetch(`/api/tournaments/${tournamentId}/standings`);
            if (!res.ok) { let err = "Kunne ikke hente resultater."; try { err = (await res.json()).error || err; } catch (e) {} throw new Error(err); }
            const data: StandingPlayer[] = await res.json();
            setStandings(data);
        } catch (err) { console.error("Feil henting standings:", err); setStandingsError(err instanceof Error ? err.message : "Ukjent feil"); setStandings([]); }
        finally { setIsLoadingStandings(false); }
    }, [tournamentId]);

    // --- useEffects ---
    useEffect(() => { if (tournament?.status === TournamentStatus.IN_PROGRESS && user) fetchActiveSession(); else { setActiveSessionId(null); setActiveSessionStatus(null); } }, [tournament?.status, user, fetchActiveSession]);
    useEffect(() => { if (activeSessionId && activeSessionStatus === 'inProgress') fetchLeaderboardData(); else { setLeaderboardData(null); setLeaderboardResults([]); setLeaderboardTotalPar(0); setLeaderboardError(null); } }, [activeSessionId, activeSessionStatus, fetchLeaderboardData]);
    useEffect(() => { if (tournament?.status === TournamentStatus.COMPLETED) fetchStandings(); else { setStandings([]); setStandingsError(null); } }, [tournament?.status, fetchStandings]);

    // --- Handlings-Callbacks ---

    // PÅMELDING
    const handleRegister = useCallback(async () => {
        if (!user || !tournament) return;
        setIsRegistering(true);
        try {
            const response = await fetch("/api/tournaments/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tournamentId: tournament.id, playerId: user.id })
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Ukjent feil under påmelding' }));
                throw new Error(err.error || "Påmelding feilet");
            }
            const updatedTournamentData = await response.json();
            setTournament(updatedTournamentData); // Oppdater state med ny turneringsdata
            toast.success("Påmeldt!");
        } catch (e) {
            console.error("Feil ved påmelding:", e);
            toast.error(e instanceof Error ? e.message : "En feil oppstod under påmelding.");
        } finally {
            setIsRegistering(false);
        }
    }, [user, tournament]);

    // AVMELDING (NY)
    const handleUnregister = useCallback(async () => {
        if (!user || !tournament) return;
        setIsUnregistering(true); // Sett laste-state for avmelding
        try {
            const response = await fetch("/api/tournaments/unregister", { // Kall det nye endepunktet
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tournamentId: tournament.id, playerId: user.id })
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Ukjent feil under avmelding' }));
                throw new Error(err.error || "Avmelding feilet");
            }
            const updatedTournamentData = await response.json();
            setTournament(updatedTournamentData); // Oppdater state med ny turneringsdata
            toast.success("Avmeldt!");
        } catch (e) {
            console.error("Feil ved avmelding:", e);
            toast.error(e instanceof Error ? e.message : "En feil oppstod under avmelding.");
        } finally {
            setIsUnregistering(false); // Reset laste-state for avmelding
        }
    }, [user, tournament]);


    const handleStartRound = useCallback(async () => { if (!tournament || !user || user.id !== tournament.organizer.id || isStartingRound) return; setIsStartingRound(true); try { const r = await fetch(`/api/tournaments/${tournament.id}/start-round`,{method:'POST'}); if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Kunne ikke starte runde")} const { sessionId } = await r.json(); setActiveSessionId(sessionId); setActiveSessionStatus('waiting'); toast.success("Runde startet, lobby er klar!") } catch(e){console.error(e);toast.error(e instanceof Error?e.message:"Feil")} finally{setIsStartingRound(false)} }, [tournament, user, isStartingRound]);

    const handleStatusUpdate = useCallback(async (newStatus: TournamentStatus) => {
        if (!user || !tournament || user.id !== tournament.organizer.id) return;
        setIsUpdatingStatus(true);
        try {
            const statusResponse = await fetch("/api/tournaments/status", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tournamentId: tournament.id, status: newStatus })
            });
            if (!statusResponse.ok) { const err = await statusResponse.json().catch(() => ({})); throw new Error(err.error || "Statusoppdatering feilet"); }

            const updatedTournament = await statusResponse.json();
            setTournament(updatedTournament);
            toast.success("Status oppdatert!");

            if (newStatus === TournamentStatus.COMPLETED) {
                toast.loading("Lagrer endelige resultater...");
                const finalizeResponse = await fetch(`/api/tournaments/${tournament.id}/finalize`, { method: 'POST' });
                toast.dismiss();
                if (!finalizeResponse.ok) { const finalizeError = await finalizeResponse.json().catch(() => ({})); throw new Error(finalizeError.error || "Kunne ikke lagre resultater."); }
                const finalizeResult = await finalizeResponse.json();
                toast.success(finalizeResult.message || "Endelige resultater lagret!");
                fetchStandings();
            }
        } catch (e) {
            console.error("Feil under statusoppdatering/finalisering:", e);
            toast.error(e instanceof Error ? e.message : "En feil oppstod");
        } finally {
            setIsUpdatingStatus(false);
        }
    }, [user, tournament, fetchStandings]);


    // --- Render ---
    if (loading) { return ( <div className="max-w-4xl mx-auto p-6 space-y-6"> <Skeleton className="h-48 w-full rounded-lg" /> <Skeleton className="h-10 w-1/2 mt-4 rounded" /> <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"><Skeleton className="h-64 w-full rounded-lg" /><Skeleton className="h-64 w-full rounded-lg" /></div> </div> ); }
    if (!tournament) { return <div className="max-w-4xl mx-auto p-6 text-center text-red-500 font-medium">Turnering ikke funnet. <Link href="/turneringer" className="text-blue-600 hover:underline ml-2">Tilbake til oversikten</Link></div>; }

    const isOrganizer = user?.id === tournament.organizer.id;
    const isParticipant = !!user && tournament.participants.some((p) => p.id === user.id); // Forenklet sjekk
    const isInProgress = tournament.status === TournamentStatus.IN_PROGRESS;
    const isCompleted = tournament.status === TournamentStatus.COMPLETED;
    const isRegistrationOpen = tournament.status === TournamentStatus.REGISTRATION_OPEN;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen space-y-6">

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* Justert grid for større skjermer */}
                <TournamentDetailsCard tournament={tournament} />
                <TournamentParticipantsCard
                    tournament={tournament}
                    user={user}
                    isOrganizer={isOrganizer}
                    isParticipant={isParticipant}
                    isRegistrationOpen={isRegistrationOpen}
                    isRegistering={isRegistering}
                    isUnregistering={isUnregistering} // Send med ny state
                    onRegister={handleRegister}
                    onUnregister={handleUnregister} // Send med ny callback
                />
            </div>

            {/* Admin Panel */}
            {isOrganizer && (
                <TournamentAdminPanel
                    tournament={tournament}
                    isOrganizer={isOrganizer}
                    isUpdatingStatus={isUpdatingStatus}
                    activeSessionId={activeSessionId}
                    isLoadingSessionId={isLoadingSessionId}
                    isStartingRound={isStartingRound}
                    onStatusUpdate={handleStatusUpdate}
                    onStartRound={handleStartRound}
                 />
             )}
        </div>
    );
}