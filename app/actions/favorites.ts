// Fil: src/actions/toggleFavorite.ts
// Formål: Server action for å legge til eller fjerne en bane fra en brukers favorittliste.
//         Sjekker brukerautentisering, henter brukerens nåværende favoritter, oppdaterer listen,
//         og lagrer endringen i databasen.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use server";

import { currentUser } from "../lib/auth"; // Importer autentisering
import client from "../lib/prismadb"; // Prisma-klient

// Legg til eller fjern favoritt
export const toggleFavorite = async (courseId: string) => {
  console.log("Mottatt courseId:", courseId);

  // Sjekk om brukeren er autentisert
  const user = await currentUser();
  if (!user) {
    console.error("Ingen bruker funnet");
    return { error: "Uautorisert" };
  }

  // Hent brukerens nåværende favorittbaner
  const dbUser = await client.user.findUnique({
    where: { id: user.id },
    select: { favoriteCourses: true },
  });

  if (!dbUser) {
    console.error("Bruker ikke funnet i databasen");
    return { error: "Bruker ikke funnet" };
  }

  // Sjekk om banen allerede er i favorittene
  const isFavorite = dbUser.favoriteCourses.includes(courseId);

  // Oppdater favorittlisten
  const updatedFavorites = isFavorite
    ? dbUser.favoriteCourses.filter((id) => id !== courseId) // Fjern fra favoritter
    : [...dbUser.favoriteCourses, courseId]; // Legg til i favoritter

  // Oppdater brukeren i databasen
  await client.user.update({
    where: { id: user.id },
    data: { favoriteCourses: updatedFavorites },
  });

  console.log("Favoritter oppdatert:", updatedFavorites);
  return { success: "Favoritt oppdatert!", favorites: updatedFavorites };
};