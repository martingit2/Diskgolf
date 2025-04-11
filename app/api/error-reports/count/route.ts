// Fil: app/api/error-reports/count/route.ts
// Formål: API-endepunkt (GET) for å hente antall åpne feilrapporter.
//         Returnerer totalt antall åpne rapporter for ADMIN, eller antall åpne rapporter
//         knyttet til brukerens klubber for CLUB_LEADER. Returnerer 0 for andre roller eller uautentiserte brukere.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole, ErrorReportStatus } from "@prisma/client";
import { auth } from "@/auth"; // Importer auth-funksjonen din

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await auth();

  // Viktig: Sjekk både for innlogging og rolle
  if (!session?.user?.id || !session?.user?.role) {
    // Returner 0 hvis ikke autorisert for å unngå feil i frontend,
    // men logg gjerne en advarsel server-side hvis ønskelig.
    return NextResponse.json({ count: 0 }, { status: 200 }); // Eller 401/403 hvis du vil håndtere det annerledes i frontend
  }

  const userId = session.user.id;
  const userRole = session.user.role as UserRole;

  // Kun ADMIN og CLUB_LEADER skal få et reelt tall > 0
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.CLUB_LEADER) {
      return NextResponse.json({ count: 0 }, { status: 200 });
  }

  try {
    let count = 0;

    // Admin teller alle åpne rapporter
    if (userRole === UserRole.ADMIN) {
      count = await prisma.errorReport.count({
        where: {
          status: ErrorReportStatus.OPEN, // Teller kun åpne rapporter
        },
      });
    }
    // Club Leader teller åpne rapporter for sine baner
    else if (userRole === UserRole.CLUB_LEADER) {
      const clubsLed = await prisma.club.findMany({
        where: { admins: { some: { id: userId } } },
        select: { id: true },
      });
      const clubIdsLed = clubsLed.map(club => club.id);

      if (clubIdsLed.length > 0) {
        const coursesInClubs = await prisma.course.findMany({
          where: { clubId: { in: clubIdsLed } },
          select: { id: true },
        });
        const courseIdsInClubs = coursesInClubs.map(course => course.id);

         if (courseIdsInClubs.length > 0) {
            count = await prisma.errorReport.count({
              where: {
                courseId: { in: courseIdsInClubs },
                status: ErrorReportStatus.OPEN, // Teller kun åpne rapporter
              },
            });
         }
      }
      // Hvis ingen klubber/baner, forblir count 0
    }

    return NextResponse.json({ count }, { status: 200 });

  } catch (error) {
    console.error("Feil ved henting av antall feilrapporter:", error);
    // Returner 0 ved feil for å unngå brudd i UI, men logg feilen
    return NextResponse.json({ count: 0 }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}