import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    
    const tournaments = await prisma.tournament.findMany({
      where: {
        startDate: {
          gte: now, // Bare fremtidige turneringer
        },
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            location: true,
            image: true,
          },
        },
        organizer: {
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
        startDate: 'asc', // Sorter etter nærmeste dato
      },
      take: 5, // Begrens antall
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