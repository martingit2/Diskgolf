// app/api/tournament-sessions/[sessionId]/score/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// ScoreRequestBody interface (uendret)
interface ScoreRequestBody {
    holeNumber: number;
    scores: {
        playerId: string;
        score: number;
        obCount: number;
    }[];
}

export async function POST(
  req: Request,
  // --- KORRIGERT TYPESIGNATUR HER ---
  { params }: { params: Promise<{ sessionId: string }> }
) {
    // --- LØS PROMISET HER ---
    const awaitedParams = await params;
    const { sessionId } = awaitedParams; // Bruk den awaited verdien

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }

    // Valider at sessionId finnes etter await
    if (!sessionId) {
        return NextResponse.json({ error: "Mangler sesjons-ID." }, { status: 400 });
    }

    try {
        // Bruk sessionId fra awaitedParams
        const { holeNumber, scores }: ScoreRequestBody = await req.json();

        if (typeof holeNumber !== 'number' || holeNumber < 1 || !scores || !Array.isArray(scores) || scores.length === 0) {
            return NextResponse.json({ error: "Ugyldig forespørsel. Mangler hullnummer eller scores." }, { status: 400 });
        }

        // Hent nødvendig info om sesjonen
        const gameSession = await prisma.tournamentGameSession.findUnique({
            where: { id: sessionId },
            include: {
                // Inkluder deltakere for å validere spillere og hente participation ID
                participants: { select: { id: true, playerId: true } },
                // Inkluder turneringsinfo for å sjekke antall hull
                tournament: {
                     select: {
                         course: {
                             select: {
                                 numHoles: true,
                                 baskets: { select: { id: true } } // For fallback telling
                             }
                         }
                     }
                 }
            }
        });

        // --- Sjekker ---
        if (!gameSession) {
            return NextResponse.json({ error: "Spillrunde ikke funnet." }, { status: 404 });
        }

        // Sjekk om spillet er i gang
        if (gameSession.status !== 'inProgress') {
            return NextResponse.json({ error: `Kan ikke lagre score, spillet er ikke i gang (status: ${gameSession.status}).` }, { status: 409 }); // Conflict
        }

        // Sjekk om innlogget bruker er deltaker (kan fjernes hvis all lagring skjer på vegne av flighten)
        const currentUserParticipation = gameSession.participants.find(p => p.playerId === session.user.id);
        if (!currentUserParticipation) {
            // Returner 404 for å ikke lekke info om runden finnes hvis bruker ikke er med
            return NextResponse.json({ error: "Du er ikke deltaker i denne runden." }, { status: 404 });
        }

        // Sjekk hullnummer mot bane
        const maxHoles = gameSession.tournament?.course?.numHoles ?? gameSession.tournament?.course?.baskets?.length ?? 0;
        if (holeNumber < 1 || (maxHoles > 0 && holeNumber > maxHoles) ) {
             return NextResponse.json({ error: `Ugyldig hullnummer (${holeNumber}). Banen har ${maxHoles} hull.` }, { status: 400 });
        }

        // Map playerId til participationId for enkel oppslag
        const participationMap = new Map<string, string>();
        gameSession.participants.forEach(p => participationMap.set(p.playerId, p.id));

        // Generer upsert-operasjoner for hver score
        const upsertOperations = scores.map(playerScore => {
            // Valider playerId og finn participationId
            const participationId = participationMap.get(playerScore.playerId);
            if (!participationId) {
                console.warn(`Mottok score for ukjent/ikke-deltakende spiller ${playerScore.playerId} i runde ${sessionId}. Ignoreres.`);
                return null; // Ignorer score for ukjente spillere
            }

            // Valider score og obCount (må være tall >= 0, score må være minst 1)
            const score = playerScore.score;
            const obCount = playerScore.obCount;
            if (typeof score !== 'number' || score < 1 || typeof obCount !== 'number' || obCount < 0) {
                 console.warn(`Ugyldig score (${score}) eller obCount (${obCount}) for spiller ${playerScore.playerId} på hull ${holeNumber}. Ignoreres.`);
                 return null; // Ignorer ugyldig score/OB
            }

            // Lag upsert-operasjon
            return prisma.tournamentGameScore.upsert({
                where: {
                    gameSessionId_playerId_holeNumber: {
                        gameSessionId: sessionId,
                        playerId: playerScore.playerId,
                        holeNumber: holeNumber,
                    },
                },
                update: {
                    strokes: score,
                    obCount: obCount,
                },
                create: {
                    gameSessionId: sessionId,
                    playerId: playerScore.playerId,
                    holeNumber: holeNumber,
                    strokes: score,
                    obCount: obCount,
                    // Merk: Ingen tournamentId eller participationId her, da de ikke finnes i schema
                },
            });
        }).filter(op => op !== null); // Fjern null-verdier (ignorerte scores)

        // Hvis ingen gyldige operasjoner gjenstår etter filtrering
        if (upsertOperations.length === 0 && scores.length > 0) {
             console.warn(`Ingen gyldige scores funnet å lagre for hull ${holeNumber} i runde ${sessionId}. Forespørsel inneholdt ${scores.length} entries.`);
             return NextResponse.json({ error: "Ingen gyldige scores å lagre." }, { status: 400 });
        } else if (upsertOperations.length === 0 && scores.length === 0) {
             // Tom forespørsel er kanskje ikke en feil, men heller ingenting å gjøre
             return NextResponse.json({ success: true, savedScores: 0, message: "Ingen scores sendt." });
        }

        // Utfør alle gyldige upsert-operasjoner i en transaksjon
        const result = await prisma.$transaction(upsertOperations as any); // Bruk 'as any' for å omgå TS-klage på filter(op => op !== null)
        console.log(`Lagret/oppdaterte ${result.length} scores for hull ${holeNumber} i runde ${sessionId}`);

        return NextResponse.json({ success: true, savedScores: result.length });

    } catch (error) {
        console.error(`Feil i /api/tournament-sessions/${sessionId}/score:`, error);
        if (error instanceof SyntaxError) { // Fanger feil hvis req.json() feiler
            return NextResponse.json({ error: "Ugyldig JSON-format i forespørsel." }, { status: 400 });
        }
        // TODO: Legg til mer spesifikk feilhåndtering for Prisma-feil ved behov
        return NextResponse.json( { error: "En intern feil oppstod ved lagring av score." }, { status: 500 } );
    } finally {
        await prisma.$disconnect();
    }
}