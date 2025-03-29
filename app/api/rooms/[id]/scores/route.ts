// /api/rooms/[id]/scores/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { holeNumber, strokes, obCount, userId, playerName } = await request.json();

    // Hent rommet for å finne tilhørende gameId
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { game: true },
    });
    if (!room || !room.game) {
      return NextResponse.json({ error: "Spillet er ikke startet" }, { status: 404 });
    }
    const gameId = room.game.id;

    // Bruk upsert med den sammensatte unike constrainten "game_score_unique"
    const result = await prisma.gameScore.upsert({
      where: {
        game_score_unique: {
          gameId,
          holeNumber,
          userId, // nå forventer vi at userId er alltid satt (enten en reell id eller en generert gjeste-id)
          playerName,
        },
      },
      update: {
        strokes,
        obCount,
      },
      create: {
        gameId,
        holeNumber,
        strokes,
        obCount,
        userId,
        playerName,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Feil ved lagring av score:", error);
    return NextResponse.json(
      { error: "Kunne ikke lagre score" },
      { status: 500 }
    );
  }
}
