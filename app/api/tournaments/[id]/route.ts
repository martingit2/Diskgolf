// app/api/tournaments/[id]/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vent på at `params`-objektet er klart
    const { id } = await params;

    // Sjekk at `id` er tilgjengelig
    if (!id) {
      return NextResponse.json(
        { error: "Turnering-ID mangler" },
        { status: 400 }
      );
    }

    // Hent turneringen med relatert informasjon
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: true, // Inkluder deltakere
        club: true, // Inkluder klubben som opprettet turneringen
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Turnering ikke funnet" },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament, { status: 200 });
  } catch (error) {
    console.error("Feil ved henting av turnering:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente turnering" },
      { status: 500 }
    );
  }
}