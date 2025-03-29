import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    // Vent på at params blir løst
    const { gameId } = await params;
    const { holeNumber, strokes, obCount, userId, playerName } = await request.json();

    // Hent spilleren fra game hvis ikke gitt
    let effectivePlayerName = playerName;
    if (!playerName) {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        select: { ownerName: true }
      });
      effectivePlayerName = game?.ownerName || "Gjest";
    }

    // Slett eksisterende score
    await prisma.gameScore.deleteMany({
      where: {
        gameId,
        holeNumber,
        userId: userId || undefined
      }
    });

    // Opprett ny score
    const score = await prisma.gameScore.create({
      data: {
        gameId,
        holeNumber,
        strokes,
        obCount,
        userId: userId || null,
        playerName: effectivePlayerName
      }
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error("Feil ved lagring av score:", error);
    return NextResponse.json(
      { error: "Kunne ikke lagre score" },
      { status: 500 }
    );
  }
}