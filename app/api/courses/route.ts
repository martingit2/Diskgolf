import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        description: true,
        par: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        difficulty: true,
        // Fetch reviews and calculate average rating
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average rating and review count
    const coursesWithRatings = courses.map(course => {
      const totalReviews = course.reviews.length;
      const averageRating =
        totalReviews > 0
          ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      return {
        ...course,
        averageRating: parseFloat(averageRating.toFixed(1)), 
        totalReviews,
      };
    });

    return NextResponse.json(coursesWithRatings);
  } catch (error) {
    console.error("Feil ved henting av courses:", error);
    return NextResponse.json({ error: "Kunne ikke hente courses" }, { status: 500 });
  }
}
