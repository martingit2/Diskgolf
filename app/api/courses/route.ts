import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// ✅ Henter alle baner inkludert start, mål, kurver og anmeldelser
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        holes: true, // ✅ Henter alle kurver (baskets)
        reviews: {
          select: { rating: true },
        },
      },
    });

    // ✅ Beregn gjennomsnittlig vurdering og antall anmeldelser
    const coursesWithRatings = courses.map(course => {
      const totalReviews = course.reviews.length;
      const averageRating =
        totalReviews > 0
          ? course.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / totalReviews
          : 0;

      return {
        ...course,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
      };
    });

    return NextResponse.json(coursesWithRatings);
  } catch (error) {
    console.error("Feil ved henting av baner:", error);
    return NextResponse.json({ error: "Kunne ikke hente baner" }, { status: 500 });
  }
}

// ✅ Lagrer en ny bane med startposisjon, kurver og sluttmål
export async function POST(req: Request) {
  try {
    const { 
      name, 
      location, 
      latitude, 
      longitude, 
      description, 
      par, 
      image, 
      difficulty, 
      startLatitude, 
      startLongitude, 
      goalLatitude, 
      goalLongitude, 
      holes 
    } = await req.json();

    if (!name || !location || !latitude || !longitude) {
      return NextResponse.json({ error: "Manglende data" }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        name,
        location,
        latitude,
        longitude,
        startLatitude: startLatitude || null, 
        startLongitude: startLongitude || null,
        goalLatitude: goalLatitude || null, 
        goalLongitude: goalLongitude || null,
        description: description || null, // ✅ Sikrer at den ikke er undefined
        par: par ?? 3, // ✅ Standardverdi 3 hvis tomt
        image: image || "", // ✅ Unngår null-feil
        difficulty: difficulty || null,
        ...(holes?.length
          ? {
              holes: {
                create: holes.map((hole: { latitude: number; longitude: number; number: number; par: number }) => ({
                  latitude: hole.latitude,
                  longitude: hole.longitude,
                  number: hole.number,
                  par: hole.par,
                })),
              },
            }
          : {}), // ✅ Ikke legg til `holes` hvis ingen kurver er valgt
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Feil ved lagring av bane:", error);
    return NextResponse.json({ error: "Kunne ikke lagre bane" }, { status: 500 });
  }
}
