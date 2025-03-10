import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { currentRole } from "@/app/lib/auth";

const prisma = new PrismaClient();

// ✅ Håndter POST-forespørsel (Legg til en ny bane)
export async function POST(req: NextRequest) {
  const role = await currentRole();

  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Ingen tilgang til denne serverhandlingen!" }, { status: 403 });
  }

  try {
    const body = await req.json();
    console.log("Mottatt data fra frontend:", body);

    if (!body || !body.name || !body.coords || typeof body.coords.lat !== "number" || typeof body.coords.lng !== "number") {
      console.error("Feil: Mangler data i request body!", body);
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Opprett kurs med relasjoner
    const newCourse = await prisma.course.create({
      data: {
        name: body.name,
        location: body.location,
        latitude: body.coords.lat, // Bruk riktig feltnavn
        longitude: body.coords.lng,
        description: body.description || "Ingen beskrivelse",
        par: body.par || 3, // Standard par
        difficulty: body.difficulty || "Ukjent",
        image: body.image || "",

        // Legg til start, mål, kurv og OB-områder
        start: {
          create: body.start.map((startPoint: { lat: number; lng: number }) => ({
            latitude: startPoint.lat,
            longitude: startPoint.lng
          }))
        },
        goal: {
          create: { latitude: body.goal.lat, longitude: body.goal.lng }
        },
        baskets: {
          create: body.baskets.map((basket: { lat: number, lng: number }) => ({
            latitude: basket.lat,
            longitude: basket.lng
          }))
        },
        obZones: {
          create: body.obZones.map((ob: { lat: number, lng: number }) => ({
            latitude: ob.lat,
            longitude: ob.lng
          }))
        }
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
