import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { tournamentId, userId } = await req.json();

    // Legg til brukeren som deltaker i turneringen
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
      include: {
        participants: true, // Include participants to return updated list
      },
    });

    return NextResponse.json(updatedTournament);
  } catch (error) {
    console.error("Error joining tournament:", error);
    return NextResponse.json({ error: "Failed to join tournament" }, { status: 500 });
  }
}
