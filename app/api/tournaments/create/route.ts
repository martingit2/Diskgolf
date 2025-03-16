// app/api/tournaments/create/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, location, description, dateTime, maxParticipants } = body;

    const newTournament = await prisma.tournament.create({
      data: {
        name,
        location,
        description,
        dateTime: new Date(dateTime),
        maxParticipants,
        type: "USER", // Alle turneringer er nå brukerturneringer
      },
    });

    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error("Feil ved oppretting av turnering:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette turnering" },
      { status: 500 }
    );
  }
}