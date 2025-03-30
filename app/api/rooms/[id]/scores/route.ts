import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    
    // Hent rom og tilhørende spill
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { 
        game: {
          include: {
            scores: true,
            participants: true
          }
        }
      }
    });

    if (!room || !room.game) {
      return NextResponse.json(
        { error: "Rom eller spill ikke funnet" },
        { status: 404 }
      );
    }

    // Hent alle scores for dette rommet
    const scores = await prisma.gameScore.findMany({
      where: { 
        gameId: room.game.id
      },
      orderBy: { holeNumber: 'asc' }
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Feil ved henting av scores:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente scores" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { holeNumber, strokes, obCount, userId, playerName } = await request.json();

    console.log('Received score data:', {
      roomId,
      holeNumber,
      strokes,
      obCount,
      userId,
      playerName
    });

    // Hent rommet for å finne tilhørende gameId
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { game: true },
    });
    
    if (!room || !room.game) {
      console.error('Room or game not found');
      return NextResponse.json(
        { error: "Spillet er ikke startet" },
        { status: 404 }
      );
    }
    const gameId = room.game.id;

    // Bruk upsert for å oppdatere eller opprette ny score
    const result = await prisma.gameScore.upsert({
      where: {
        game_score_unique: {
          gameId,
          holeNumber,
          userId: userId || null,
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
        userId: userId || null,
        playerName,
      },
    });

    console.log('Score saved:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Feil ved lagring av score:", error);
    return NextResponse.json(
      { error: "Kunne ikke lagre score" },
      { status: 500 }
    );
  }
}