// app/api/tournament-sessions/[sessionId]/play-data/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, TournamentStatus, Hole, TournamentGameParticipation, TournamentGameScore, User } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

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
    throws: {
        id: string;
        participationId: string;
        score: number;
        obCount: number;
        holeNumber: number;
    }[];
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
    const awaitedParams = await params;
    const { sessionId } = awaitedParams;

    const session = await getServerSession(authOptions);
    // --- VIKTIG: Sjekk for innlogging FØR du prøver å aksessere session.user.id ---
    if (!session?.user?.id) {
        // Returner 401 hvis brukeren ikke er logget inn i det hele tatt
        return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }
    // --- SLUTT VIKTIG ---

    if (!sessionId) {
        return NextResponse.json({ error: "Mangler sesjons-ID." }, { status: 400 });
    }

    try {
        const gameSession = await prisma.tournamentGameSession.findUnique({
            where: { id: sessionId },
            include: {
                tournament: { include: { course: { select: { id: true, name: true, par: true, numHoles: true, baskets: { select: { id: true } } } } } },
                participants: { include: { player: { select: { id: true, name: true, image: true } } } }, // Inkluder spillerinfo her
                scores: true
            }
        });

        if (!gameSession) {
            return NextResponse.json({ error: "Spillrunde ikke funnet." }, { status: 404 });
        }

        // --- JUSTERT STATUS- OG DELTAKER-SJEKK ---
        const isCompleted = gameSession.status === 'completed';
        const isInProgress = gameSession.status === 'inProgress';

        // Hvis runden *ikke* er i gang og *ikke* er fullført, returner 409 (Conflict/Not Ready)
        if (!isInProgress && !isCompleted) {
             return NextResponse.json({ error: `Spillet er ikke startet eller er ugyldig (status: ${gameSession.status}).` }, { status: 409 });
        }

        // Sjekk deltakelse KUN hvis runden er IN_PROGRESS
        if (isInProgress) {
             // Bruk select chaining (?.) for å unngå feil hvis session.user er null (selv om vi sjekket over)
            const isParticipant = gameSession.participants.some( (p: any) => p.playerId === session?.user?.id ); // Bruk any for enkelhets skyld her
            if (!isParticipant) {
                 console.warn(`User ${session?.user?.id} attempted to access IN_PROGRESS session ${sessionId} without participation.`);
                 // Returner 403 Forbidden hvis de prøver å se en pågående runde de ikke deltar i
                 return NextResponse.json({ error: "Du har ikke tilgang til å se denne pågående runden." }, { status: 403 });
            }
        }
        // Hvis runden er COMPLETED, trenger vi *ikke* sjekke deltakelse. Alle innloggede brukere kan se resultatene.
        // --- SLUTT JUSTERING ---


        if (!gameSession.tournament?.course) {
            console.error(`Missing tournament or course data for session ${sessionId}`);
            return NextResponse.json({ error: "Kunne ikke laste nødvendig spillinformasjon (turnering/bane)." }, { status: 500 });
        }

        const course = gameSession.tournament.course;
        const holeCount = course.numHoles ?? course.baskets?.length ?? 0;

        if (holeCount === 0) {
            console.error(`Course ${course.id} associated with session ${sessionId} has no holes defined.`);
            return NextResponse.json({ error: "Banen har ingen hull definert." }, { status: 500 });
        }

        // Beregn default par hvis ikke satt på kurset
        const totalCoursePar = course.par ?? holeCount * 3; // Fallback til 3 per hull
        const defaultParPerHole = Math.round(totalCoursePar / holeCount) || 3; // Bruk gjennomsnitt eller fallback

        // Generer hull-info (som før, men bruk bedre fallback for par)
        const generatedHoles = Array.from({ length: holeCount }, (_, i) => ({
            id: `hole-${i + 1}`,
            holeNumber: i + 1,
            par: defaultParPerHole, // Bruker beregnet default
            distance: null
        }));

        // Sørger for at Player er tilgjengelig og bruker riktig type
        type ParticipantWithPlayer = TournamentGameParticipation & { player: { id: string; name: string | null; image: string | null; } };
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
                holes: generatedHoles,
            },
            participants: validParticipants.map(p => ({
                playerId: p.player.id, // Bruk p.player.id
                playerName: p.player.name ?? `Bruker ${p.player.id.substring(0, 6)}`,
                participationId: p.id,
            })),
            throws: gameSession.scores.map((t: TournamentGameScore) => {
                const participation = validParticipants.find(p => p.playerId === t.playerId);
                return {
                    id: t.id,
                    participationId: participation?.id ?? '',
                    score: t.strokes,
                    obCount: t.obCount,
                    holeNumber: t.holeNumber
                };
            }).filter(t => t.participationId),
        };

        return NextResponse.json(responseData);

    } catch (error) {
         console.error("Feil i /api/tournament-sessions/[sessionId]/play-data:", error);
         return NextResponse.json( { error: "En intern feil oppstod under henting av spilldata." }, { status: 500 } );
    } finally {
        await prisma.$disconnect();
    }
}