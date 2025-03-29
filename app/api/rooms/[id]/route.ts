import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vent på at params skal bli klar
  const { id } = await params;
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        participants: true,
        course: {
          include: {
            holes: {
              orderBy: { number: 'asc' }
            },
            baskets: true,
            start: true,
            goal: true,
            obZones: true
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: "Rom ikke funnet" }, { status: 404 });
    }

    // Beregn totalt antall hull
    const totalHoles = room.course.holes?.length || room.course.baskets?.length || 0;

    // Generer hull hvis de ikke finnes
    const holes = room.course.holes?.length > 0
      ? room.course.holes
      : Array.from({ length: totalHoles }, (_, i) => ({
          number: i + 1,
          par: room.course.par || 3,
          distance: 0
        }));

    // Beregn total avstand
    let totalDistance = 0;
    if (room.course.start.length > 0 && room.course.goal) {
      const startPoint = room.course.start[0];
      totalDistance = calculateDistance(
        startPoint.latitude,
        startPoint.longitude,
        room.course.goal.latitude,
        room.course.goal.longitude
      );
    }

    return NextResponse.json({
      ...room,
      course: {
        ...room.course,
        holes,
        totalHoles,
        totalDistance,
        obZones: room.course.obZones.map(zone => ({
          type: zone.points ? "polygon" : "circle",
          ...(zone.points ? { points: zone.points } : { latitude: zone.latitude, longitude: zone.longitude })
        }))
      }
    });
  } catch (error) {
    console.error("Feil ved henting av rom:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente rom" },
      { status: 500 }
    );
  }
}

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
