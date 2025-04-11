// Fil: app/api/tournaments/route.ts
// Formål: API-endepunkt for å håndtere turneringer.
//         GET: Henter en liste over turneringer med støtte for paginering, søk, og filtrering (kommende/tidligere).
//         POST: Oppretter en ny turnering, krever autentisering.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { PrismaClient, TournamentStatus } from "@prisma/client"; // Importer TournamentStatus
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 8; // *** VIKTIG: Sett til samme verdi som i frontend (var 8 der) ***

// GET - Henter turneringsliste (med filtrering og paginering)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const searchTerm = searchParams.get("search") || "";
  const filter = searchParams.get("filter"); // 'upcoming' or 'past'
  const includeParticipants = searchParams.get("includeParticipants") === 'true';

  // Valider page for å unngå negative eller ugyldige verdier
  const validatedPage = Math.max(1, page);

  try {
    const skip = (validatedPage - 1) * ITEMS_PER_PAGE;
    const now = new Date();
    // Setter tid til 00:00:00 for å sammenligne kun dato for 'upcoming'/'past'
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let dateFilter = {};
    if (filter === 'upcoming') {
      // Kommende: Startdato er i dag eller senere OG status er IKKE fullført
      // (Man kan diskutere om PLANNING skal med, men antar det her)
      dateFilter = {
        startDate: { gte: startOfToday },
        status: { not: TournamentStatus.COMPLETED }
      };
    } else if (filter === 'past') {
      // Tidligere: Startdato er før i dag ELLER status ER fullført
      dateFilter = {
        OR: [
          { startDate: { lt: startOfToday } },
          { status: TournamentStatus.COMPLETED }
        ]
      };
    }
    // Hvis ingen filter er satt, hentes alt (kan justeres hvis standard ønskes)

    const searchFilter = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' as const } },
            { location: { contains: searchTerm, mode: 'insensitive' as const } },
            { description: { contains: searchTerm, mode: 'insensitive' as const } },
            { course: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
            { club: { name: { contains: searchTerm, mode: 'insensitive' as const } } }, // Søk i klubbnavn også
            // Vurder å legge til søk på arrangørnavn hvis ønskelig
            // { organizer: { name: { contains: searchTerm, mode: 'insensitive' as const } } }
          ],
        }
      : {};

    // Kombiner søkefilter og dato/status-filter
    const whereClause = {
      AND: [
        searchFilter,
        dateFilter
      ]
    };

    // Betinget inkludering av deltaker-IDer
    const participantsInclude = includeParticipants
        ? { participants: { select: { id: true } } } // Hent bare IDer for effektivitet
        : {};

    const [tournaments, totalCount] = await prisma.$transaction([
      prisma.tournament.findMany({
        where: whereClause,
        include: {
          course: { select: { id: true, name: true, location: true, image: true } },
          organizer: { select: { id: true, name: true } },
          club: { select: { id: true, name: true } },
          _count: { select: { participants: true } },
          ...participantsInclude // Legg til deltakerinfo hvis forespurt
        },
        // Sorter kommende stigende (nærmeste først), tidligere synkende (nyeste først)
        orderBy: { startDate: filter === 'past' ? 'desc' : 'asc' },
        skip: skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.tournament.count({ where: whereClause }), // Tell total matching the filters
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1; // Sørg for minst 1 side

    // Ikke nødvendig å formatere dato her lenger, frontend håndterer Date-objekter
    // const formattedTournaments = tournaments.map(t => ({ ...t }));

    return NextResponse.json({
        tournaments: tournaments, // Send rå data
        currentPage: validatedPage,
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

// POST - Oppretter en ny turnering (krever innlogging) - Denne er fra din opprinnelige fil og ser OK ut
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autentisering kreves for å opprette turnering." }, { status: 401 });
  }
  const organizerId = session.user.id;

  try {
    const body = await request.json();

    if (!body.name || !body.startDate || !body.courseId) {
      return NextResponse.json(
        { error: "Mangler obligatoriske felter: name, startDate, courseId" },
        { status: 400 }
      );
    }

    // Hent banens lokasjon for å bruke som standard hvis ikke oppgitt
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

    // Forsøk å parse datoer - legg til feilhåndtering om nødvendig
    let startDateObj: Date | null = null;
    try {
        startDateObj = new Date(body.startDate);
        if (isNaN(startDateObj.getTime())) throw new Error("Invalid start date");
    } catch (e) {
        return NextResponse.json({ error: "Ugyldig startdato format" }, { status: 400 });
    }

    let endDateObj: Date | null = null;
    if (body.endDate) {
        try {
            endDateObj = new Date(body.endDate);
            if (isNaN(endDateObj.getTime())) throw new Error("Invalid end date");
        } catch (e) {
            return NextResponse.json({ error: "Ugyldig sluttdato format" }, { status: 400 });
        }
    }

    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        description: body.description || null, // Bruk null hvis tom streng
        startDate: startDateObj,
        endDate: endDateObj,
        // Bruk eksplisitt status hvis sendt med, ellers default til PLANNING
        status: body.status && Object.values(TournamentStatus).includes(body.status) ? body.status : TournamentStatus.PLANNING,
        organizerId: organizerId,
        courseId: body.courseId,
        maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants) : null,
        // Bruk location fra body hvis oppgitt, ellers fra course, ellers default
        location: body.location || course.location || "Ukjent sted",
        clubId: body.clubId || null, // Tillat null for clubId
        image: body.image || null,
      },
      include: { // Inkluder relasjoner i responsen for umiddelbar bruk
        course: { select: { id: true, name: true } },
        organizer: { select: { id: true, name: true } },
        club: { select: { id: true, name: true } },
        _count: { select: { participants: true } }, // Inkluder antall deltakere
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error: any) {
    console.error("Feil ved opprettelse av turnering:", error);
    // Bedre feilmelding for unike constraints etc.
    if (error.code === 'P2002') { // Prisma unique constraint violation
        return NextResponse.json({ error: `En verdi er ikke unik: ${error.meta?.target?.join(', ')}` }, { status: 409 }); // Conflict
    }
    return NextResponse.json(
      { error: "Kunne ikke opprette turnering", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}