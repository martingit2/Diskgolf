// app/api/tournaments/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Bruker deres sti

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

// GET - Henter turneringsliste (krever ikke innlogging)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const searchTerm = searchParams.get("search") || "";

  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const whereClause = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' as const } },
            { location: { contains: searchTerm, mode: 'insensitive' as const } },
            { description: { contains: searchTerm, mode: 'insensitive' as const } },
            { course: { name: { contains: searchTerm, mode: 'insensitive' as const } } }
          ],
        }
      : {};

    const [tournaments, totalCount] = await prisma.$transaction([
      prisma.tournament.findMany({
        where: whereClause,
        include: {
          course: { select: { id: true, name: true, location: true, image: true } },
          organizer: { select: { id: true, name: true } },
          club: { select: { id: true, name: true } },
          _count: { select: { participants: true } },
        },
        orderBy: { startDate: 'asc' },
        skip: skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.tournament.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const formattedTournaments = tournaments.map(t => ({
        ...t,
        dateTime: t.startDate.toISOString(), // For å matche eldre frontend-kode, evt. fjern
    }));

    return NextResponse.json({
        tournaments: formattedTournaments,
        currentPage: page,
        totalPages: totalPages
    });
  } catch (error) {
    console.error("Feil ved henting av turneringer:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente turneringer" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Oppretter en ny turnering (krever innlogging)
export async function POST(request: Request) {
  // Hent session
  const session = await getServerSession(authOptions);

  // Sjekk om bruker er logget inn
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autentisering kreves for å opprette turnering." }, { status: 401 });
  }
  const organizerId = session.user.id; // Bruker ID fra innlogget bruker

  try {
    const body = await request.json();

    // Valider påkrevde felter
    if (!body.name || !body.startDate || !body.courseId) {
      return NextResponse.json(
        { error: "Mangler obligatoriske felter: name, startDate, courseId" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
      select: { location: true }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Valgt bane finnes ikke" },
        { status: 404 }
      );
    }

    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        description: body.description || "",
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "PLANNING",
        organizerId: organizerId, // Sett arrangør til innlogget bruker
        courseId: body.courseId,
        maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants) : null,
        location: body.location || course.location || "Ukjent sted",
        clubId: body.clubId || null,
        image: body.image || null,
      },
      include: {
        course: { select: { id: true, name: true } },
        organizer: { select: { id: true, name: true } },
        club: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error("Feil ved opprettelse av turnering:", error);
    // Sjekk for spesifikke Prisma-feil hvis nødvendig (f.eks., unique constraint)
    return NextResponse.json(
      { error: "Kunne ikke opprette turnering" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}