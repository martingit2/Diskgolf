import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RequestBody {
  playerId?: string;
  playerName?: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const { playerId, playerName }: RequestBody = await req.json();

    console.log('Marking player as ready:', { roomId, playerId, playerName });

    if ((!playerId && !playerName) || !roomId) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: "Mangler påkrevde felt" },
        { status: 400 }
      );
    }

    // Oppdater kun den spesifikke spilleren
    const updateWhere = {
      roomId,
      ...(playerId ? { userId: playerId } : { playerName })
    };

    const updateResult = await prisma.gameParticipation.updateMany({
      where: updateWhere,
      data: { isReady: true },
    });

    console.log('Update result:', updateResult);

    if (updateResult.count === 0) {
      console.error('No matching participant found');
      return NextResponse.json(
        { error: "Fant ingen deltaker å oppdatere" },
        { status: 404 }
      );
    }

    // Hent oppdatert romdata
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { 
        participants: true,
        game: true
      },
    });

    if (!room) {
      console.error('Room not found');
      return NextResponse.json(
        { error: "Rom ikke funnet" },
        { status: 404 }
      );
    }

    const readyCount = room.participants.filter(p => p.isReady).length;
    const allReady = readyCount === room.participants.length;

    console.log(`Ready status: ${readyCount}/${room.participants.length} ready`);

    if (allReady && room.game) {
      console.log('All players ready, starting game...');
      await prisma.room.update({
        where: { id: roomId },
        data: { status: "inProgress" },
      });
    }

    return NextResponse.json({ 
      success: true,
      gameStarted: allReady,
      readyCount,
      totalParticipants: room.participants.length
    });
  } catch (error) {
    console.error("Error in ready endpoint:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere klar-status" },
      { status: 500 }
    );
  }
}