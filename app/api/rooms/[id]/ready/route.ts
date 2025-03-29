import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { playerId } = await req.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "Manglende spiller-ID" },
        { status: 400 }
      );
    }

    // Oppdater klar-status for deltakeren
    await prisma.gameParticipation.updateMany({
      where: {
        roomId,
        userId: playerId,
      },
      data: {
        isReady: true,
      },
    });

    // Hent rommet med alle nødvendige relasjoner
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { 
        participants: true,
        course: {
          include: {
            holes: true,
            baskets: true,
            start: true,
            goal: true
          }
        },
        game: true
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Rom ikke funnet" },
        { status: 404 }
      );
    }

    // Sjekk om alle er klare
    if (room.participants.every(p => p.isReady)) {
      // Oppdater romstatus
      await prisma.room.update({
        where: { id: roomId },
        data: { status: "inProgress" },
      });

      // Bestem hull basert på banens data (samme logikk som singleplayer)
      const holes = room.course.holes?.length > 0
        ? room.course.holes
        : room.course.baskets?.map((_, index) => ({
            number: index + 1,
            par: room.course.par || 3
          })) || Array.from({ length: 18 }, (_, i) => ({
            number: i + 1,
            par: room.course.par || 3
          }));

      // Opprett gameScore for alle deltakere for hvert hull
      for (const participant of room.participants) {
        for (const hole of holes) {
          await prisma.gameScore.create({
            data: {
              gameId: room.game?.id || roomId, // Bruk game.id hvis det finnes
              userId: participant.userId,
              holeNumber: hole.number,
              strokes: 0,
              obCount: 0,
              playerName: participant.playerName, // Legger til playerName
            },
          });
        }
      }

      return NextResponse.json({ 
        success: true,
        numHoles: holes.length,
        gameId: room.game?.id || roomId
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feil ved oppdatering av klar-status:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere klar-status" },
      { status: 500 }
    );
  }
}