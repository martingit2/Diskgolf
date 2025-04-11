// Fil: app/api/user-clubs/route.ts
// Formål: API-endepunkt for å håndtere en brukers klubbmedlemskap.
//         GET: Henter alle klubber en spesifikk bruker er medlem av, inkludert status om det er brukerens primærklubb.
//         POST: Setter eller fjerner en spesifikk klubb som brukerens primærklubb.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Hente alle klubbene brukeren er medlem av
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID er påkrevd" }, { status: 400 });
  }

  try {
    // Hent alle klubbene brukeren er medlem av via Membership-relasjonen
    const clubs = await prisma.club.findMany({
      where: {
        memberships: {
          some: {
            userId: userId, // Filtrerer klubbene brukeren er medlem av
          },
        },
      },
      select: {
        id: true,
        name: true,
        location: true,
        memberships: {
          where: {
            userId: userId, // Filtrerer medlemskapet for den aktuelle brukeren
          },
          select: {
            isPrimary: true, // Sjekk om klubben er primær for denne brukeren
          },
        },
      },
    });

    // Legg til isPrimary status for hver klubb
    const clubsWithPrimary = clubs.map((club) => ({
      ...club,
      isPrimary: club.memberships[0]?.isPrimary || false,
    }));

    return NextResponse.json({ clubs: clubsWithPrimary });
  } catch (error) {
    console.error("Feil ved henting av klubber:", error);
    return NextResponse.json({ error: "Kunne ikke hente klubber" }, { status: 500 });
  }
}

// Oppdatere primærklubbstatus
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const clubId = searchParams.get("clubId");
  const action = searchParams.get("action"); // "setPrimary" eller "removePrimary"

  if (!userId || !clubId || !action) {
    return NextResponse.json({ error: "User ID, Club ID og Action er påkrevd" }, { status: 400 });
  }

  try {
    if (action === "setPrimary") {
      // Sett klubben som primærklubb for brukeren
      await prisma.membership.updateMany({
        where: {
          userId: userId,
          clubId: clubId,
        },
        data: {
          isPrimary: true, // Sett isPrimary til true for denne klubben
        },
      });

      // Fjern primærklubbstatus for alle andre klubber
      await prisma.membership.updateMany({
        where: {
          userId: userId,
          clubId: { not: clubId },
        },
        data: {
          isPrimary: false, // Fjern primærklubbstatus for alle andre
        },
      });

      return NextResponse.json({ success: "Klubben er nå primærklubb!" }, { status: 200 });
    }

    if (action === "removePrimary") {
      // Fjern primærklubbstatus for den spesifikke klubben
      await prisma.membership.updateMany({
        where: {
          userId: userId,
          clubId: clubId,
        },
        data: {
          isPrimary: false, // Sett isPrimary til false
        },
      });

      return NextResponse.json({ success: "Primærklubbstatus fjernet!" }, { status: 200 });
    }

    return NextResponse.json({ error: "Ugyldig action" }, { status: 400 });
  } catch (error) {
    console.error("Feil ved oppdatering av primærklubb:", error);
    return NextResponse.json({ error: "Kunne ikke oppdatere primærklubb" }, { status: 500 });
  }
}
