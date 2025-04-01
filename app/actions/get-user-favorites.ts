// actions/get-user-favorites.ts
"use server";

import { auth } from "@/auth"; // Bruk din eksisterende auth-eksport for å hente session server-side
import prismaClient from "@/app/lib/prismadb"; // Din Prisma-klient

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