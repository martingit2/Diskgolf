import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vent på at params blir løst
    const { id } = await params;
    const { playerId } = await req.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "Manglende spiller-ID" },
        { status: 400 }
      );
    }

    // Oppdater spillerens "isReady"-status
    await prisma.gameParticipation.updateMany({
      where: {
        roomId: id,
        userId: playerId,
      },
      data: {
        isReady: true,
      },
    });

    // Sjekk om alle deltakere er klare
    const room = await prisma.room.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (room) {
      const allReady = room.participants.every((p) => p.isReady);
      if (allReady) {
        await prisma.room.update({
          where: { id },
          data: { status: "inProgress" },
        });
      }
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