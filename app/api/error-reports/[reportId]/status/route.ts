// app/api/error-reports/[reportId]/status/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, UserRole, ErrorReportStatus } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";

const prisma = new PrismaClient();

const updateStatusSchema = z.object({
  status: z.nativeEnum(ErrorReportStatus),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> }
  // -----------------------------
) {
  const session = await auth();
  // --- NÅ MÅ VI BRUKE await HER ---
  const { reportId } = await params;
  // --------------------------------


  // 1. Autentisering
  if (!session?.user?.id || !session?.user?.role) {
    return NextResponse.json({ error: "Autentisering kreves" }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = session.user.role as UserRole;

  // Kun Admin eller Club Leader kan oppdatere
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.CLUB_LEADER) {
    return NextResponse.json({ error: "Ingen tilgang til å oppdatere status" }, { status: 403 });
  }

  // 2. Valider input
  let newStatus: ErrorReportStatus;
  try {
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Ugyldig statusverdi", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    newStatus = validation.data.status;
  } catch (error) {
    console.error("Feil ved parsing av request body:", error);
    return NextResponse.json({ error: "Ugyldig forespørselsbody" }, { status: 400 });
  }

  // 3. Finn rapporten og sjekk autorisasjon for Club Leader
  try {
    const report = await prisma.errorReport.findUnique({
      where: { id: reportId },
      include: {
        course: {
          select: { clubId: true }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: "Feilrapport ikke funnet" }, { status: 404 });
    }

    // Autorisering for Club Leader
    if (userRole === UserRole.CLUB_LEADER) {
      if (!report.course?.clubId) {
         console.warn(`Club Leader ${userId} prøvde å endre rapport ${reportId} for bane uten klubb.`);
         return NextResponse.json({ error: "Kan ikke endre status for bane uten klubb" }, { status: 403 });
      }

      const isClubAdmin = await prisma.club.findFirst({
        where: {
          id: report.course.clubId,
          admins: { some: { id: userId } }
        },
        select: { id: true }
      });

      if (!isClubAdmin) {
        console.warn(`Club Leader ${userId} nektet tilgang til å endre rapport ${reportId} for klubb ${report.course.clubId}.`);
        return NextResponse.json({ error: "Ingen tilgang til å oppdatere status for denne banen" }, { status: 403 });
      }
    }

    // 4. Utfør oppdateringen
    const updatedReport = await prisma.errorReport.update({
      where: { id: reportId },
      data: { status: newStatus },
       include: {
          course: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
    });

    console.log(`Bruker ${userId} (${userRole}) oppdaterte status for rapport ${reportId} til ${newStatus}`);
    return NextResponse.json(updatedReport, { status: 200 });

  } catch (error) {
    console.error(`Feil ved oppdatering av status for rapport ${reportId}:`, error);
    return NextResponse.json({ error: "Kunne ikke oppdatere status" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}