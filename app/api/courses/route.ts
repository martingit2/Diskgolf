
/*
* Utvikler: Martin Pettersen
 */



import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

interface UploadApiResponse {
  secure_url: string;
}

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
  return R * c * 1000; // Returner avstand i meter (m)
}

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        start: true,
        goal: true,
        baskets: true,
        obZones: true, // Inkluder OB-soner
        reviews: { select: { rating: true } },
        club: true,
      },
    });

    const coursesWithRatingsAndDistance = courses.map(course => {
      const totalReviews = course.reviews.length;
      const averageRating = totalReviews > 0 
        ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

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
          return { type: "polygon", points: obZone.points }; // Polygon
        } else {
          return { type: "circle", latitude: obZone.latitude, longitude: obZone.longitude }; // Sirkel
        }
      });

      return {
        ...course,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
        totalDistance,
        obZones, // Legg til formaterte OB-soner
      };
    });

    return NextResponse.json(coursesWithRatingsAndDistance);
  } catch (error) {
    console.error("Feil ved henting av baner:", error);
    return NextResponse.json({ error: "Kunne ikke hente baner" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let name: string,
        location: string,
        latitude: number,
        longitude: number,
        description: string | null,
        par: number,
        difficulty: string,
        image: File | string | null,
        start: { lat: number; lng: number }[],
        goal: { lat: number; lng: number } | null,
        baskets: { latitude: number; longitude: number }[],
        obZones: { type: "circle" | "polygon", latitude?: number, longitude?: number, points?: number[][] }[],
        clubId: string | null;

    const contentType = req.headers.get("content-type");
    let imageUrl: string | null = null;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      // Hent bildet først
      image = formData.get("image") as File | null;
      if (image) {
        try {
          const buffer = await image.arrayBuffer();
          const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: 'discgolf/courses',
                upload_preset: 'discgolf_uploads'
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as UploadApiResponse);
              }
            ).end(Buffer.from(buffer));
          });
          imageUrl = result.secure_url;
        } catch (error) {
          console.error("Feil ved bildeopplasting:", error);
          return NextResponse.json({ error: "Kunne ikke laste opp bildet" }, { status: 500 });
        }
      }
      // Hent de øvrige feltene fra formData
      name = formData.get("name") as string;
      location = formData.get("location") as string;
      latitude = parseFloat(formData.get("latitude") as string);
      longitude = parseFloat(formData.get("longitude") as string);
      description = formData.get("description") as string | null;
      par = parseInt(formData.get("par") as string, 10);
      difficulty = formData.get("difficulty") as string;
      start = JSON.parse(formData.get("start") as string);
      goal = JSON.parse(formData.get("goal") as string);
      baskets = JSON.parse(formData.get("baskets") as string);
      obZones = JSON.parse(formData.get("obZones") as string);
      clubId = formData.get("clubId") as string | null;
    } else if (contentType?.includes("application/json")) {
      const body = await req.json();
      // Hent data fra JSON-body
      name = body.name;
      location = body.location;
      latitude = body.latitude;
      longitude = body.longitude;
      description = body.description || null;
      par = body.par || 3;
      difficulty = body.difficulty || "Ukjent";
      image = body.image || null; // Her er 'image' allerede en secure_url (streng)
      imageUrl = typeof image === "string" ? image : null;
      start = body.start || [];
      goal = body.goal || null;
      baskets = body.baskets || [];
      obZones = body.obZones || [];
      clubId = body.clubId || null;
    } else {
      return NextResponse.json({ error: "Ugyldig forespørselstype" }, { status: 400 });
    }

    // Validering av påkrevde felt
    if (!name || !location || isNaN(latitude) || isNaN(longitude) || isNaN(par) || !difficulty) {
      return NextResponse.json({ error: "Manglende data" }, { status: 400 });
    }

    // Opprett kurs i databasen
    const newCourse = await prisma.course.create({
      data: {
        name,
        location,
        latitude,
        longitude,
        description,
        par,
        difficulty,
        image: imageUrl, // Setter URL-en fra Cloudinary (eller den sendte strengen i JSON)
        start: {
          create: start.map((point: any) => ({
            latitude: point.lat,
            longitude: point.lng,
          })),
        },
        goal: goal
          ? {
              create: {
                latitude: goal.lat,
                longitude: goal.lng,
              },
            }
          : undefined,
        baskets: {
          create: baskets.map((basket: any) => ({
            latitude: basket.latitude,
            longitude: basket.longitude,
          })),
        },
        obZones: {
          create: obZones.map((ob: any) => ({
            latitude: ob.type === "circle" ? ob.latitude : null,
            longitude: ob.type === "circle" ? ob.longitude : null,
            points: ob.type === "polygon" ? ob.points : null,
          })),
        },
        clubId,
      },
    });
    
    console.log("Nytt kurs opprettet:", newCourse);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Feil ved lagring av kurs:", error);
    return NextResponse.json({ error: "Kunne ikke lagre kurs" }, { status: 500 });
  }
}

