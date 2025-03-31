// app/api/tournament-sessions/[sessionId]/play-data/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, TournamentStatus, Hole, TournamentGameParticipation, TournamentGameScore, User } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// Oppdatert PlayData interface
export interface PlayData {
    sessionId: string;
    tournamentId: string;
    tournamentName: string;
    roundNumber: number;
    status: string;
    course: {
        id: string;
        name: string;
        holeCount: number;
        holes: {
            id: string;
            holeNumber: number;
            par: number;
            distance: number | null;
        }[];
    };
    participants: {
        playerId: string;
        playerName: string;
        participationId: string;
    }[];
    throws: { // Oppdatert throws type
        id: string;
        participationId: string;
        score: number;
        obCount: number; // NY: Lagt til obCount
        holeNumber: number;
    }[];
}


export async function GET(
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

    // Bruk sessionId som før etter await
    if (!sessionId) {
        return NextResponse.json({ error: "Mangler sesjons-ID." }, { status: 400 });
    }

    try {
        const gameSession = await prisma.tournamentGameSession.findUnique({
            where: { id: sessionId }, // Bruker sessionId fra awaitedParams
            include: {
                tournament: {
                    include: {
                        course: {
                            select: {
                                id: true, name: true, par: true, numHoles: true,
                                baskets: { select: { id: true } }
                            }
                        }
                    }
                },
                participants: { include: { player: true } },
                scores: true // Henter hele score-objektet, inkl. obCount
            }
        });

        // --- Sjekker (uendret logikk) ---
        if (!gameSession) {
            return NextResponse.json({ error: "Spillrunde ikke funnet." }, { status: 404 });
        }

        const isParticipant = gameSession.participants.some( (p: TournamentGameParticipation) => p.playerId === session.user!.id );
        // Forbedret sikkerhet: returner 404 hvis brukeren ikke er deltaker for å ikke lekke info om runden finnes
        if (!isParticipant) {
            console.warn(`User ${session.user.id} attempted to access session ${sessionId} without participation.`);
            return NextResponse.json({ error: "Spillrunde ikke funnet eller ingen tilgang." }, { status: 404 });
        }

        if (gameSession.status !== 'inProgress' && gameSession.status !== 'completed') {
             return NextResponse.json({ error: `Spillet er ikke startet eller er fullført (status: ${gameSession.status}).` }, { status: 409 });
        }

        if (!gameSession.tournament?.course) {
            console.error(`Missing tournament or course data for session ${sessionId}`);
            return NextResponse.json({ error: "Kunne ikke laste nødvendig spillinformasjon (turnering/bane)." }, { status: 500 });
        }

        // --- Datatransformasjon (uendret logikk) ---
        const course = gameSession.tournament.course;
        const holeCount = course.numHoles ?? course.baskets?.length ?? 0;

        if (holeCount === 0) {
            console.error(`Course ${course.id} associated with session ${sessionId} has no holes defined.`);
            return NextResponse.json({ error: "Banen har ingen hull definert." }, { status: 500 });
        }

        const defaultPar = course.par ?? 3;
        // Generer hull basert på numHoles eller antall baskets
        const generatedHoles = Array.from({ length: holeCount }, (_, i) => ({
            id: `hole-${i + 1}`, // Bruker en mer generisk ID hvis faktiske hull-IDer ikke er lastet/brukt
            holeNumber: i + 1,
            par: defaultPar, // Bør ideelt sett hente fra faktiske hole data hvis tilgjengelig
            distance: null // Bør ideelt sett hente fra faktiske hole data hvis tilgjengelig
        }));

        // Sørger for at Player er tilgjengelig
        type ParticipantWithPlayer = TournamentGameParticipation & { player: User };
        const validParticipants = gameSession.participants.filter(p => p.player) as ParticipantWithPlayer[];

        const responseData: PlayData = {
            sessionId: gameSession.id,
            tournamentId: gameSession.tournamentId,
            tournamentName: gameSession.tournament.name,
            roundNumber: gameSession.roundNumber,
            status: gameSession.status,
            course: {
                id: course.id,
                name: course.name,
                holeCount: holeCount,
                holes: generatedHoles, // Bruker genererte/basis hull-info
            },
            participants: validParticipants.map(p => ({
                playerId: p.playerId,
                playerName: p.player.name ?? `Bruker ${p.playerId.substring(0, 6)}`, // Fallback navn
                participationId: p.id,
            })),
            throws: gameSession.scores.map((t: TournamentGameScore) => {
                // Finner participationId basert på playerId fra score-objektet
                const participation = validParticipants.find(p => p.playerId === t.playerId);
                return {
                    id: t.id,
                    // Sørger for at vi KUN inkluderer kast fra gyldige deltakere
                    participationId: participation?.id ?? '',
                    score: t.strokes,
                    obCount: t.obCount,
                    holeNumber: t.holeNumber
                };
            }).filter(t => t.participationId), // Filtrerer bort kast uten gyldig participationId
        };

        return NextResponse.json(responseData);

    } catch (error) {
         console.error("Feil i /api/tournament-sessions/[sessionId]/play-data:", error);
         // Returner en generell feilmelding til klienten
         return NextResponse.json( { error: "En intern feil oppstod under henting av spilldata." }, { status: 500 } );
    } finally {
        await prisma.$disconnect();
    }
}