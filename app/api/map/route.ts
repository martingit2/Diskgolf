import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { currentRole } from "@/app/lib/auth";


const prisma = new PrismaClient();

// ✅ Håndter GET-forespørsel (Hent alle baner)
export async function GET() {
  try {
    const courses = await prisma.course.findMany();
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

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

    const newCourse = await prisma.course.create({
      data: {
        name: body.name,
        latitude: body.coords.lat, // ✅ Bruk riktig feltnavn
        longitude: body.coords.lng,
        description: body.description || "Ingen beskrivelse",
        par: 3, // Standard par
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

// ❌ Håndterer alle andre metoder med en 405-feil
export async function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
