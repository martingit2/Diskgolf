// app/api/tournament-sessions/[sessionId]/ready/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

interface RequestBody {
    playerId: string; // Forventer at frontend sender innlogget brukers ID
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

    try {
        // Bruk sessionId fra awaitedParams
        const { playerId }: RequestBody = await req.json();

        // Valider input og at innlogget bruker er den som markerer seg klar
        if (session.user.id !== playerId) {
            console.warn(`User ${session.user.id} tried to mark ready for player ${playerId} in session ${sessionId}.`);
            return NextResponse.json({ error: "Ugyldig handling." }, { status: 403 });
        }
        if (!sessionId || !playerId) {
            return NextResponse.json({ error: "Mangler sesjons-ID eller spiller-ID." }, { status: 400 });
        }

        // Sjekk først om sesjonen og deltakelsen eksisterer og brukeren er med
        const participation = await prisma.tournamentGameParticipation.findUnique({
            where: {
                gameSessionId_playerId: {
                    gameSessionId: sessionId,
                    playerId: playerId,
                },
            },
            include: {
                gameSession: { // Inkluder gameSession for å sjekke status senere
                    select: { status: true }
                }
            }
        });

        if (!participation) {
             console.warn(`Participation not found for player ${playerId} in session ${sessionId}.`);
             // Returner 404 for å ikke lekke info om sesjonen finnes
             return NextResponse.json({ error: "Deltakelse ikke funnet." }, { status: 404 });
        }

        // Returner tidlig hvis spiller allerede er klar, uten å gjøre en unødig databaseoppdatering
        if (participation.isReady) {
            // Hent fersk data for å returnere korrekt status
            const currentSessionData = await prisma.tournamentGameSession.findUnique({
                where: { id: sessionId },
                include: { _count: { select: { participants: true } }, participants: { where: { isReady: true }, select: { id: true } } }
            });
             if (!currentSessionData) return NextResponse.json({ error: "Runde ikke funnet." }, { status: 404 });
             const readyCount = currentSessionData.participants.length;
             const totalParticipants = currentSessionData._count.participants;
             const allReady = totalParticipants > 0 && readyCount === totalParticipants;
             // Hvis spillet allerede er i gang, informer om det
             const gameAlreadyStarted = participation.gameSession.status === 'inProgress';

             return NextResponse.json({
                 success: true,
                 message: "Spiller var allerede klar.",
                 gameStarted: gameAlreadyStarted || allReady, // Returner true hvis det _nå_ starter, eller allerede var startet
                 readyCount,
                 totalParticipants
             });
        }


        // 1. Oppdater spillerens status til klar
        await prisma.tournamentGameParticipation.update({
            where: {
                 id: participation.id // Bruk unik ID for deltakelse
            },
            data: { isReady: true },
        });

        // 2. Hent oppdatert sesjonsdata for å sjekke om *alle* er klare nå
        // Bruker _count for effektivitet
        const updatedSessionData = await prisma.tournamentGameSession.findUnique({
            where: { id: sessionId },
            include: {
                _count: {
                     select: { participants: true } // Total count
                },
                participants: { // Kun de som er klare
                     where: { isReady: true },
                     select: { id: true } // Trenger bare ID for telling
                }
            },
        });

        // Dobbeltsjekk at sesjonen finnes (bør finnes siden vi fant participation)
        if (!updatedSessionData) {
            console.error(`Session ${sessionId} not found after updating participation ${participation.id}.`);
            return NextResponse.json({ error: "Runde ikke funnet etter oppdatering." }, { status: 404 });
        }

        const readyCount = updatedSessionData.participants.length;
        const totalParticipants = updatedSessionData._count.participants;
        const allReady = totalParticipants > 0 && readyCount === totalParticipants;

        let gameStarted = false;
        // Start spillet KUN hvis alle er klare NÅ og status er 'waiting'
        if (allReady && participation.gameSession.status === 'waiting') {
            await prisma.tournamentGameSession.update({
                where: { id: sessionId },
                data: { status: "inProgress" },
            });
            gameStarted = true;
            console.log(`Turneringsrunde ${sessionId} startet! ${readyCount}/${totalParticipants} klare.`);
        } else if (participation.gameSession.status === 'inProgress') {
             // Hvis spillet allerede var i gang, sett gameStarted til true
             gameStarted = true;
        }

        console.log(`Player ${playerId} marked ready for session ${sessionId}. Status: ${readyCount}/${totalParticipants} ready. Game started: ${gameStarted}`);

        return NextResponse.json({
            success: true,
            gameStarted: gameStarted,
            readyCount,
            totalParticipants
        });

    } catch (error) {
        console.error(`Error in /api/tournament-sessions/${sessionId}/ready:`, error);
        return NextResponse.json(
            { error: "En intern feil oppstod ved oppdatering av klar-status." },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}