import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST for oppretting av turnering
export async function POST(req: NextRequest) {
  try {
    const { name, type, participants } = await req.json();

    const newTournament = await prisma.tournament.create({
      data: {
        name,
        type,
        participants: {
          connect: participants.map((id: string) => ({ id })),
        },
      },
    });

    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
  }
}

// GET for å hente turneringer
export async function GET(req: NextRequest) {
  const page = new URL(req.url).searchParams.get("page") || "1"; // Default page 1
  const limit = 10; // Antall turneringer per side

  try {
    const tournaments = await prisma.tournament.findMany({
      skip: (parseInt(page) - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc", // Sorter etter opprettelsesdato
      },
    });

    const totalTournaments = await prisma.tournament.count();
    const totalPages = Math.ceil(totalTournaments / limit);

    return NextResponse.json({
      tournaments,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 });
  }
}
