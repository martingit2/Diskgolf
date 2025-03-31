import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params; // Unwrap the Promise

    const standings = await prisma.tournamentScore.findMany({
      where: { tournamentId },
      include: {
        player: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        totalScore: "asc" // Lavest score først (beste i disc golf)
      }
    });

    const formattedStandings = standings.map(score => ({
      playerId: score.player.id,
      playerName: score.player.name,
      totalScore: score.totalScore,
      strokes: score.strokes
    }));

    return NextResponse.json(formattedStandings);
  } catch (error) {
    console.error("Feil ved henting av resultater:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente resultater" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}