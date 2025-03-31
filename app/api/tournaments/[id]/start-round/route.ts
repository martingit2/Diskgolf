// app/api/tournaments/[id]/start-round/route.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

// Definer typen for gameSession for tydelighet
type GameSessionInfo = { id: string; status: string; roundNumber: number; };

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const awaitedParams = await params;
    const tournamentId = awaitedParams.id;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
    }
    const userId = session.user.id;

    if (!tournamentId) {
        return NextResponse.json( { error: "Mangler turnerings-ID." }, { status: 400 } );
    }

    const roundNumber = 1; // Hardkodet til runde 1

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                participants: { select: { id: true } },
                gameSessions: {
                     where: { roundNumber },
                     // --- KORREKSJON 1: Legg til roundNumber her ---
                     select: { id: true, status: true, roundNumber: true }
                }
            }
        });

        if (!tournament) { return NextResponse.json({ error: "Turnering ikke funnet." }, { status: 404 }); }
        if (tournament.organizerId !== userId) { return NextResponse.json({ error: "Kun arrangør kan starte runden." }, { status: 403 }); }
        if (tournament.status !== 'IN_PROGRESS') { return NextResponse.json({ error: `Turneringen er ikke startet (status: ${tournament.status}).` }, { status: 400 }); }
        if (tournament.participants.length < 1) { return NextResponse.json({ error: "Det må være minst én påmeldt deltaker." }, { status: 400 }); }

        // Bruker nå typen GameSessionInfo
        let existingSession: GameSessionInfo | undefined = tournament.gameSessions.find(gs => gs.roundNumber === roundNumber);
        let finalSessionId: string | null = existingSession?.id ?? null;


        if (!existingSession) {
             try {
                 const newSession = await prisma.tournamentGameSession.create({
                     data: {
                         tournamentId: tournamentId,
                         roundNumber: roundNumber,
                         status: 'waiting',
                         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                         participants: {
                             create: tournament.participants.map(participant => ({
                                 playerId: participant.id,
                                 isReady: false
                             }))
                         }
                     },
                     // --- KORREKSJON 1 (implisitt): Trenger ikke select her hvis vi tar ID nedenfor ---
                     // select: { id: true, status: true, roundNumber: true } // Velg det vi trenger
                 });
                 console.log(`Opprettet ny TournamentGameSession: ${newSession.id} for turnering ${tournamentId}, runde ${roundNumber}`);
                 finalSessionId = newSession.id; // Sett ID-en til den nyopprettede

             } catch (e) {
                  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                      console.warn(`Race condition? Unique constraint feilet ved forsøk på å opprette sesjon for turnering ${tournamentId}, runde ${roundNumber}. Forsøker å hente eksisterende.`);
                      // --- KORREKSJON 2: Håndter null og legg til roundNumber i select ---
                      const possiblyCreatedSession = await prisma.tournamentGameSession.findUnique({
                          where: { tournamentId_roundNumber: { tournamentId, roundNumber } },
                          select: { id: true, status: true, roundNumber: true } // Hent det vi trenger
                      });
                      // Hvis vi fant en sesjon nå, bruk dens ID. Ellers kast feilen videre.
                      if (possiblyCreatedSession) {
                           finalSessionId = possiblyCreatedSession.id;
                           existingSession = possiblyCreatedSession; // Oppdater existingSession også
                           console.log(`Fant sesjon ${finalSessionId} etter P2002 feil.`);
                      } else {
                           console.error("Kunne ikke finne sesjon etter P2002 feil.", e);
                           throw new Error("Klarte ikke opprette eller finne spillrunde etter konflikt."); // Kast en mer informativ feil
                      }
                  } else {
                      console.error("Uventet feil under opprettelse av sesjon:", e);
                      throw e; // Kast andre feil videre
                  }
             }
        } else {
             console.log(`Fant eksisterende TournamentGameSession: ${existingSession.id} med status ${existingSession.status} for turnering ${tournamentId}, runde ${roundNumber}`);
             // ID er allerede satt i finalSessionId via initialiseringen
        }

        // Sikre at vi har en ID før vi returnerer
        if (!finalSessionId) {
             console.error(`Klarte ikke bestemme sessionId for turnering ${tournamentId}, runde ${roundNumber}.`);
             throw new Error("Klarte ikke bestemme sessionId.");
        }

        return NextResponse.json({ sessionId: finalSessionId, message: "Turneringsrunde klar/funnet." });

    } catch (error) {
        console.error(`Feil i POST /api/tournaments/${tournamentId}/start-round:`, error);
        const errorMessage = error instanceof Error ? error.message : "En ukjent feil oppstod.";
        // Returner 500 for de fleste feil, men 409 spesifikt for kjente konflikter? (P2002 håndteres over nå)
        return NextResponse.json(
            { error: `Kunne ikke starte/finne runden: ${errorMessage}` },
            { status: 500 } // Generell serverfeil
        );
    } finally {
        await prisma.$disconnect();
    }
}