// /app/api/tournaments/status/route.ts
import { PrismaClient, TournamentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Bruker deres sti

const prisma = new PrismaClient();

export async function POST(request: Request) {
  // Hent session
  const session = await getServerSession(authOptions);

  // Sjekk om bruker er logget inn
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autentisering kreves." }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { tournamentId, status } = await request.json();

    if (!tournamentId || !status) {
      return NextResponse.json(
        { error: "Mangler tournamentId eller status" },
        { status: 400 }
      );
    }

    // Valider status
    if (!Object.values(TournamentStatus).includes(status as TournamentStatus)) {
       return NextResponse.json({ error: "Ugyldig statusverdi" }, { status: 400 });
    }

    // Finn turneringen og sjekk om brukeren er arrangør
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { organizerId: true }
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Turnering ikke funnet" },
        { status: 404 }
      );
    }

    // --- Autorisasjonssjekk ---
    if (tournament.organizerId !== userId) {
      return NextResponse.json({ error: "Handling forbudt: Kun arrangør kan endre status." }, { status: 403 });
    }

    // Oppdater status
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: status as TournamentStatus },
       // --- VIKTIG: Inkluder ALLE data som trengs for å re-rendre siden korrekt ---
       include: {
            // Sørg for at denne matcher 'include' i GET /api/tournaments/[id]
            course: {
                select: {
                    id: true,
                    name: true,
                    location: true,
                    image: true, // <-- Legg til denne
                    par: true,     // <-- Legg til denne
                    numHoles: true // <-- Legg til denne
                    // Inkluder 'baskets' hvis TournamentDetailsCard trenger det
                    // baskets: {select: {id: true}}
                }
            },
            organizer: { select: { id: true, name: true } },
            club: { select: { id: true, name: true } },
            participants: { select: { id: true, name: true } }, // Trengs for isParticipant og listen
            _count: { select: { participants: true } }, // Trengs for antall/maks
        },
    });

    return NextResponse.json(updatedTournament);

  } catch (error) {
    console.error("Feil ved oppdatering av status:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere turneringsstatus" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}