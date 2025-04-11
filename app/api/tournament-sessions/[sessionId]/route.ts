// Fil: app/api/tournament-sessions/[sessionId]/route.ts
// Formål: API-endepunkt (GET) for å hente detaljert informasjon om en spesifikk turneringsrunde (sesjon).
//         Krever autentisering og validerer at brukeren er deltaker. Returnerer rundeinfo, turneringsinfo,
//         banedetaljer (navn, antall hull, par) og en liste over deltakere.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    // --- KORRIGERT TYPESIGNATUR HER ---
    { params }: { params: Promise<{ sessionId: string }> }
) {
    // --- LØS PROMISET HER ---
    const awaitedParams = await params;
    const { sessionId } = awaitedParams; // Bruk den awaited verdien

    const session = await getServerSession(authOptions);
    // Krever innlogging for å se sesjonsdetaljer
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }

    // Valider at sessionId finnes etter await
    if (!sessionId) {
        return NextResponse.json({ error: "Mangler sesjons-ID." }, { status: 400 });
    }

    try {
        // Bruk sessionId fra awaitedParams
        const gameSession = await prisma.tournamentGameSession.findUnique({
            where: { id: sessionId },
            include: {
                tournament: {
                    include: {
                        course: {
                            select: { // Velg kun nødvendige felter fra Course
                                id: true,
                                name: true,
                                // Fjernet holes her, hentes separat hvis nødvendig eller kun antall
                                numHoles: true,
                                par: true,
                            }
                        }
                    }
                },
                participants: {
                    include: {
                        player: { select: { id: true, name: true, image: true } }
                    },
                    orderBy: { player: { name: 'asc' } } // Sorter deltakere
                },
                // Vurder å hente _count for effektivitet hvis du bare trenger antall
                _count: {
                    select: { participants: true }
                }
            }
        });

        if (!gameSession) {
            return NextResponse.json({ error: "Turneringsrunde ikke funnet." }, { status: 404 });
        }

        // Sjekk om innlogget bruker faktisk er deltaker i denne runden for økt sikkerhet
        const isParticipant = gameSession.participants.some(p => p.playerId === session?.user?.id);
        if (!isParticipant) {
            console.warn(`User ${session?.user?.id} attempted to access session ${sessionId} without being a participant.`);
            // Returner 404 for å ikke lekke informasjon om at runden finnes
            return NextResponse.json({ error: "Turneringsrunde ikke funnet eller ingen tilgang." }, { status: 404 });
        }

        // Sikrer at course-objektet finnes før vi prøver å få tilgang til det
        if (!gameSession.tournament?.course) {
            console.error(`Course data missing for tournament ${gameSession.tournamentId} linked to session ${sessionId}`);
            return NextResponse.json({ error: "Manglende banedata for turneringen." }, { status: 500 });
        }

        // Formater data for frontend
        const formattedParticipants = gameSession.participants.map(p => ({
            id: p.id, // Participation ID
            playerId: p.player.id,
            playerName: p.player.name || `Bruker ${p.player.id.substring(0, 6)}`,
            playerImage: p.player.image,
            isReady: p.isReady
        }));

        // Send relevant data til frontend
        const responseData = {
            id: gameSession.id,
            status: gameSession.status,
            roundNumber: gameSession.roundNumber,
            tournamentId: gameSession.tournamentId,
            tournamentName: gameSession.tournament.name,
            course: {
                id: gameSession.tournament.course.id,
                name: gameSession.tournament.course.name,
                numHoles: gameSession.tournament.course.numHoles, // Send antall hull
                par: gameSession.tournament.course.par, // Send total par hvis definert
            },
            participants: formattedParticipants,
            totalParticipants: gameSession._count.participants, // Send totalt antall
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error(`Feil ved henting av turneringsrunde ${sessionId}:`, error);
        return NextResponse.json(
            { error: "En intern feil oppstod ved henting av rundeinformasjon." },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}