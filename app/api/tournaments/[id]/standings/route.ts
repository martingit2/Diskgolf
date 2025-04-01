// app/api/tournaments/[id]/standings/route.ts
import { PrismaClient, TournamentGameScore } from "@prisma/client"; // Importer TournamentGameScore
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Definer en type for det beregnede resultatet per spiller
interface PlayerStandings {
    playerId: string;
    playerName: string;
    playerImage: string | null;
    totalScore: number;
    totalOb: number;
    // Vi trenger ikke strokes per hull her, men kan legge til hvis nødvendig
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
        // 1. Finn den (eneste) spill-sesjonen for denne turneringen
        const gameSession = await prisma.tournamentGameSession.findFirst({
            where: { tournamentId: tournamentId },
            // Trenger bare ID for å hente scores, men inkluderer relasjoner for spillerinfo
            include: {
                 tournament: { // For å sjekke eksistens
                      select: { id: true }
                 },
                 participants: { // For å hente spillerinfo
                      include: {
                           player: { select: { id: true, name: true, image: true } }
                      }
                 }
            },
            // Hvis det mot formodning skulle være flere, ta den siste (høyest rundeNr)
            orderBy: { roundNumber: 'desc' }
        });

        // Sjekk om turnering og sesjon finnes
        if (!gameSession || !gameSession.tournament) {
            return NextResponse.json({ error: "Turnering eller tilhørende spillrunde ikke funnet." }, { status: 404 });
        }

        // 2. Hent alle scores for den funnede spill-sesjonen
        const sessionScores: TournamentGameScore[] = await prisma.tournamentGameScore.findMany({
            where: { gameSessionId: gameSession.id },
        });

        // 3. Beregn totale resultater per spiller
        const playerResults: { [playerId: string]: Omit<PlayerStandings, 'playerName' | 'playerImage'> } = {};

        for (const score of sessionScores) {
            if (!playerResults[score.playerId]) {
                playerResults[score.playerId] = { playerId: score.playerId, totalScore: 0, totalOb: 0 };
            }
            playerResults[score.playerId].totalOb += score.obCount;
            // TotalScore = summen av (strokes + obCount) for alle hull
            playerResults[score.playerId].totalScore += (score.strokes + score.obCount);
        }

        // 4. Kombiner med spillerinfo og lag en liste
        const resultsWithInfo: PlayerStandings[] = gameSession.participants.map(participant => {
            const stats = playerResults[participant.playerId];
            return {
                playerId: participant.playerId,
                playerName: participant.player.name || `Spiller ${participant.playerId.substring(0, 6)}`,
                playerImage: participant.player.image,
                totalScore: stats?.totalScore ?? 0, // Bruk 0 hvis ingen score finnes (burde ikke skje hvis de deltok)
                totalOb: stats?.totalOb ?? 0,
            };
        });

        // 5. Sorter for rangering
        resultsWithInfo.sort((a, b) => {
            if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore; // Lavest score
            if (a.totalOb !== b.totalOb) return a.totalOb - b.totalOb; // Færrest OB
            return a.playerName.localeCompare(b.playerName); // Alfabetisk
        });

        // 6. Legg til rangering
        let currentRank = 0;
        const rankedStandings = resultsWithInfo.map((player, index) => {
            // Ny rangering hvis score eller OB er dårligere enn forrige
            if (index === 0 || player.totalScore > resultsWithInfo[index - 1].totalScore || player.totalOb > resultsWithInfo[index - 1].totalOb) {
                currentRank = index + 1;
            }
            return {
                ...player,
                rank: currentRank,
                tournamentId: tournamentId // Legg til for lenking i frontend
            };
        });

        // Returner den beregnede og sorterte listen
        return NextResponse.json(rankedStandings);

    } catch (error) {
        console.error(`Feil ved henting av stilling for turnering ${tournamentId}:`, error);
        return NextResponse.json(
            { error: "En intern feil oppstod ved henting av stilling." },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}