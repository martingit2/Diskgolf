// app/(undersider)/tournament/[id]/page.tsx
"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TournamentStatus } from "@prisma/client";
import { Loader2, Play, ExternalLink, Settings, ListChecks, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// --- Importer de nye komponentene (Sjekk at filnavn/stier stemmer) ---
import { TournamentHeader } from "@/components/tournaments/details/TournamentHeader";
import { TournamentStatusBanner } from "@/components/tournaments/details/TournamentStatusBanner";
import { TournamentDetailsCard } from "@/components/tournaments/details/TournamentDetailsCard";
import { TournamentAdminPanel } from "@/components/tournaments/details/TournamentAdminPanel";
// Bruker nå standardnavnet med 's'
// Bruker nå standardnavnet



// --- Importer typer for leaderboard ---
import type { PlayData } from '@/app/api/tournament-sessions/[sessionId]/play-data/route';
import { TournamentLeaderboardPreview } from "@/components/tournaments/details/TournamentLeaderbordPreview";
import { TournamentParticipantsCard } from "@/components/tournaments/details/TournamentParticipantCard";

// --- Definer PlayerResult-interfacet (brukes av calculateResults og LeaderboardPreview) ---
interface PlayerResult {
    rank: number; playerId: string; playerName: string; totalStrokes: number;
    totalOb: number; totalScore: number; scoreRelativeToPar: number; holeScores: any[];
}
// --- Eksisterende Interfaces ---
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

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
    // --- State ---
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoadingSessionId, setIsLoadingSessionId] = useState(false);
    const [isStartingRound, setIsStartingRound] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState<PlayData | null>(null);
    const [leaderboardResults, setLeaderboardResults] = useState<PlayerResult[]>([]);
    const [leaderboardTotalPar, setLeaderboardTotalPar] = useState<number>(0);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
    const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

    const router = useRouter();
    const { id: tournamentId } = use(params);

    // --- useEffects for User og Tournament Data ---
    useEffect(() => { fetch("/api/auth").then((res) => (res.ok ? res.json() : null)).then(setUser).catch(() => setUser(null)); }, []);
    useEffect(() => {
        if (!tournamentId) return; setLoading(true);
        fetch(`/api/tournaments/${tournamentId}`)
            .then((res) => { if (!res.ok) { if (res.status === 404) throw new Error("Turnering ikke funnet"); throw new Error("Kunne ikke hente turnering"); } return res.json(); })
            .then(setTournament)
            .catch((error) => { console.error("Feil:", error); toast.error(error instanceof Error ? error.message : "Feil"); router.push("/turneringer"); })
            .finally(() => setLoading(false));
    }, [tournamentId, router]);

    // --- fetchActiveSession ---
    const fetchActiveSession = useCallback(async () => {
        if (!tournamentId || !user) return; setIsLoadingSessionId(true);
        try { const res = await fetch(`/api/tournaments/${tournamentId}/active-session`); if (!res.ok) { setActiveSessionId(null); return; } const data = await res.json(); setActiveSessionId(data?.sessionId ?? null); }
        catch (error) { console.error("Feil:", error); setActiveSessionId(null); } finally { setIsLoadingSessionId(false); }
    }, [tournamentId, user]);

    // --- calculateResults ---
    const calculateResults = useCallback((data: PlayData): { results: PlayerResult[], par: number } => {
        if (!data || !data.participants || !data.course?.holes || data.course.holes.length === 0) return { results: [], par: 0 };
        const calculatedTotalPar = data.course.holes.reduce((sum, hole) => sum + (hole.par ?? 3), 0);
        const participantScores: { [key: string]: Omit<PlayerResult, 'rank'> & { participationId: string } } = {};
        data.participants.forEach(p => { participantScores[p.participationId] = { participationId: p.participationId, playerId: p.playerId, playerName: p.playerName, totalStrokes: 0, totalOb: 0, totalScore: 0, scoreRelativeToPar: 0, holeScores: [] }; });
        data.throws.forEach(t => { const pr = participantScores[t.participationId]; if (pr) { pr.totalStrokes += t.score; pr.totalOb += t.obCount; } });
        const results: Omit<PlayerResult, 'rank'>[] = Object.values(participantScores).map(p => { const ts = p.totalStrokes + p.totalOb; const srtp = ts - calculatedTotalPar; return { playerId: p.playerId, playerName: p.playerName, totalStrokes: p.totalStrokes, totalOb: p.totalOb, totalScore: ts, scoreRelativeToPar: srtp, holeScores: p.holeScores }; });
        results.sort((a, b) => { if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore; return a.playerName.localeCompare(b.playerName); });
        const rankedResults: PlayerResult[] = []; let currentRank = 0;
        results.forEach((result, index) => { if (index === 0 || result.totalScore > (results[index - 1]?.totalScore ?? -Infinity)) currentRank = index + 1; rankedResults.push({ ...result, rank: currentRank }); });
        return { results: rankedResults, par: calculatedTotalPar };
    }, []);

    // --- fetchLeaderboardData ---
    const fetchLeaderboardData = useCallback(async () => {
        if (!activeSessionId) return; setIsLoadingLeaderboard(true); setLeaderboardError(null);
        try {
            const res = await fetch(`/api/tournament-sessions/${activeSessionId}/play-data`);
            if (!res.ok) { let err = "Kunne ikke hente data."; try { err = (await res.json()).error || err; } catch (e) {} throw new Error(err); }
            const data: PlayData = await res.json(); setLeaderboardData(data);
            if (data?.course?.holes) { const { results, par } = calculateResults(data); setLeaderboardResults(results); setLeaderboardTotalPar(par); }
            else { throw new Error("Mangler banedata."); }
        } catch (err) { console.error("Feil:", err); setLeaderboardError(err instanceof Error ? err.message : "Ukjent feil"); setLeaderboardData(null); setLeaderboardResults([]); }
        finally { setIsLoadingLeaderboard(false); }
    }, [activeSessionId, calculateResults]);

    // --- useEffects for å kalle fetch ---
    useEffect(() => { if (tournament && tournament.status === TournamentStatus.IN_PROGRESS) fetchActiveSession(); else { setActiveSessionId(null); setLeaderboardData(null); setLeaderboardResults([]); setLeaderboardTotalPar(0); setLeaderboardError(null); } }, [tournament, fetchActiveSession]);
    useEffect(() => { if (activeSessionId) fetchLeaderboardData(); else { setLeaderboardData(null); setLeaderboardResults([]); setLeaderboardTotalPar(0); setLeaderboardError(null); } }, [activeSessionId, fetchLeaderboardData]);

    // --- Handlers ---
    const handleRegister = async () => { if (!user || !tournament) return; setIsRegistering(true); try { const r = await fetch("/api/tournaments/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tournamentId:tournament.id,playerId:user.id})}); if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Påmelding feilet")} setTournament(await r.json());toast.success("Påmeldt!")} catch(e){console.error(e);toast.error(e instanceof Error?e.message:"Feil")} finally{setIsRegistering(false)} };
    const handleStartRound = async () => { if (!tournament || !user || user.id !== tournament.organizer.id || isStartingRound) return; setIsStartingRound(true); try { const r = await fetch(`/api/tournaments/${tournament.id}/start-round`,{method:'POST'}); if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Kunne ikke starte")} setActiveSessionId((await r.json()).sessionId);toast.success("Runde startet!")} catch(e){console.error(e);toast.error(e instanceof Error?e.message:"Feil")} finally{setIsStartingRound(false)} };
    const handleStatusUpdate = async (newStatus: TournamentStatus) => { if (!user || !tournament || user.id !== tournament.organizer.id) return; setIsUpdatingStatus(true); try { const r = await fetch("/api/tournaments/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tournamentId:tournament.id,status:newStatus})}); if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Statusoppd. feilet")} setTournament(await r.json());toast.success("Status oppdatert!")} catch(e){console.error(e);toast.error(e instanceof Error?e.message:"Feil")} finally{setIsUpdatingStatus(false)} };

    // --- Loading State ---
    if (loading) { return ( <div className="max-w-4xl mx-auto p-6 space-y-6"> {/* Skeleton JSX */} <div className="flex justify-between items-start mb-6"><div className="space-y-2"><Skeleton className="h-8 w-64 rounded" /><Skeleton className="h-5 w-48 rounded" /><Skeleton className="h-5 w-56 rounded" /></div><Skeleton className="h-10 w-28 rounded" /></div> <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4"><Skeleton className="h-6 w-1/3 rounded mb-3" /><Skeleton className="h-4 w-3/4 rounded" /><Skeleton className="h-4 w-1/2 rounded" /><Skeleton className="h-4 w-5/6 rounded" /><Skeleton className="h-4 w-2/3 rounded" /><Skeleton className="h-10 w-full rounded mt-4" /></div><div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4"><div className="flex justify-between items-center mb-3"><Skeleton className="h-6 w-1/2 rounded" /><Skeleton className="h-8 w-20 rounded" /></div><Skeleton className="h-5 w-full rounded" /><Skeleton className="h-5 w-full rounded" /><Skeleton className="h-5 w-full rounded" /></div></div> <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4"><Skeleton className="h-6 w-1/4 rounded mb-3" /><div className="flex items-center gap-4"><Skeleton className="h-10 w-48 rounded" /><Skeleton className="h-10 w-32 rounded" /></div></div> </div> ); }
    if (!tournament) { return <div className="max-w-4xl mx-auto p-6 text-center text-red-500">Turnering ikke funnet.</div>; }

    // --- Beregnede verdier ---
    const isOrganizer = user?.id === tournament.organizer.id;
    const isParticipant = tournament.participants.some((p) => p.id === user?.id);
    const isInProgress = tournament.status === TournamentStatus.IN_PROGRESS;
    const isRegistrationOpen = tournament.status === TournamentStatus.REGISTRATION_OPEN;

    // --- Returnerer JSX ---
    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            <TournamentHeader tournament={tournament} isOrganizer={isOrganizer} />
            {isInProgress && (<TournamentStatusBanner user={user} isOrganizer={isOrganizer} isParticipant={isParticipant} activeSessionId={activeSessionId} isLoadingSessionId={isLoadingSessionId} isStartingRound={isStartingRound} onStartRound={handleStartRound} />)}
            {/* Leaderboard Preview Seksjon */}
            {isInProgress && activeSessionId && !isLoadingLeaderboard && leaderboardResults.length > 0 && (<TournamentLeaderboardPreview results={leaderboardResults} sessionId={activeSessionId} totalPar={leaderboardTotalPar} limit={5} />)}
            {isInProgress && activeSessionId && isLoadingLeaderboard && (<Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Laster...</CardTitle></CardHeader></Card>)}
            {isInProgress && activeSessionId && !isLoadingLeaderboard && leaderboardError && (<Card className="mt-6 bg-red-50 border-red-200"><CardHeader><CardTitle className="flex items-center gap-2 text-red-700"><AlertCircle className="h-5 w-5" />Feil</CardTitle><CardDescription className="text-red-600">{leaderboardError}</CardDescription></CardHeader></Card>)}
            {isInProgress && activeSessionId && !isLoadingLeaderboard && !leaderboardError && leaderboardResults.length === 0 && leaderboardData && (<TournamentLeaderboardPreview results={[]} sessionId={activeSessionId} totalPar={leaderboardTotalPar} />)}
            {/* Hovedinnhold Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <TournamentDetailsCard tournament={tournament} />
                <TournamentParticipantsCard tournament={tournament} user={user} isOrganizer={isOrganizer} isParticipant={isParticipant} isRegistrationOpen={isRegistrationOpen} isRegistering={isRegistering} onRegister={handleRegister} />
            </div>
            {/* Admin Panel */}
            {isOrganizer && (<TournamentAdminPanel tournament={tournament} isOrganizer={isOrganizer} isUpdatingStatus={isUpdatingStatus} activeSessionId={activeSessionId} isLoadingSessionId={isLoadingSessionId} isStartingRound={isStartingRound} onStatusUpdate={handleStatusUpdate} onStartRound={handleStartRound} />)}
        </div>
    );
}