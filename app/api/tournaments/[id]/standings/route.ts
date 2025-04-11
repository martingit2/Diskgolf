// Fil: app/api/tournaments/[id]/standings/route.ts
// Formål: API-endepunkt (GET) for å hente resultatlisten (standings) for en spesifikk turnering.
//         Hvis turneringen er 'COMPLETED', hentes de lagrede resultatene fra TournamentScore.
//         Hvis turneringen er 'IN_PROGRESS', beregnes en live-stilling basert på TournamentGameScore.
//         For andre statuser returneres en tom liste. Resultatene sorteres og rangeres før retur.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { PrismaClient, TournamentGameScore, TournamentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Interface for returnert data (inkl. rank og tournamentId)
interface PlayerStandings {
    playerId: string;
    playerName: string;
    playerImage: string | null;
    totalScore: number;
    totalOb: number;
    rank: number;
    tournamentId: string;
}

// Hjelpefunksjon for å beregne LIVE standings fra spilldata
async function calculateLiveStandings(tournamentId: string): Promise<Omit<PlayerStandings, 'rank' | 'tournamentId'>[]> {
     const gameSessions = await prisma.tournamentGameSession.findMany({
         where: { tournamentId: tournamentId },
         include: {
             participants: { include: { player: { select: { id: true, name: true, image: true } } } },
             scores: true
         }
     });

     if (!gameSessions || gameSessions.length === 0) return [];

     const allParticipantsMap = new Map<string, { id: string; name: string | null; image: string | null }>();
     gameSessions.forEach(session => {
         session.participants.forEach(p => {
             if (p.player && !allParticipantsMap.has(p.playerId)) {
                 allParticipantsMap.set(p.playerId, p.player);
             }
         });
     });

     const playerResults: { [playerId: string]: { totalScore: number; totalOb: number; } } = {};
     for (const session of gameSessions) {
         for (const score of session.scores) {
            if (allParticipantsMap.has(score.playerId)) {
                if (!playerResults[score.playerId]) {
                    playerResults[score.playerId] = { totalScore: 0, totalOb: 0 };
                }
                playerResults[score.playerId].totalOb += score.obCount;
                playerResults[score.playerId].totalScore += (score.strokes + score.obCount);
            }
         }
     }

    const resultsWithInfo = Array.from(allParticipantsMap.entries()).map(([playerId, playerInfo]) => {
        const stats = playerResults[playerId];
        return {
            playerId: playerId,
            playerName: playerInfo.name || `Spiller ${playerId.substring(0, 6)}`,
            playerImage: playerInfo.image,
            totalScore: stats?.totalScore ?? 0,
            totalOb: stats?.totalOb ?? 0,
        };
    });

     return resultsWithInfo;
}


export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const awaitedParams = await params;
    const tournamentId = awaitedParams.id;

    if (!tournamentId) {
        return NextResponse.json({ error: "Mangler turnerings-ID." }, { status: 400 });
    }

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: { status: true }
        });

        if (!tournament) {
            return NextResponse.json({ error: "Turnering ikke funnet." }, { status: 404 });
        }

        let resultsWithInfo: Omit<PlayerStandings, 'rank' | 'tournamentId'>[] = [];

        if (tournament.status === TournamentStatus.COMPLETED) {
            // HENT FRA LAGREDE TournamentScore
            console.log(`Henter lagrede standings fra TournamentScore for ${tournamentId}`);
            const finalScores = await prisma.tournamentScore.findMany({
                where: { tournamentId: tournamentId },
                include: {
                    player: { select: { id: true, name: true, image: true } }
                },
            });

             if (finalScores.length === 0) {
                 console.warn(`Ingen lagrede TournamentScore funnet for COMPLETED tournament ${tournamentId}. Returnerer tom liste.`);
                 // Ikke beregn på nytt her, data *skal* være lagret. Returner tom liste.
                 resultsWithInfo = [];
             } else {
                 resultsWithInfo = finalScores.map(score => ({
                    playerId: score.playerId,
                    playerName: score.player.name || `Spiller ${score.playerId.substring(0, 6)}`,
                    playerImage: score.player.image,
                    totalScore: score.totalScore,
                    totalOb: score.totalOb,
                 }));
             }

        } else if (tournament.status === TournamentStatus.IN_PROGRESS) {
            // BEREGN LIVE STANDINGS
             console.log(`Beregner live standings fra TournamentGameScore for ${tournamentId}`);
             resultsWithInfo = await calculateLiveStandings(tournamentId);
        } else {
             // For PLANNING eller REGISTRATION_OPEN
             console.log(`Turnering ${tournamentId} er ${tournament.status}, returnerer tom standings-liste.`);
             return NextResponse.json([]);
        }

        // Felles Sortering og Rangering
        if (resultsWithInfo.length > 0) {
             resultsWithInfo.sort((a, b) => {
                 if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
                 if (a.totalOb !== b.totalOb) return a.totalOb - b.totalOb;
                 return a.playerName.localeCompare(b.playerName);
             });

             let currentRank = 0;
             const rankedStandings: PlayerStandings[] = resultsWithInfo.map((player, index) => {
                 if (index === 0 || player.totalScore > resultsWithInfo[index - 1].totalScore || player.totalOb > resultsWithInfo[index - 1].totalOb) {
                     currentRank = index + 1;
                 }
                 return {
                     ...player,
                     rank: currentRank,
                     tournamentId: tournamentId
                 };
             });
             return NextResponse.json(rankedStandings);
        } else {
             return NextResponse.json([]); // Returner tom liste hvis ingen resultater
        }

    } catch (error) {
        console.error(`Feil ved henting av stilling for turnering ${tournamentId}:`, error);
        return NextResponse.json({ error: "Intern feil ved henting av stilling." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}