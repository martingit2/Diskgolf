import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { tournamentId, playerId } = await request.json();

    // Sjekk om turnering finnes og er åpen for påmelding
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

    // Sjekk om bruker allerede er påmeldt
    const isAlreadyRegistered = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        participants: {
          some: { id: playerId }
        }
      }
    });

    if (isAlreadyRegistered) {
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
          connect: { id: playerId }
        }
      },
      include: {
        course: true,
        organizer: true,
        participants: true,
        _count: true
      }
    });

    return NextResponse.json(updatedTournament);
  } catch (error) {
    console.error("Feil ved påmelding:", error);
    return NextResponse.json(
      { error: "Kunne ikke fullføre påmelding" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}