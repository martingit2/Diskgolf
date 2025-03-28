import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { roomId, password, userId, playerName } = await req.json();

    // Valider at roomId og playerName er sendt med
    if (!roomId || !playerName) {
      return NextResponse.json(
        { error: "Mangler rom-ID eller spillernavn" },
        { status: 400 }
      );
    }

    // Hent rommet med eksisterende deltakere (bruker 'participants' slik det er definert i schema)
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Rom ikke funnet" }, { status: 404 });
    }

    // Sjekk passord dersom rommet er passordbeskyttet (bruker passwordHash)
    if (room.passwordHash) {
      if (!password) {
        return NextResponse.json({ error: "Passord kreves" }, { status: 401 });
      }
      const passwordMatch = await bcrypt.compare(password, room.passwordHash);
      if (!passwordMatch) {
        return NextResponse.json({ error: "Feil passord" }, { status: 401 });
      }
    }

    // Sjekk om rommet er fullt
    if (room.participants.length >= room.maxPlayers) {
      return NextResponse.json({ error: "Rommet er fullt" }, { status: 400 });
    }

    // Opprett en ny deltaker i rommet ved å bruke modellen GameParticipation
    const participation = await prisma.gameParticipation.create({
      data: {
        roomId: room.id,
        userId: userId || null, // Kan være null for gjester
        playerName,
      },
    });

    return NextResponse.json(
      { success: true, participation },
      { status: 200 }
    );
  } catch (error) {
    console.error("Feil ved join room:", error);
    return NextResponse.json(
      { error: "Kunne ikke bli med i rommet" },
      { status: 500 }
    );
  }
}
