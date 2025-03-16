// app/api/tournaments/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 10; // Antall turneringer per side

  try {
    const tournaments = await prisma.tournament.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" }, // Sorter etter nyeste først
    });

    const totalTournaments = await prisma.tournament.count();
    const totalPages = Math.ceil(totalTournaments / limit);

    return NextResponse.json({
      tournaments,
      totalPages,
    });
  } catch (error) {
    console.error("Feil ved henting av turneringer:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente turneringer" },
      { status: 500 }
    );
  }
}