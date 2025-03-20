import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs"; // For å hashe passordet

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// GET-endepunkt for å hente alle aktive rom
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: {
        course: true, // Inkluder banedata
        participants: true, // Inkluder deltakere
      },
    });

    return NextResponse.json(rooms);
  } catch (error: any) {
    console.error("❌ Feil ved henting av rom:", error);
    return NextResponse.json({ error: `Kunne ikke hente rom: ${error.message}` }, { status: 500 });
  }
}

// POST-endepunkt for å opprette nye rom
export async function POST(req: Request) {
  try {
    const { name, password, courseId, ownerId, ownerName, maxPlayers } = await req.json();

    console.log("🔍 Mottatt fra frontend:", { name, password, courseId, ownerId, ownerName, maxPlayers });

    // Validering av påkrevde felt
    if (!name || !courseId || (maxPlayers > 1 && !password) || (!ownerId && !ownerName)) {
      console.error("❌ Feil: Mangler data", { name, password, courseId, ownerId, ownerName, maxPlayers });
      return NextResponse.json({
        error: `Mangler data - Mottatt: ${JSON.stringify({ name, password, courseId, ownerId, ownerName, maxPlayers })}`
      }, { status: 400 });
    }

    // Hash passordet før lagring (kun hvis det er et flerspillerrom)
    const passwordHash = maxPlayers > 1 ? await hash(password, 12) : null;

    // Sett expiresAt til 6 timer frem i tid
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);

    // Opprett nytt rom i databasen
    const newRoom = await prisma.room.create({
      data: {
        name,
        passwordHash, // Lagrer det hashede passordet (kan være null for solo-spill)
        courseId,
        ownerId: ownerId || null,
        ownerName: ownerName || name.split(" - ")[1] || "Gjest", // Bruk navnet fra romnavnet for solo-spill
        maxPlayers,
        isActive: true,
        expiresAt, // Tidsstempel for sletting
        participants: {
          create: {
            playerName: ownerName || name.split(" - ")[1] || "Gjest", // Legg til eieren som deltaker
          },
        },
      },
      include: {
        participants: true, // Inkluder deltakere i responsen
      },
    });

    console.log("✅ Rom opprettet:", newRoom);

    return NextResponse.json({ newRoom });
  } catch (error: any) {
    console.error("❌ Prisma-feil ved opprettelse av rom:", error);
    return NextResponse.json({ error: `Kunne ikke opprette rom: ${error.message}` }, { status: 500 });
  }
}