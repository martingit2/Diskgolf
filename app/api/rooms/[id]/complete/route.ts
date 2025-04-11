// Fil: app/api/rooms/[id]/complete/route.ts
// Formål: API-endepunkt (POST) for å markere et flerspillerrom (og det tilknyttede spillet) som fullført.
//         Setter rommets status til "completed" og både rommet og spillet til inaktivt.
// Utvikler: Martin Pettersen



import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vent på at params blir løst
    const { id: roomId } = await params;

    // Oppdater romstatus og deaktiver rommet
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { 
        status: "completed",
        isActive: false
      },
      include: {
        game: true
      }
    });

    // Oppdater også tilhørende spill hvis det finnes
    if (updatedRoom.gameId) {
      await prisma.game.update({
        where: { id: updatedRoom.gameId },
        data: {
          isActive: false
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feil ved fullføring av spill:", error);
    return NextResponse.json(
      { error: "Kunne ikke fullføre spill" },
      { status: 500 }
    );
  }
}