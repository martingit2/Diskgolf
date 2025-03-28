import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    // Vent på at params blir løst
    const { gameId } = await params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        course: {
          include: {
            holes: true,
            baskets: true,
            start: true,
            goal: true
          }
        },
        scores: true
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: "Spill ikke funnet" }, 
        { status: 404 }
      );
    }

    // Beregn total avstand
    let totalDistance = 0;
    if (game.course.start.length > 0 && game.course.goal) {
      const startPoint = game.course.start[0];
      totalDistance = calculateDistance(
        startPoint.latitude,
        startPoint.longitude,
        game.course.goal.latitude,
        game.course.goal.longitude
      );
    }

    return NextResponse.json({
      ...game,
      course: {
        ...game.course,
        totalDistance
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = "Kunne ikke hente spill";
    let errorDetails = null;

    if (error instanceof Error) {
      errorDetails = error.message;
    }

    console.error("Databasefeil:", error);
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails 
      },
      { status: 500 }
    );
  }
}

// Haversine-formel
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
}