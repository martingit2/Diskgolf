import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vent på at params blir løst
    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        participants: true,
        course: {
          include: {
            holes: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Rom ikke funnet" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Feil ved henting av rom:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente rom" },
      { status: 500 }
    );
  }
}