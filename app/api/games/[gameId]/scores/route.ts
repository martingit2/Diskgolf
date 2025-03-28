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
    const { holeNumber, strokes, obCount, userId } = await request.json();

    // Slett eksisterende score for dette hullet hvis den finnes
    await prisma.gameScore.deleteMany({
      where: {
        gameId: gameId,
        holeNumber,
        userId
      }
    });

    // Opprett ny score
    const score = await prisma.gameScore.create({
      data: {
        gameId: gameId,
        holeNumber,
        strokes,
        obCount,
        userId
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