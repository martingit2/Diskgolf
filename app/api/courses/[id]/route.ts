/** 
 * Filnavn: route.ts
 * Beskrivelse: API-endepunkt for å hente informasjon om en spesifikk discgolf-bane basert på en gitt ID. 
 * Funksjonalitet:
 *   - Henter en kursoppføring fra databasen ved hjelp av Prisma ORM.
 *   - Returnerer kursdata i JSON-format hvis den finnes.
 *   - Håndterer feil, inkludert manglende ID, kurs som ikke finnes, og databasefeil.
 *   - Bruker `force-dynamic` for å sikre at data hentes dynamisk ved hver forespørsel.
 * Utvikler: Said Hussain Khawajazada
 */


import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const dynamic = "force-dynamic"; // Fix dynamic rendering issue

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ Await params just like your review page

  if (!id) {
    return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("❌ Prisma error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
export async function generateStaticParams() {
    return [];
  }