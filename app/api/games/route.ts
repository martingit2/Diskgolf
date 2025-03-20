import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs"; // For å hashe passordet

export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

// ✅ Opprett et nytt spill
export async function POST(req: Request) {
  try {
    const { courseId, password, ownerId, ownerName, maxPlayers, gameMode } = await req.json();

    // Validering av påkrevde felt
    if (!courseId || !gameMode) {
      return NextResponse.json(
        { error: "courseId og gameMode er påkrevd" },
        { status: 400 }
      );
    }

    // Hash passordet hvis det er oppgitt
    const passwordHash = password ? await hash(password, 12) : null;

    // Opprett nytt spill i databasen
    const newGame = await prisma.game.create({
      data: {
        courseId, // Påkrevd: Relasjon til Course
        course: { connect: { id: courseId } }, // Påkrevd: Relasjon til Course
        gameMode, // Påkrevd: "singleplayer" eller "multiplayer"
        password: passwordHash, // Valgfritt: Lagre det hashede passordet
        ownerId: ownerId || null, // Valgfritt: ID til eieren
        ownerName: ownerName || "Gjest", // Valgfritt: Navnet på eieren
        maxPlayers: gameMode === "multiplayer" ? maxPlayers : null, // Valgfritt: Bare for multiplayer
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // Påkrevd: Auto-slett etter 3 timer
        isActive: true, // Påkrevd: Aktiv status
      },
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error("Feil ved opprettelse av spill:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette spill" },
      { status: 500 }
    );
  }
}

// ✅ Hent aktive spill
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { expiresAt: { gte: new Date() } }, // Hent kun spill som ikke er utgått
      include: { course: true }, // Inkluder banedata
    });

    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error("Feil ved henting av spill:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente spill" },
      { status: 500 }
    );
  }
}