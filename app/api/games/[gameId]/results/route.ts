import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    // Vent på at params blir løst
    const { gameId } = await params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        course: {
          include: {
            holes: { orderBy: { number: "asc" } },
          },
        },
        scores: {
          orderBy: { holeNumber: "asc" },
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Spill ikke funnet" }, { status: 404 });
    }

    const holePars = game.course.holes.reduce((acc, hole) => {
      acc[hole.number] = hole.par;
      return acc;
    }, {} as Record<number, number>);

    return NextResponse.json({
      courseName: game.course.name,
      playerName: game.scores[0]?.user?.name || game.ownerName || "Ukjent",
      scores: game.scores.map((score) => ({
        holeNumber: score.holeNumber,
        par: holePars[score.holeNumber] || game.course.par || 3,
        throws: score.strokes,
        ob: score.obCount,
      })),
    });
  } catch (error) {
    console.error("Feil ved henting av resultater:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente resultater" },
      { status: 500 }
    );
  }
}