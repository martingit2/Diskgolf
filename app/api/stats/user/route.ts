import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = request.nextUrl.searchParams.get("userId");

  if (!session || !userId || session.user.id !== userId) {
    return NextResponse.json({ error: "Uautorisert" }, { status: 401 });
  }

  try {
    // Tell singleplayer-spill
    const singleplayerCount = await prisma.game.count({
      where: { ownerId: userId, gameMode: "singleplayer" },
    });

    // Tell multiplayer-spill (bruker er deltaker i rom)
    const multiplayerCount = await prisma.room.count({
      where: {
        participants: { some: { userId } },
      },
    });

    // Hent unike kurs brukt i singleplayer
    const singleplayerCourses = await prisma.game.findMany({
      where: { ownerId: userId, gameMode: "singleplayer" },
      select: { courseId: true },
      distinct: ["courseId"],
    });

    // Hent unike kurs brukt i multiplayer
    const multiplayerCourses = await prisma.room.findMany({
      where: {
        participants: { some: { userId } },
      },
      select: { courseId: true },
      distinct: ["courseId"],
    });

    const allCourses = [
      ...singleplayerCourses.map(c => c.courseId),
      ...multiplayerCourses.map(c => c.courseId),
    ];
    const uniqueCourseIds = Array.from(new Set(allCourses));

    const coursesPlayed = await prisma.course.findMany({
      where: { id: { in: uniqueCourseIds } },
      select: { id: true, name: true },
    });

    const result = {
      singleplayerCount,
      multiplayerCount,
      coursesPlayed,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Feil ved henting av brukerstatistikk:", error);
    return NextResponse.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}