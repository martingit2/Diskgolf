/*
* Utvikler: Martin Pettersen, Said Hussain Khawajazada
 */







import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Haversine-formel for å beregne avstand mellom to geografiske punkter
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Jordens radius i kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Avstand i meter
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vent på at params blir løst
  const { id } = await params;
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        start: true,
        goal: true,
        baskets: true,
        obZones: true,
        reviews: { select: { rating: true } },
        club: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Bane ikke funnet" }, { status: 404 });
    }

    // Beregn totalDistance
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
        const b1 = course.baskets[i];
        const b2 = course.baskets[i + 1];
        totalDistance += calculateDistance(
          b1.latitude,
          b1.longitude,
          b2.latitude,
          b2.longitude
        );
      }
    }

    // Beregn rating
    const totalReviews = course.reviews.length;
    const averageRating =
      totalReviews > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const computedCourse = {
      ...course,
      totalDistance,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      numHoles: course.baskets.length,
    };

    return NextResponse.json(computedCourse, { status: 200 });
  } catch (error) {
    console.error("Feil ved henting av bane:", error);
    return NextResponse.json({ error: "Kunne ikke hente bane" }, { status: 500 });
  }
}
