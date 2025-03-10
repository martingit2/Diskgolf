import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Haversine-formel for å beregne avstand mellom to geografiske punkter
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Jordens radius i kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180); // Endring i breddegrad
  const dLon = (lon2 - lon1) * (Math.PI / 180); // Endring i lengdegrad
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Avstanden i kilometer
  return distance * 1000; // Returner avstanden i meter
}

// ✅ Henter alle baner inkludert start, mål, kurver og anmeldelser
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        holes: true, // Henter alle kurver (baskets)
        reviews: {
          select: { rating: true },
        },
      },
    });

    const coursesWithRatingsAndDistance = courses.map(course => {
      const totalReviews = course.reviews.length;
      const averageRating =
        totalReviews > 0
          ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      // **Håndter nullverdier for start og sluttpunkter**
      let totalDistance = 0;

      if (course.startLatitude && course.startLongitude && course.goalLatitude && course.goalLongitude) {
        totalDistance = calculateDistance(course.startLatitude, course.startLongitude, course.goalLatitude, course.goalLongitude);
      }

      return {
        ...course,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
        totalDistance, // Legg til totalDistance
      };
    });

    return NextResponse.json(coursesWithRatingsAndDistance);
  } catch (error) {
    console.error("Feil ved henting av baner:", error);
    return NextResponse.json({ error: "Kunne ikke hente baner" }, { status: 500 });
  }
}

// ✅ Lagrer en ny bane med startposisjon, kurver og sluttmål
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const description = formData.get("description") as string | null;
    const par = parseInt(formData.get("par") as string, 10);
    let difficulty = formData.get("difficulty") as string;
    const image = formData.get("image") as File | null;
    const startLatitude = formData.get("startLatitude") ? parseFloat(formData.get("startLatitude") as string) : null;
    const startLongitude = formData.get("startLongitude") ? parseFloat(formData.get("startLongitude") as string) : null;
    const goalLatitude = formData.get("goalLatitude") ? parseFloat(formData.get("goalLatitude") as string) : null;
    const goalLongitude = formData.get("goalLongitude") ? parseFloat(formData.get("goalLongitude") as string) : null;
    const holes = formData.get("holes") ? JSON.parse(formData.get("holes") as string) : [];

    // ✅ Sikrer at `difficulty` er gyldig
    const validDifficulties = ["Lett", "Middels", "Vanskelig"];
    if (!validDifficulties.includes(difficulty)) {
      difficulty = "Ukjent"; // Setter standardverdi hvis ugyldig input
    }

    // ✅ Valider at essensielle felt er til stede
    if (!name || !location || isNaN(latitude) || isNaN(longitude) || isNaN(par) || !difficulty) {
      return NextResponse.json({ error: "Manglende data" }, { status: 400 });
    }

    // ✅ Sjekker om bilde eksisterer og lagrer riktig URL
    let imageUrl: string | null = null;
    if (image) {
      const filePath = path.join(process.cwd(), "public/uploads", image.name);
      await writeFile(filePath, Buffer.from(await image.arrayBuffer())); // Lagrer bildet på serveren
      imageUrl = `/uploads/${image.name}`; // Lager en offentlig URL til bildet
    }

    // ✅ Lagre til databasen
    const newCourse = await prisma.course.create({
      data: {
        name,
        location,
        latitude,
        longitude,
        startLatitude,
        startLongitude,
        goalLatitude,
        goalLongitude,
        description,
        par,
        difficulty,
        image: imageUrl,
        holes: {
          create: holes.map((hole: { latitude: number; longitude: number; number: number; par: number }) => ({
            latitude: hole.latitude,
            longitude: hole.longitude,
            number: hole.number,
            par: hole.par,
          })),
        },
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Feil ved lagring av bane:", error);
    return NextResponse.json({ error: "Kunne ikke lagre bane" }, { status: 500 });
  }
}
