import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vent på at params-resolusjonen kommer fram
  const { id } = await params;

  try {
    // Hent klubben med relatert informasjon
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        courses: true, // Inkluder alle baner tilknyttet klubben
        memberships: true, // Inkluder medlemskap
        clubNews: true, // Inkluder klubbenyheter
        admins: true, // Inkluder administratorer
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Klubb ikke funnet" }, { status: 404 });
    }

    // Beregn antall medlemmer
    const totalMembers = club.memberships.length;

    // Beregn gjennomsnittlig rating for klubben basert på tilknyttede baner
    let totalRating = 0;
    let totalReviews = 0;

    for (const course of club.courses) {
      const courseReviews = await prisma.review.findMany({
        where: { courseId: course.id },
        select: { rating: true },
      });

      totalReviews += courseReviews.length;
      totalRating += courseReviews.reduce((sum, review) => sum + review.rating, 0);
    }

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    // Bygg responsen med ekstra beregnet informasjon
    const computedClub = {
      ...club,
      totalMembers,
      averageRating: parseFloat(averageRating.toFixed(1)), // Rund av til én desimal
      totalReviews,
    };

    return NextResponse.json(computedClub, { status: 200 });
  } catch (error) {
    console.error("Feil ved henting av klubb:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente klubb" },
      { status: 500 }
    );
  }
}
