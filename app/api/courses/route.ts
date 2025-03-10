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

// ✅ Henter alle baner inkludert start, mål, kurver, anmeldelser og klubb
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        start: true, // Henter alle startpunkter (Tee)
        goal: true, // Henter målpunkt
        baskets: true, // Henter alle kurver
        obZones: true, // Henter alle OB-soner
        reviews: {
          select: { rating: true },
        },
        club: true, // Inkluder klubb-data
      },
    });

    console.log("Data hentet fra databasen:", courses); // Debugging: Logg data fra databasen

    const coursesWithRatingsAndDistance = courses.map(course => {
      const totalReviews = course.reviews.length;
      const averageRating =
        totalReviews > 0
          ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      // Beregn total avstand basert på start- og målpunkt ELLER kurvene
      let totalDistance = 0;

      // Hvis start- og målpunkt er definert, bruk disse til å beregne avstanden
      if (course.start.length > 0 && course.goal) {
        const startPoint = course.start[0]; // Første startpunkt (Tee)
        totalDistance = calculateDistance(startPoint.latitude, startPoint.longitude, course.goal.latitude, course.goal.longitude);
      } else if (course.baskets.length > 1) {
        // Hvis ikke, beregn avstanden mellom kurvene
        for (let i = 0; i < course.baskets.length - 1; i++) {
          const basket1 = course.baskets[i];
          const basket2 = course.baskets[i + 1];
          totalDistance += calculateDistance(basket1.latitude, basket1.longitude, basket2.latitude, basket2.longitude);
        }
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

// ✅ Lagrer en ny bane med startposisjon, kurver, sluttmål og klubb
export async function POST(req: Request) {
  try {
    let name: string, location: string, latitude: number, longitude: number, description: string | null, par: number, difficulty: string, image: File | null, start: { lat: number; lng: number }[], goal: { lat: number; lng: number }, baskets: { latitude: number; longitude: number }[], obZones: { lat: number; lng: number }[], clubId: string | null;

    const contentType = req.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Håndter FormData (fra AdminDashboard)
      const formData = await req.formData();

      name = formData.get("name") as string;
      location = formData.get("location") as string;
      latitude = parseFloat(formData.get("latitude") as string);
      longitude = parseFloat(formData.get("longitude") as string);
      description = formData.get("description") as string | null;
      par = parseInt(formData.get("par") as string, 10);
      difficulty = formData.get("difficulty") as string;
      image = formData.get("image") as File | null;
      start = JSON.parse(formData.get("start") as string); // Startpunkter (Tee)
      goal = JSON.parse(formData.get("goal") as string); // Målpunkt
      baskets = JSON.parse(formData.get("baskets") as string); // Kurver
      obZones = JSON.parse(formData.get("obZones") as string); // OB-soner
      clubId = formData.get("clubId") as string | null;

      console.log("FormData mottatt:", {
        name,
        location,
        latitude,
        longitude,
        description,
        par,
        difficulty,
        image,
        start,
        goal,
        baskets,
        obZones,
        clubId,
      });
    } else if (contentType?.includes("application/json")) {
      // Håndter JSON (fra kartet)
      const body = await req.json();

      name = body.name;
      location = body.location;
      latitude = body.coords.lat;
      longitude = body.coords.lng;
      description = body.description || null;
      par = body.par || 3;
      difficulty = body.difficulty || "Ukjent";
      image = null; // Kartet sender ikke bilder
      start = body.start || [];
      goal = body.goal || null;
      baskets = body.baskets || [];
      obZones = body.obZones || [];
      clubId = body.clubId || null;

      console.log("JSON-data mottatt:", {
        name,
        location,
        latitude,
        longitude,
        description,
        par,
        difficulty,
        image,
        start,
        goal,
        baskets,
        obZones,
        clubId,
      });
    } else {
      return NextResponse.json({ error: "Ugyldig forespørselstype" }, { status: 400 });
    }

    // Validering av data
    if (!name || !location || isNaN(latitude) || isNaN(longitude) || isNaN(par) || !difficulty) {
      console.error("Manglende data:", { name, location, latitude, longitude, par, difficulty });
      return NextResponse.json({ error: "Manglende data" }, { status: 400 });
    }

    // Lagre bilde hvis det finnes
    let imageUrl: string | null = null;
    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      const filePath = path.join(process.cwd(), "public/uploads", fileName);
      await writeFile(filePath, Buffer.from(await image.arrayBuffer()));
      imageUrl = `/uploads/${fileName}`;
    }

    // Opprett bane i databasen
    const newCourse = await prisma.course.create({
      data: {
        name,
        location,
        latitude,
        longitude,
        description,
        par,
        difficulty,
        image: imageUrl,
        start: {
          create: start.map((point: { lat: number; lng: number }) => ({
            latitude: point.lat,
            longitude: point.lng,
          })),
        },
        goal: {
          create: goal ? { latitude: goal.lat, longitude: goal.lng } : undefined,
        },
        baskets: {
          create: baskets.map((basket: { latitude: number; longitude: number }) => ({
            latitude: basket.latitude,
            longitude: basket.longitude,
          })),
        },
        obZones: {
          create: obZones.map((ob: { lat: number; lng: number }) => ({
            latitude: ob.lat,
            longitude: ob.lng,
          })),
        },
        clubId: clubId || null,
      },
    });

    console.log("Ny bane opprettet:", newCourse);

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Feil ved lagring av bane:", error);
    return NextResponse.json({ error: "Kunne ikke lagre bane" }, { status: 500 });
  }
}