/** 
 * Filnavn: route.ts
 * Beskrivelse: API-endepunkt for å sjekke om den autentiserte brukeren har administratorrettigheter.
 * Returnerer HTTP 200 OK hvis brukeren har ADMIN-rolle, ellers HTTP 403 Forbidden.
 * Utvikler: Martin Pettersen
 */


import { currentRole } from "@/app/lib/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return new NextResponse(null, { status: 200 });
  }

  return new NextResponse(null, { status: 403 });
}