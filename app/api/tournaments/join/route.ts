// Fil: app/api/tournaments/join/route.ts
// Formål: API-endepunkt (POST) for å la en bruker melde seg på en eksisterende turnering.
//         Kobler den angitte brukeren (userId) til den spesifiserte turneringens (tournamentId) deltakerliste.
// Utvikler: Martin Pettersen


import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { tournamentId, userId } = await request.json();

  try {
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
      include: {
        participants: true,
      },
    });

    return NextResponse.json(tournament, { status: 200 });
  } catch (error) {
    console.error("Feil ved påmelding til turnering:", error);
    return NextResponse.json(
      { error: "Kunne ikke melde på bruker til turnering" },
      { status: 500 }
    );
  }
}