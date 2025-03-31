// app/api/tournaments/register/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Bruker deres sti

const prisma = new PrismaClient();

export async function POST(request: Request) {
    // Hent session
    const session = await getServerSession(authOptions);

    // Sjekk innlogging
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Du må være logget inn for å melde deg på." }, { status: 401 });
    }
    const loggedInUserId = session.user.id;

    try {
        const { tournamentId, playerId } = await request.json();

        // --- Valideringssjekk ---
        // Sjekk at brukeren som er logget inn er den samme som prøver å melde seg på
        if (loggedInUserId !== playerId) {
             console.warn(`Autentisert bruker (${loggedInUserId}) prøver å melde på annen bruker (${playerId})`);
             return NextResponse.json({ error: "Du kan kun melde på deg selv." }, { status: 403 });
        }

        if (!tournamentId || !playerId) {
             return NextResponse.json({ error: "Mangler tournamentId eller playerId" }, { status: 400 });
        }

        // Sjekk om turnering finnes, status, og om den er full
        const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
            _count: {
            select: { participants: true }
            }
        }
        });

        if (!tournament) {
        return NextResponse.json(
            { error: "Turnering ikke funnet" },
            { status: 404 }
        );
        }

        if (tournament.status !== "REGISTRATION_OPEN") {
        return NextResponse.json(
            { error: "Påmelding er ikke åpen for denne turneringen" },
            { status: 400 }
        );
        }

        if (tournament.maxParticipants &&
            tournament._count.participants >= tournament.maxParticipants) {
        return NextResponse.json(
            { error: "Turneringen er fullt påmeldt" },
            { status: 400 }
        );
        }

        // Sjekk om bruker allerede er påmeldt (redundant hvis knappen skjules i UI, men god sikkerhet)
        const isAlreadyRegistered = await prisma.tournament.findFirst({
        where: {
            id: tournamentId,
            participants: {
            some: { id: playerId }
            }
        }
        });

        if (isAlreadyRegistered) {
        // Kan returnere 200 OK eller 400 Bad Request. 400 er kanskje tydeligere.
        return NextResponse.json(
            { error: "Du er allerede påmeldt denne turneringen" },
            { status: 400 }
        );
        }

        // Legg til bruker som deltaker
        const updatedTournament = await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
            participants: {
            connect: { id: playerId } // Bruk ID fra request (som er validert mot session)
            }
        },
        // Returner oppdatert data som frontend trenger
        include: {
            course: { select: { id: true, name: true, location: true, image: true } },
            organizer: { select: { id: true, name: true } },
            club: { select: { id: true, name: true } },
            participants: { select: { id: true, name: true } },
            _count: { select: { participants: true } },
        }
        });

        return NextResponse.json(updatedTournament);
    } catch (error) {
        console.error("Feil ved påmelding:", error);
        // Sjekk for spesifikke Prisma-feil (f.eks. P2025 - record not found ved connect)
        return NextResponse.json(
        { error: "Kunne ikke fullføre påmelding" },
        { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}