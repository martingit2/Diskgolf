// app/api/tournaments/[id]/finalize/route.ts
import { PrismaClient, TournamentGameScore, TournamentStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// Hjelpefunksjon for å beregne resultater
async function calculateFinalStandings(tournamentId: string) {
    const gameSessions = await prisma.tournamentGameSession.findMany({
        where: { tournamentId: tournamentId },
        include: {
            participants: { include: { player: { select: { id: true, name: true, image: true } } } },
            scores: true
        }
    });

    if (!gameSessions || gameSessions.length === 0) {
        console.warn(`Ingen spillrunder funnet for turnering ${tournamentId} ved finalisering.`);
        return [];
    }

    const allParticipantsMap = new Map<string, { id: string; name: string | null; image: string | null }>();
    gameSessions.forEach(session => {
        session.participants.forEach(p => {
            if (p.player && !allParticipantsMap.has(p.playerId)) {
                allParticipantsMap.set(p.playerId, p.player);
            }
        });
    });

    const playerResults: { [playerId: string]: { totalScore: number; totalOb: number; holeDetails: any } } = {};

    for (const session of gameSessions) {
        for (const score of session.scores) {
            if (allParticipantsMap.has(score.playerId)) {
                 if (!playerResults[score.playerId]) {
                     playerResults[score.playerId] = { totalScore: 0, totalOb: 0, holeDetails: {} };
                 }
                 playerResults[score.playerId].totalOb += score.obCount;
                 playerResults[score.playerId].totalScore += (score.strokes + score.obCount);
                 const holeKey = `r${session.roundNumber}h${score.holeNumber}`;
                 playerResults[score.playerId].holeDetails[holeKey] = { strokes: score.strokes, ob: score.obCount };
             } else {
                 console.warn(`Score funnet for spiller ${score.playerId} i runde ${session.id}, men spilleren var ikke i participant-listen for noen runde.`);
             }
        }
    }

     const resultsWithInfo = Array.from(allParticipantsMap.entries()).map(([playerId, playerInfo]) => {
         const stats = playerResults[playerId];
         // --- KORRIGERT HER: Bruk tomt objekt {} i stedet for Prisma.JsonNull ---
         const holeDetailsValue = stats?.holeDetails ? stats.holeDetails : {};
         return {
             playerId: playerId,
             playerName: playerInfo.name || `Spiller ${playerId.substring(0, 6)}`,
             playerImage: playerInfo.image,
             totalScore: stats?.totalScore ?? 0,
             totalOb: stats?.totalOb ?? 0,
             // Sørg for at typen er kompatibel med Prisma.InputJsonValue
             holeDetailsJson: holeDetailsValue as Prisma.InputJsonValue
         };
         // --- SLUTT KORRIGERING ---
     });

    // Sortering
    resultsWithInfo.sort((a, b) => {
        if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
        if (a.totalOb !== b.totalOb) return a.totalOb - b.totalOb;
        return a.playerName.localeCompare(b.playerName);
    });

    // Legg til rangering
    let currentRank = 0;
    const rankedStandings = resultsWithInfo.map((player, index) => {
        if (index === 0 || player.totalScore > resultsWithInfo[index - 1].totalScore || player.totalOb > resultsWithInfo[index - 1].totalOb) {
            currentRank = index + 1;
        }
        return {
            ...player,
            rank: currentRank,
        };
    });

    return rankedStandings;
}


export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }

    const awaitedParams = await params;
    const tournamentId = awaitedParams.id;

    if (!tournamentId) {
        return NextResponse.json({ error: "Mangler turnerings-ID." }, { status: 400 });
    }

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: { status: true, organizerId: true }
        });

        if (!tournament) {
            return NextResponse.json({ error: "Turnering ikke funnet." }, { status: 404 });
        }

        if (tournament.organizerId !== session.user.id) {
            return NextResponse.json({ error: "Du har ikke tillatelse til å finalisere." }, { status: 403 });
        }

        if (tournament.status !== TournamentStatus.COMPLETED) {
             return NextResponse.json({ error: "Turneringen må være 'Fullført'." }, { status: 409 });
        }

        console.log(`Starter finalisering og lagring av resultater for turnering ${tournamentId}...`);

        const finalStandings = await calculateFinalStandings(tournamentId);

        if (finalStandings.length === 0) {
            console.log(`Ingen resultater å lagre for turnering ${tournamentId}.`);
             return NextResponse.json({ success: true, message: "Ingen endelige resultater funnet." });
        }

        // Forbered upsert-operasjoner
        const upsertOperations = finalStandings.map(standing =>
            prisma.tournamentScore.upsert({
                where: {
                    tournamentId_playerId: {
                        tournamentId: tournamentId,
                        playerId: standing.playerId,
                    }
                },
                update: { // Oppdater hvis raden finnes
                    totalScore: standing.totalScore,
                    totalOb: standing.totalOb,
                    // --- KORRIGERT HER: Bruk verdien direkte ---
                    strokes: standing.holeDetailsJson,
                    // --- SLUTT KORRIGERING ---
                    isVerified: true,
                    submittedAt: new Date(),
                },
                create: { // Lag hvis raden ikke finnes
                    tournamentId: tournamentId,
                    playerId: standing.playerId,
                    totalScore: standing.totalScore,
                    totalOb: standing.totalOb,
                    // --- KORRIGERT HER: Bruk verdien direkte ---
                    strokes: standing.holeDetailsJson,
                    // --- SLUTT KORRIGERING ---
                    isVerified: true,
                }
             })
         );

         const results = await prisma.$transaction(upsertOperations);

        console.log(`Lagret/oppdaterte ${results.length} endelige resultater for turnering ${tournamentId}`);
        return NextResponse.json({ success: true, message: `Lagret/oppdaterte ${results.length} endelige resultater.` });

    } catch (error) {
        console.error(`Feil under finalisering av turnering ${tournamentId}:`, error);
        return NextResponse.json( { error: "Intern feil ved lagring av resultater." }, { status: 500 } );
    } finally {
        await prisma.$disconnect();
    }
}