import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { courseId, playerId, playerName } = await req.json();

    // Validering
    if (!courseId || !playerName) {
      return NextResponse.json(
        { error: "courseId og playerName er påkrevd" },
        { status: 400 }
      );
    }

    // Hent hele banen med alle relasjoner
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        holes: true,
        baskets: true,
        start: true,
        goal: true,
        obZones: true,
        club: true
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Bane ikke funnet" },
        { status: 404 }
      );
    }

    // Opprett nytt SOLO-spill
    const newGame = await prisma.game.create({
      data: {
        courseId,
        gameMode: "singleplayer",
        ownerId: playerId || null,
        ownerName: playerName,
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 timer
        isActive: true,
        maxPlayers: 1,
      }
    });

    // Opprett deltakelse
    await prisma.gameParticipation.create({
      data: {
        gameId: newGame.id,
        playerName,
        userId: playerId || null,
        isReady: true
      }
    });

    // Beregn total avstand (samme logikk som i courses/route.ts)
    let totalDistance = 0;
    if (course.start.length > 0 && course.goal) {
      const startPoint = course.start[0];
      totalDistance = calculateDistance(
        startPoint.latitude,
        startPoint.longitude,
        course.goal.latitude,
        course.goal.longitude
      );
    } else if (course.baskets.length > 1) {
      for (let i = 0; i < course.baskets.length - 1; i++) {
        const basket1 = course.baskets[i];
        const basket2 = course.baskets[i + 1];
        totalDistance += calculateDistance(
          basket1.latitude,
          basket1.longitude,
          basket2.latitude,
          basket2.longitude
        );
      }
    }

    // Formater OB-soner
    const obZones = course.obZones.map(obZone => {
      if (obZone.points) {
        return { type: "polygon", points: obZone.points };
      } else {
        return { type: "circle", latitude: obZone.latitude, longitude: obZone.longitude };
      }
    });

    // Returner alt vi trenger for spill-siden
    return NextResponse.json({ 
      gameId: newGame.id,
      course: {
        ...course,
        holes: course.holes,
        baskets: course.baskets,
        start: course.start,
        goal: course.goal,
        obZones,
        totalDistance,
        numHoles: course.holes.length || course.baskets.length
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Feil ved opprettelse av spill:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette spill" },
      { status: 500 }
    );
  }
}

// Haversine-formel (samme som i courses/route.ts)
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