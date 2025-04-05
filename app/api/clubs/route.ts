import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// Initialiser Prisma Client
const prisma = new PrismaClient();

/**
 * GET /api/clubs
 * Henter en paginert liste over klubber.
 * Inkluderer antall medlemmer for hver klubb via _count.
 * Query parametere:
 *   - page: Sidenummer (default: 1)
 *   - limit: Antall elementer per side (default: 6)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  // Hent og valider pagineringsparametere
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '6', 10);
  const validPage = Math.max(1, page);       // Sørg for at side > 0
  const validLimit = Math.max(1, limit);      // Sørg for at limit > 0

  try {
    // Beregn hvor mange elementer som skal hoppes over
    const skip = (validPage - 1) * validLimit;

    // Hent klubbene fra databasen
    const clubs = await prisma.club.findMany({
      orderBy: {
        established: 'desc', // Sorter etter etableringsdato (nyeste først)
        // Alternativt: name: 'asc' for alfabetisk sortering
      },
      skip: skip,           // Hopp over elementer på tidligere sider
      take: validLimit,       // Begrens antall returnerte elementer
      include: {
        // Tell antall relaterte medlemskap for hver klubb
        _count: {
          select: {
            memberships: true
          }
        }
        // Inkluder andre relasjoner eller felter her om nødvendig,
        // men hold det minimalt for ytelse i listevisninger.
      }
    });

    // Hent det totale antallet klubber for å beregne antall sider
    const totalCount = await prisma.club.count();
    const totalPages = Math.ceil(totalCount / validLimit);

    // Returner dataen i et standardisert format
    return NextResponse.json({
      clubs,               // Listen av klubber (med _count)
      totalPages,          // Totalt antall sider for paginering
      currentPage: validPage, // Gjeldende side
    }, { status: 200 });

  } catch (error) {
    // Logg feil og returner en generell feilmelding
    console.error("Feil ved henting av klubber:", error);
    return NextResponse.json({ error: "Noe gikk galt ved henting av klubber" }, { status: 500 });
  } finally {
    // Sørg for å koble fra databasen etter operasjonen
    await prisma.$disconnect();
  }
}

// Husk å legge til POST-handleren for å opprette klubber i denne filen også,
// hvis den ikke allerede eksisterer.
/*
export async function POST(req: Request) {
  // Implementer logikk for å opprette en ny klubb
  // - Hent data fra req.formData()
  // - Valider data
  // - Håndter eventuell filopplasting
  // - await prisma.club.create(...)
  // - Returner NextResponse
}
*/