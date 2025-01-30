import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient(); // ✅ Initialize Prisma

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
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Feil ved henting av courses:", error);
    return NextResponse.json({ error: "Kunne ikke hente courses" }, { status: 500 });
  }
}
