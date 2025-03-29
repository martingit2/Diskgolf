import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: {
        course: {
          include: {
            holes: true,
            baskets: true
          }
        },
        participants: true,
      },
    });

    // Beregn hull for hvert rom (ignorer goal)
    const roomsWithHoles = rooms.map(room => ({
      ...room,
      course: {
        ...room.course,
        totalHoles: room.course.holes?.length || room.course.baskets?.length || 0
      }
    }));

    return NextResponse.json(roomsWithHoles);
  } catch (error: any) {
    console.error("Feil ved henting av rom:", error);
    return NextResponse.json(
      { error: `Kunne ikke hente rom: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, password, courseId, ownerId, ownerName, maxPlayers } = await req.json();

    if (!name || !courseId || !ownerName || maxPlayers < 2 || maxPlayers > 20) {
      return NextResponse.json(
        { error: "Ugyldige data. Sjekk at alle felt er fylt ut og at antall spillere er mellom 2-20" },
        { status: 400 }
      );
    }

    const passwordHash = password ? await hash(password, 12) : null;
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);

    // Opprett rom OG tilhørende spill i transaksjon
    const newRoom = await prisma.$transaction(async (prisma) => {
      const game = await prisma.game.create({
        data: {
          courseId,
          gameMode: "multiplayer",
          ownerId: ownerId || null,
          ownerName,
          expiresAt,
          isActive: true,
          maxPlayers
        }
      });

      const room = await prisma.room.create({
        data: {
          name,
          passwordHash,
          courseId,
          ownerId: ownerId || null,
          ownerName,
          maxPlayers,
          isActive: true,
          expiresAt,
          gameId: game.id,
          participants: {
            create: {
              gameId: game.id,
              playerName: ownerName,
              userId: ownerId || null,
              isReady: false
            }
          }
        },
        include: {
          course: {
            include: {
              holes: true,
              baskets: true
            }
          },
          participants: true
        }
      });

      await prisma.game.update({
        where: { id: game.id },
        data: { roomId: room.id }
      });

      return room;
    });

    // Beregn totalt antall hull (ignorer goal)
    const totalHoles = newRoom.course.holes?.length || newRoom.course.baskets?.length || 0;

    return NextResponse.json({
      newRoom: {
        ...newRoom,
        course: {
          ...newRoom.course,
          totalHoles
        }
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Feil ved opprettelse av rom:", error);
    return NextResponse.json(
      { error: `Kunne ikke opprette rom: ${error.message}` },
      { status: 500 }
    );
  }
}