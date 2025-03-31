// app/(undersider)/turnerings-spill/[sessionId]/results/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ArrowLeft, Loader2, Trophy, TrendingUp } from 'lucide-react';
import type { PlayData } from '@/app/api/tournament-sessions/[sessionId]/play-data/route';

interface PlayerResult {
    rank: number; playerId: string; playerName: string; totalStrokes: number;
    totalOb: number; totalScore: number; scoreRelativeToPar: number;
    holeScores: { holeNumber: number; strokes: number | null; obCount: number | null; scoreRelativeToPar: number | null; }[];
}

export default function TournamentResultsPage() {
    const [playData, setPlayData] = useState<PlayData | null>(null);
    const [playerResults, setPlayerResults] = useState<PlayerResult[]>([]);
    const [totalPar, setTotalPar] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const sessionId = params?.sessionId as string | undefined;

    // calculateResults (med forbedret ranking og hull-data)
    const calculateResults = useCallback((data: PlayData): { results: PlayerResult[], par: number } => {
        if (!data || !data.participants || !data.course?.holes || data.course.holes.length === 0) return { results: [], par: 0 };
        const calculatedTotalPar = data.course.holes.reduce((sum, hole) => sum + (hole.par ?? 3), 0);
        const participantScores: { [key: string]: Omit<PlayerResult, 'rank'> & { participationId: string } } = {};
        data.participants.forEach(p => { participantScores[p.participationId] = { participationId: p.participationId, playerId: p.playerId, playerName: p.playerName, totalStrokes: 0, totalOb: 0, totalScore: 0, scoreRelativeToPar: 0, holeScores: data.course.holes.map(h => ({ holeNumber: h.holeNumber, strokes: null, obCount: null, scoreRelativeToPar: null })) }; });
        data.throws.forEach(t => { const pr = participantScores[t.participationId]; if (pr) { pr.totalStrokes += t.score; pr.totalOb += t.obCount; const hi = pr.holeScores.findIndex(hs => hs.holeNumber === t.holeNumber); if (hi > -1) { const hp = data.course.holes[hi]?.par ?? 3; pr.holeScores[hi].strokes = t.score; pr.holeScores[hi].obCount = t.obCount; pr.holeScores[hi].scoreRelativeToPar = t.score + t.obCount - hp; } } });
        const results: Omit<PlayerResult, 'rank'>[] = Object.values(participantScores).map(p => { const ts = p.totalStrokes + p.totalOb; const srtp = ts - calculatedTotalPar; return { playerId: p.playerId, playerName: p.playerName, totalStrokes: p.totalStrokes, totalOb: p.totalOb, totalScore: ts, scoreRelativeToPar: srtp, holeScores: p.holeScores }; });
        results.sort((a, b) => { if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore; return a.playerName.localeCompare(b.playerName); });
        const rankedResults: PlayerResult[] = []; let currentRank = 0;
        results.forEach((result, index) => { if (index === 0 || result.totalScore > (results[index - 1]?.totalScore ?? -Infinity)) currentRank = index + 1; rankedResults.push({ ...result, rank: currentRank }); });
        return { results: rankedResults, par: calculatedTotalPar };
    }, []);

    // fetchResultsData
    const fetchResultsData = useCallback(async () => {
        if (!sessionId || authStatus !== 'authenticated') return; setLoading(true); setError(null);
        try {
            const res = await fetch(`/api/tournament-sessions/${sessionId}/play-data`);
            if (!res.ok) { let err = "Kunne ikke hente data."; try { err = (await res.json()).error || err; } catch (e) {} if (res.status === 403) { toast.error("Ingen tilgang."); router.replace('/'); return; } if (res.status === 404) { toast.error("Runde ikke funnet."); router.replace('/turneringer'); return; } if (res.status === 409) { setError("Spillet ikke startet/fullført."); setLoading(false); return; } throw new Error(err); }
            const data: PlayData = await res.json(); setPlayData(data);
            if (data?.course?.holes) { const { results, par } = calculateResults(data); setPlayerResults(results); setTotalPar(par); }
            else { setError("Manglende banedata."); setPlayerResults([]); setTotalPar(0); }
        } catch (err) { console.error("Feil:", err); setError(err instanceof Error ? err.message : "Ukjent feil"); }
        finally { setLoading(false); }
    }, [sessionId, authStatus, router, calculateResults]);

    // useEffect
    useEffect(() => { if (authStatus === 'authenticated') fetchResultsData(); else if (authStatus === 'unauthenticated') { toast.error("Logg inn."); router.push(`/turneringer`); } }, [authStatus, fetchResultsData, router]);

    // --- Rendering ---
    if (loading) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <Skeleton className="h-8 w-3/4 mb-1" /> <Skeleton className="h-5 w-1/2 mb-2" /> <Skeleton className="h-4 w-1/4 mb-6" />
                <div className="border rounded-lg overflow-hidden shadow-md bg-white">
                    {/* RENSET Skeleton Table */}
                    <Table>{/* START TABLE - INGEN WHITESPACE */}
                        <TableHeader className="bg-gray-50">
                            <TableRow>{/* START ROW */}
                                <TableHead className="w-[50px] p-2"><Skeleton className="h-5 w-full" /></TableHead>
                                <TableHead className="p-2"><Skeleton className="h-5 w-3/4" /></TableHead>
                                <TableHead className="w-[80px] p-2"><Skeleton className="h-5 w-full" /></TableHead>
                                <TableHead className="w-[80px] p-2"><Skeleton className="h-5 w-full" /></TableHead>
                                {[...Array(9)].map((_, i) => (<TableHead key={`skel-h-${i}`} className="w-[60px] p-2"><Skeleton className="h-5 w-full" /></TableHead>))}
                                <TableHead className="w-[70px] p-2"><Skeleton className="h-5 w-full" /></TableHead>
                                <TableHead className="w-[70px] p-2"><Skeleton className="h-5 w-full" /></TableHead>
                            {/* END ROW */}</TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={`skel-r-${i}`}>{/* START ROW */}
                                    <TableCell className="w-[50px] p-2"><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell className="p-2"><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell className="w-[80px] p-2"><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell className="w-[80px] p-2"><Skeleton className="h-6 w-full" /></TableCell>
                                    {[...Array(9)].map((_, j) => (<TableCell key={`skel-c-${i}-${j}`} className="w-[60px] p-2"><Skeleton className="h-6 w-full" /></TableCell>))}
                                    <TableCell className="w-[70px] p-2"><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell className="w-[70px] p-2"><Skeleton className="h-6 w-full" /></TableCell>
                                {/* END ROW */}</TableRow>
                            ))}
                        </TableBody>
                    {/* END TABLE - INGEN WHITESPACE */}</Table>
                </div>
            </div>
        );
    }

    if (error) { /* Error rendering (uendret) */
        return ( <div className="container mx-auto p-4 md:p-8 text-center"><AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" /><h2 className="text-xl font-semibold text-red-700 mb-2">Feil</h2><p className="text-red-600 mb-6">{error}</p><Link href={playData?.tournamentId ? `/tournament/${playData.tournamentId}` : '/turneringer'}><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Tilbake</Button></Link></div> );
    }
    if (!playData || !playData.course || playerResults.length === 0) { /* No data rendering (uendret) */
        const msg = playData ? "Ingen scores registrert ennå." : "Ingen data funnet.";
        return ( <div className="container mx-auto p-4 md:p-8 text-center"><p className="text-gray-600 mb-4">{msg}</p><Link href={playData?.tournamentId ? `/tournament/${playData.tournamentId}` : '/turneringer'} className="mt-4 inline-block"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Tilbake</Button></Link>{playData?.status === 'inProgress' && sessionId && ( <Link href={`/turnerings-spill/${sessionId}/play`} className="mt-4 ml-4 inline-block"><Button>Gå til spill</Button></Link> )}</div> );
    }

    // --- Hoved-rendering (RENSET FOR WHITESPACE RUNDT TABLE) ---
    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Header (uendret) */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{playData.tournamentName} - Resultater</h1>
                <p className="text-lg text-gray-600">Runde {playData.roundNumber} - {playData.course.name} (Par {totalPar})</p>
                <div className="flex flex-wrap gap-4 mt-2">
                    <Link href={`/tournament/${playData.tournamentId}`} className="text-sm text-blue-600 hover:underline inline-flex items-center"><ArrowLeft className="mr-1 h-3 w-3" />Tilbake til turnering</Link>
                    {playData.status === 'inProgress' && sessionId && (<Link href={`/turnerings-spill/${sessionId}/play`} className="text-sm text-green-600 hover:underline inline-flex items-center"><TrendingUp className="mr-1 h-3 w-3" />Gå til spill</Link>)}
                    <Button variant="outline" size="sm" onClick={fetchResultsData} disabled={loading} className="text-xs h-6">{loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}Oppdater</Button>
                </div>
            </div>

            {/* Tabell-seksjon (RENSET) */}
            <div className="border rounded-lg overflow-x-auto shadow-md bg-white">
                {/* RENSET Table */}
                <Table>{/* START TABLE - INGEN WHITESPACE */}
                    <TableHeader className="bg-gray-50 sticky top-0 z-10">
                        <TableRow>{/* START ROW */}
                            <TableHead className="w-[50px] text-center font-semibold">#</TableHead>
                            <TableHead className="font-semibold min-w-[150px]">Spiller</TableHead>
                            <TableHead className="w-[80px] text-center font-semibold">Totalt</TableHead>
                            <TableHead className="w-[80px] text-center font-semibold">+/- Par</TableHead>
                            {playData.course.holes.map(hole => (<TableHead key={hole.id} className="w-[65px] text-center font-semibold px-1">{hole.holeNumber}</TableHead>))}
                            <TableHead className="w-[70px] text-center font-semibold">Sum</TableHead>
                            <TableHead className="w-[70px] text-center font-semibold">OB</TableHead>
                        {/* END ROW */}</TableRow>
                    </TableHeader>
                    <TableBody>
                        {playerResults.map((player) => (
                            <TableRow key={player.playerId} className="hover:bg-gray-50">{/* START ROW */}
                                <TableCell className="text-center font-medium">{player.rank}</TableCell>
                                <TableCell className="font-medium">{player.playerName}</TableCell>
                                <TableCell className="text-center font-semibold">{player.totalScore}</TableCell>
                                <TableCell className={`text-center font-semibold ${player.scoreRelativeToPar === 0 ? 'text-gray-700' : player.scoreRelativeToPar < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                    {player.scoreRelativeToPar === 0 ? 'E' : player.scoreRelativeToPar > 0 ? `+${player.scoreRelativeToPar}` : player.scoreRelativeToPar}
                                </TableCell>
                                {player.holeScores.map(hs => {
                                    const scoreClass = hs.scoreRelativeToPar === null ? 'text-gray-400' : hs.scoreRelativeToPar < -1 ? 'bg-green-100 text-green-800 font-bold' : hs.scoreRelativeToPar === -1 ? 'bg-red-100 text-red-700' : hs.scoreRelativeToPar === 0 ? '' : hs.scoreRelativeToPar === 1 ? 'bg-blue-100 text-blue-700' : 'bg-blue-200 text-blue-800 font-medium';
                                    return (<TableCell key={`${player.playerId}-${hs.holeNumber}`} className={`text-center text-sm px-1 ${scoreClass}`}>
                                            {hs.strokes ?? '-'}
                                            {hs.obCount !== null && hs.obCount > 0 && (<span className="text-red-500 text-[10px] align-super ml-0.5">+{hs.obCount}</span>)}
                                        </TableCell>);
                                })}
                                <TableCell className="text-center text-sm text-gray-700">{player.totalStrokes}</TableCell>
                                <TableCell className="text-center text-sm text-red-600">{player.totalOb > 0 ? player.totalOb : ''}</TableCell>
                            {/* END ROW */}</TableRow>
                        ))}
                    </TableBody>
                {/* END TABLE - INGEN WHITESPACE */}</Table>
            </div>
        </div>
    );
}