// app/api/tournaments/[id]/standings/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
// Autentisering er ikke nødvendig for dette offentlige endepunktet

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    // --- KORRIGERT TYPESIGNATUR HER ---
    { params }: { params: Promise<{ id: string }> }
) {
    // --- LØS PROMISET HER ---
    const awaitedParams = await params;
    const tournamentId = awaitedParams.id; // Bruk den awaited verdien

    // Valider at tournamentId finnes etter await
    if (!tournamentId) {
        return NextResponse.json(
            { error: "Mangler turnerings-ID." },
            { status: 400 }
        );
    }

    try {
        // Bruk tournamentId fra awaitedParams
        // Sjekk om turneringen finnes (god praksis, selv om ikke strengt nødvendig for å hente scores)
        const tournamentExists = await prisma.tournament.count({
             where: { id: tournamentId },
             // Optional: Sjekk også status hvis du kun vil vise standings for COMPLETED/IN_PROGRESS
             // where: { id: tournamentId, status: { in: ['COMPLETED', 'IN_PROGRESS']} }
        });
        if (tournamentExists === 0) {
             return NextResponse.json({ error: "Turnering ikke funnet." }, { status: 404 });
        }

        // Hent lagrede scores for den gitte turneringen
        const standings = await prisma.tournamentScore.findMany({
            where: { tournamentId: tournamentId },
            include: {
                player: { // Inkluder spillerinfo for visning
                    select: {
                        id: true,
                        name: true,
                        image: true // Inkluder profilbilde
                    }
                }
            },
            orderBy: [ // Sorteringskriterier for rangering
                 { totalScore: "asc" }, // Lavest totalsum først
                 { totalOb: "asc" },    // Færrest OB ved lik score
                 { player: { name: 'asc' }} // Alfabetisk på navn ved helt lik score/OB
            ]
        });

        // Returner tom liste hvis ingen scores er funnet (bedre enn 404)
        if (standings.length === 0) {
             return NextResponse.json([]);
        }

        // Formater data med rangering
        let currentRank = 0;
        const formattedStandings = standings.map((score, index) => {
            // Bestem rangering (inkludert delte plasser)
            if (index === 0 || score.totalScore > standings[index - 1].totalScore || score.totalOb > standings[index - 1].totalOb) {
                currentRank = index + 1; // Ny rangering hvis score eller OB er dårligere enn forrige
            }
            return {
                rank: currentRank, // Legg til rangering
                playerId: score.player.id,
                playerName: score.player.name || `Spiller ${score.player.id.substring(0, 6)}`, // Fallback navn
                playerImage: score.player.image,
                totalScore: score.totalScore,
                totalOb: score.totalOb,
                // Vurder å fjerne 'strokes' her hvis den ikke trengs i oversikten
                // for å redusere datamengden. Kan hentes ved behov senere.
                // strokes: score.strokes
            };
        });

        return NextResponse.json(formattedStandings);
    } catch (error) {
        console.error(`Feil ved henting av stilling for turnering ${tournamentId}:`, error);
        return NextResponse.json(
            { error: "En intern feil oppstod ved henting av stilling." },
            { status: 500 }
        );
    } finally {
        // Koble fra etter operasjonen
        await prisma.$disconnect();
    }
}