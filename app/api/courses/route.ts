/** 
 * Filnavn: route.ts
 * Beskrivelse: API-endepunkt for å hente discgolf-baner fra en database ved hjelp av Prisma.
 *              Returnerer en liste over tilgjengelige baner med relevant informasjon som navn, sted, par og beskrivelse.
 * Utvikler: Said Hussain Khawajazada
 */


import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";//

const prisma = new PrismaClient(); 

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        description: true,
        par: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Feil ved henting av courses:", error);
    return NextResponse.json({ error: "Kunne ikke hente courses" }, { status: 500 });
  }
}
