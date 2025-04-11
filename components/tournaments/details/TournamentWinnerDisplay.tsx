// Fil: components/tournaments/details/TournamentWinnerDisplay.tsx
// Formål: Definerer en React-komponent ('use client') som viser vinneren(e) av en turnering etter at den er fullført.
//         Henter data fra standings, håndterer lasting og feiltilstander, viser vinnernavn(ene) og score,
//         og inkluderer en lenke til den fullstendige resultatlisten. Bruker Card-komponenter for visuell struktur.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import React from 'react';
import Link from 'next/link'; // Importer Link
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Importer CardDescription
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // Importer Button
import { Trophy, AlertCircle } from 'lucide-react';

// Interface for en spiller i standings-arrayen (juster etter behov basert på API-responsen)
interface StandingPlayer {
    rank: number;
    playerId: string;
    playerName: string;
    playerImage?: string | null;
    totalScore: number;
    tournamentId: string; // Viktig for lenken til fullstendige resultater
    // ... andre felter du evt. har fra /standings API
}

interface TournamentWinnerDisplayProps {
    standings: StandingPlayer[];
    isLoading: boolean;
    error: string | null;
    tournamentId: string; // Send med tournamentId for lenken
}

export function TournamentWinnerDisplay({ standings, isLoading, error, tournamentId }: TournamentWinnerDisplayProps) {
    if (isLoading) {
        return (
            <Card className="mt-6 animate-pulse">
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-10 w-10 rounded-full mb-2" />
                    <Skeleton className="h-6 w-24 rounded" />
                </CardHeader>
                <CardContent className="space-y-2 text-center pb-6">
                    <Skeleton className="h-5 w-3/4 mx-auto rounded" />
                    <Skeleton className="h-4 w-1/2 mx-auto rounded" />
                    <Skeleton className="h-8 w-40 mx-auto mt-3 rounded" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="mt-6 border-destructive bg-destructive/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" /> Kunne ikke laste vinnerinfo
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-destructive">
                    {error}
                </CardContent>
            </Card>
        );
    }

    // Finn vinner(e) - de med rank 1
    const winners = standings.filter(p => p.rank === 1);

    // Håndter tilfeller uten vinner/resultater
    if (winners.length === 0) {
         // Ikke vis noe hvis det ikke er noen vinner funnet (kan skje hvis standings er tom)
         return null;
    }

    const winnerText = winners.length > 1 ? "Vinnere" : "Vinner";
    // Bruk non-breaking space ( ) for å unngå at "og" havner alene på en linje
    const winnerNames = winners.map(w => w.playerName).join(winners.length > 2 ? ', ' : ' og ').replace(/, ([^,]*)$/, ' og $1'); // Håndterer komma og "og"
    const winnerScore = winners[0]?.totalScore; // Antar lik score for alle med rank 1

    return (
        <Card className="mt-6 border-amber-400/50 bg-gradient-to-br from-amber-50 via-white to-amber-50 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="text-center pt-6">
                <Trophy className="h-12 w-12 mx-auto text-amber-500 mb-3 animate-bounce" /> {/* Litt animasjon */}
                <CardTitle className="text-2xl font-bold tracking-tight text-amber-800">{winnerText}!</CardTitle>
                <CardDescription className="text-amber-700/90 pt-1">Gratulerer!</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6 px-4">
                {/* Vis bilde hvis det finnes (eksempel for én vinner) */}
                {winners.length === 1 && winners[0].playerImage && (
                     <img
                         src={winners[0].playerImage}
                         alt={winners[0].playerName}
                         className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-amber-300 shadow-sm object-cover"
                     />
                )}
                 {/* Vis navn(ene) */}
                <p className="text-xl font-semibold text-gray-800 mb-1">{winnerNames}</p>
                 {/* Vis score */}
                <p className="text-md text-gray-600">Med en totalsum på {winnerScore} kast</p>
                 {/* Lenke til fullstendige resultater */}
                 <Link href={`/tournament/${tournamentId}/standings`} passHref>
                     <Button variant="link" className="mt-4 text-amber-600 hover:text-amber-800 hover:underline">
                         Se fullstendige resultater
                     </Button>
                 </Link>
            </CardContent>
        </Card>
    );
}