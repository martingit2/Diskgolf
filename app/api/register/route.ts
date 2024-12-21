// Importerer bcrypt for å hashe passord før de lagres i databasen
import bcrypt from "bcrypt";

// Importerer Prisma-klienten fra den sentraliserte Prisma-konfigurasjonen
import prisma from "@/app/lib/prismadb";

// Importerer `NextResponse` for å sende tilbake JSON-respons i Next.js API-routes
import { NextResponse } from "next/server";

/**
 * POST-handler for registrerings-API-et.
 * Denne funksjonen oppretter en ny bruker i databasen basert på data sendt i forespørselen.
 *
 * @param request - En Request-objekt som inneholder dataene for brukeren som skal opprettes.
 * @returns JSON-respons med den opprettede brukeren.
 */

export async function POST(request: Request) {
  // Leser JSON-data fra forespørselen
  const body = await request.json();
  
  // Destrukturerer dataene fra body for å hente e-post, navn og passord
  const { email, name, password } = body;

  // Hasher passordet ved å bruke bcrypt med en saltverdi på 12
  const hashedPassword = await bcrypt.hash(password, 12);

  // Oppretter en ny bruker i databasen med Prisma
  const user = await prisma.user.create({
    data: {
      email,          // Brukerens e-postadresse
      name,           // Brukerens navn
      hashedPassword, // Hashet versjon av passordet
    },
  });

  // Returnerer den opprettede brukeren som en JSON-respons test
  return NextResponse.json(user);
}
