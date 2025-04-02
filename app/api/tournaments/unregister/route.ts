// /app/api/tournaments/unregister/route.ts
import { PrismaClient, TournamentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Bruker deres sti

const prisma = new PrismaClient();

export async function POST(request: Request) {
    // Hent session
    const session = await getServerSession(authOptions);

    // Sjekk innlogging
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Du må være logget inn for å melde deg av." }, { status: 401 });
    }
    const loggedInUserId = session.user.id;

    try {
        const { tournamentId, playerId } = await request.json();

        // --- Valideringssjekk ---
        // Sjekk at brukeren som er logget inn er den samme som prøver å melde seg av
        if (loggedInUserId !== playerId) {
             console.warn(`Autentisert bruker (${loggedInUserId}) prøver å melde av annen bruker (${playerId})`);
             return NextResponse.json({ error: "Du kan kun melde av deg selv." }, { status: 403 });
        }

        if (!tournamentId || !playerId) {
             return NextResponse.json({ error: "Mangler tournamentId eller playerId" }, { status: 400 });
        }

        // Finn turneringen for å sjekke status og om brukeren er påmeldt
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: {
                status: true,
                participants: { // Trenger deltakerlisten for å sjekke om brukeren er påmeldt
                    where: { id: playerId },
                    select: { id: true }
                }
            }
        });

        if (!tournament) {
            return NextResponse.json(
                { error: "Turnering ikke funnet" },
                { status: 404 }
            );
        }

        // Tillat avmelding kun når påmelding er åpen (eller evt. 'PLANNING')
        // Man skal ikke kunne melde seg av en turnering som pågår eller er ferdig.
        if (tournament.status !== TournamentStatus.REGISTRATION_OPEN && tournament.status !== TournamentStatus.PLANNING) {
            return NextResponse.json(
                { error: "Avmelding er ikke mulig for denne turneringen (status: " + tournament.status + ")" },
                { status: 400 }
            );
        }

        // Sjekk om brukeren faktisk er påmeldt
        if (!tournament.participants || tournament.participants.length === 0) {
            return NextResponse.json(
                { error: "Du er ikke påmeldt denne turneringen." },
                { status: 400 } // Eller 404? 400 virker mer passende for en logisk feil.
            );
        }

        // Fjern brukeren som deltaker
        const updatedTournament = await prisma.tournament.update({
            where: { id: tournamentId },
            data: {
                participants: {
                    disconnect: { id: playerId } // Bruk disconnect for å fjerne relasjonen
                }
            },
            // Returner oppdatert data som frontend trenger
            include: {
                course: { select: { id: true, name: true, location: true, image: true, par: true, numHoles: true, baskets: {select: {id: true}} } }, // Inkluder detaljer for å oppdatere UI
                organizer: { select: { id: true, name: true } },
                club: { select: { id: true, name: true } },
                participants: { select: { id: true, name: true } }, // Viktig å få oppdatert deltakerliste
                _count: { select: { participants: true } }, // Og oppdatert antall
            }
        });

        return NextResponse.json(updatedTournament); // Returnerer oppdatert turneringsobjekt
    } catch (error) {
        console.error("Feil ved avmelding:", error);
        return NextResponse.json(
            { error: "Kunne ikke fullføre avmelding" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}