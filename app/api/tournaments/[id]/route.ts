import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Unwrap the Promise
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Turnering ikke funnet" },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Feil ved henting av turnering:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente turnering" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Unwrap the Promise
    const body = await request.json();
    
    // Valider påkrevde felter
    if (!body.name || !body.startDate || !body.courseId) {
      return NextResponse.json(
        { error: "Mangler obligatoriske felter: name, startDate, courseId" },
        { status: 400 }
      );
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        location: body.location,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "PLANNING",
        maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants) : null,
        courseId: body.courseId,
        clubId: body.clubId || null,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTournament);
  } catch (error) {
    console.error("Feil ved oppdatering av turnering:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere turnering" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}