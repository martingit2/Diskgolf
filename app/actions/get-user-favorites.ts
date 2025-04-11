// Fil: actions/get-user-favorites.ts
// Formål: Server action for å hente listen over favorittbane-IDer for den innloggede brukeren.
//         Bruker server-side autentisering, henter brukerdata fra Prisma, og returnerer enten
//         en liste med ID-er eller en feilmelding.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use server";

import { auth } from "@/auth"; 
import prismaClient from "@/app/lib/prismadb"; 

/**
 * Henter den innloggede brukerens liste over favorittbane-IDer.
 * @returns Et objekt med enten 'data' (array av strenger) eller 'error' (streng).
 */
export const getCurrentUserFavorites = async (): Promise<{ data?: string[]; error?: string }> => {
  const session = await auth(); // Hent server-side session

  if (!session?.user?.id) {
    // console.log("[Action: GetFavorites] Ingen bruker logget inn.");
    // Returner tom liste for uautoriserte kall (eller en feil hvis du foretrekker det)
    return { data: [] };
    // Alternativt: return { error: "Bruker ikke autentisert." };
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: { favoriteCourses: true }, // Hent kun favorittlisten
    });

    if (!user) {
      console.error(`[Action: GetFavorites] Bruker ${session.user.id} ikke funnet i DB.`);
      return { error: "Bruker ikke funnet." };
    }

    // Returner listen (kan være tom hvis brukeren ikke har favoritter)
    return { data: user.favoriteCourses || [] };

  } catch (error) {
    console.error("[Action: GetFavorites] Databasefeil:", error);
    return { error: "Kunne ikke hente favoritter fra databasen." };
  }
};