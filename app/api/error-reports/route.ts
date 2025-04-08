// app/api/error-reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole, ErrorReportStatus } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth"; // Importer auth-funksjonen din

const prisma = new PrismaClient();

// Zod schema for validering av innkommende rapportdata
const reportSchema = z.object({
  courseId: z.string().uuid("Ugyldig bane-ID"),
  description: z.string().min(10, "Beskrivelsen må være minst 10 tegn"),
});

// POST: Opprett en ny feilrapport
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autentisering kreves" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = reportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Ugyldig input", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { courseId, description } = validation.data;
    const userId = session.user.id;

    // Sjekk om banen finnes (valgfritt, men god praksis)
    const courseExists = await prisma.course.findUnique({ where: { id: courseId } });
    if (!courseExists) {
      return NextResponse.json({ error: "Bane ikke funnet" }, { status: 404 });
    }

    const newReport = await prisma.errorReport.create({
      data: {
        courseId,
        userId,
        description,
        status: ErrorReportStatus.OPEN, // Starter som OPEN
      },
    });

    return NextResponse.json(newReport, { status: 201 });

  } catch (error) {
    console.error("Feil ved opprettelse av feilrapport:", error);
    // Sjekk for spesifikke Prisma-feil om nødvendig
    return NextResponse.json({ error: "Kunne ikke opprette feilrapport" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


// GET: Hent feilrapporter basert på brukerrolle
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.role) {
    return NextResponse.json({ error: "Autentisering kreves" }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = session.user.role as UserRole; // Cast til UserRole

  try {
    let reports;

    // Admin ser alle rapporter
    if (userRole === UserRole.ADMIN) {
      reports = await prisma.errorReport.findMany({
        orderBy: { createdAt: 'desc' }, // Sorter etter nyeste først
        include: {
          course: { select: { id: true, name: true } }, // Inkluder banenavn
          user: { select: { id: true, name: true } }, // Inkluder brukernavn
        },
      });
    }
    // Club Leader ser rapporter for sine baner
    else if (userRole === UserRole.CLUB_LEADER) {
      // 1. Finn klubbene brukeren leder
      const clubsLed = await prisma.club.findMany({
        where: { admins: { some: { id: userId } } },
        select: { id: true },
      });
      const clubIdsLed = clubsLed.map(club => club.id);

      if (clubIdsLed.length === 0) {
        return NextResponse.json([], { status: 200 }); // Ingen klubber, ingen rapporter
      }

      // 2. Finn banene tilknyttet disse klubbene
      const coursesInClubs = await prisma.course.findMany({
        where: { clubId: { in: clubIdsLed } },
        select: { id: true },
      });
      const courseIdsInClubs = coursesInClubs.map(course => course.id);

      if (courseIdsInClubs.length === 0) {
          return NextResponse.json([], { status: 200 }); // Ingen baner, ingen rapporter
      }

      // 3. Hent rapporter for disse banene
      reports = await prisma.errorReport.findMany({
        where: {
          courseId: { in: courseIdsInClubs },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      });
    }
    // Vanlige brukere har ikke tilgang til denne listen (kan endres ved behov)
    else {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    return NextResponse.json(reports, { status: 200 });

  } catch (error) {
    console.error("Feil ved henting av feilrapporter:", error);
    return NextResponse.json({ error: "Kunne ikke hente feilrapporter" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}