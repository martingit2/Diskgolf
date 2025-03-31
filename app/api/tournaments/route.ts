import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Valider påkrevde felter
    if (!body.name || !body.startDate || !body.organizerId || !body.courseId) {
      return NextResponse.json(
        { error: "Mangler obligatoriske felter: name, startDate, organizerId, courseId" },
        { status: 400 }
      );
    }

    // Sjekk at banen eksisterer
    const courseExists = await prisma.course.findUnique({
      where: { id: body.courseId },
    });

    if (!courseExists) {
      return NextResponse.json(
        { error: "Valgt bane finnes ikke" },
        { status: 404 }
      );
    }

    // Opprett turneringen
    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        description: body.description || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: "PLANNING",
        organizer: {
          connect: { id: body.organizerId }
        },
        course: {
          connect: { id: body.courseId }
        },
        maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants) : null,
        location: courseExists.location || "Ukjent sted"
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
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error("Feil ved opprettelse av turnering:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette turnering" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    const tournaments = await prisma.tournament.findMany({
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
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error("Feil ved henting av turneringer:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente turneringer" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}