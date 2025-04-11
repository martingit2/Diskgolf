// Fil: app/api/auth/route.ts
// Formål: API-endepunkt (GET) for å hente informasjon om den nåværende autentiserte brukeren.
//         Returnerer brukerobjektet hvis brukeren er logget inn, ellers en 401 Unauthorized-feil.
// Utvikler: Martin Pettersen


import { currentUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";
// Importer currentUser fra din auth-logikk

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Uautorisert" }, { status: 401 });
  }

  return NextResponse.json(user);
}