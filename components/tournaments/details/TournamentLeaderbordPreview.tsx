// Fil: components/tournaments/details/TournamentLeaderboardPreview.tsx
// Formål: Definerer en React-komponent ('use client') som viser en forhåndsvisning (default topp 5) av ledertavlen for en turnering.
//         Tar imot spillerresultater, økt-ID (for lenke til full resultatside), totalt par for banen, og en valgfri grense for antall viste resultater.
//         Bruker UI-komponenter som Card og Table for presentasjon, og inkluderer en lenke til den komplette resultatsiden.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, ExternalLink } from 'lucide-react';

// Bruker samme PlayerResult-interface som resultatsiden
interface PlayerResult {
    rank: number;
    playerId: string;
    playerName: string;
    totalScore: number;
    scoreRelativeToPar: number;
}

interface TournamentLeaderboardPreviewProps {
    results: PlayerResult[];
    sessionId: string; // Trengs for lenken til full resultatside
    totalPar: number;
    limit?: number; // Antall spillere å vise (f.eks. 5)
}

export function TournamentLeaderboardPreview({
    results,
    sessionId,
    totalPar,
    limit = 5 // Default til topp 5
}: TournamentLeaderboardPreviewProps) {

    const topResults = results.slice(0, limit);

    if (!topResults || topResults.length === 0) {
        return (
             <Card className="mt-6 bg-white shadow-md border border-gray-200">
                 <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" /> Live Ledertavle
                      </CardTitle>
                      <CardDescription>
                          Resultater vil vises her når spillet er i gang og scores registreres.
                      </CardDescription>
                 </CardHeader>
             </Card>
        );
    }

    return (
        <Card className="mt-6 bg-white shadow-md border border-gray-200">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" /> Live Ledertavle (Topp {limit})
                        </CardTitle>
                        <CardDescription>
                            Banens par: {totalPar}
                        </CardDescription>
                    </div>
                     <Link href={`/turnerings-spill/${sessionId}/results`}>
                        <Button variant="outline" size="sm">
                             Se Full Tavle <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0"> {/* Fjerner padding for tabell */}
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Spiller</TableHead>
                            <TableHead className="w-[80px] text-center">Score</TableHead>
                            <TableHead className="w-[80px] text-center">+/-</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topResults.map((player) => (
                            <TableRow key={player.playerId}>
                                <TableCell className="text-center font-medium">{player.rank}</TableCell>
                                <TableCell className="font-medium">{player.playerName}</TableCell>
                                <TableCell className="text-center font-semibold">{player.totalScore}</TableCell>
                                <TableCell className={`text-center font-semibold ${
                                    player.scoreRelativeToPar === 0 ? 'text-gray-700' :
                                    player.scoreRelativeToPar < 0 ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                    {player.scoreRelativeToPar === 0 ? 'E' : player.scoreRelativeToPar > 0 ? `+${player.scoreRelativeToPar}` : player.scoreRelativeToPar}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}