// Fil: app/api/tournaments/create/route.ts
// Formål: API-endepunkt (POST) for å opprette en ny turnering.
//         Tar imot nødvendige data (navn, sted, dato, bane-ID, arrangør-ID etc.),
//         validerer input og oppretter en ny turneringsoppføring i databasen med status 'PLANNING'.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      location, 
      description, 
      startDate, 
      endDate, 
      maxParticipants,
      courseId,
      organizerId,
      clubId
    } = body;

    // Valider påkrevde felter
    if (!name || !location || !startDate || !courseId || !organizerId) {
      return NextResponse.json(
        { error: "Mangler obligatoriske felter" },
        { status: 400 }
      );
    }

    const newTournament = await prisma.tournament.create({
      data: {
        name,
        location,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        courseId,
        organizerId,
        clubId,
        status: "PLANNING" // Standard status
      },
    });

    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error("Feil ved oppretting av turnering:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette turnering" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}