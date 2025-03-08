/**
 * Filnavn: club-settings.ts
 * Beskrivelse: Serverfunksjon for å håndtere oppdatering av klubbinnstillinger.
 * Håndterer oppdatering av klubbens navn, e-post, beskrivelse og andre klubbrelaterte innstillinger.
 * Utvikler: Martin Pettersen
 */

"use server";

import * as z from "zod";
  // Lag et skjema for klubbinnstillinger
import { currentUser } from "../lib/auth";
import client from "../lib/prismadb";
import { ClubSettingsSchema } from "@/schemas/ClubSettingsSchema";

// Serverfunksjon for å oppdatere klubbinnstillinger
export const updateClubSettings = async (values: z.infer<typeof ClubSettingsSchema>) => {
  console.log("Mottatte verdier fra frontend:", values);

  const user = await currentUser();
  if (!user) {
    console.error("Ingen bruker funnet");
    return { error: "Uautorisert" };
  }

  // Sjekk at brukeren har riktige rettigheter (ADMIN eller CLUB_LEADER)
  if (user.role !== "ADMIN" && user.role !== "CLUB_LEADER") {
    console.error("Ugyldig rolle, tilgang nektet");
    return { error: "Du har ikke tilgang til klubbinnstillinger" };
  }

  // Hent klubbens nåværende innstillinger fra databasen (erstatte med reell databaselogikk)
  try {
    const club = await client.club.findUnique({
      where: { id: values.clubId }, // Forutsetter at du har en `clubId` i verdiene
    });

    if (!club) {
      console.error("Fant ikke klubben i databasen");
      return { error: "Klubben ble ikke funnet" };
    }

    // Forbered oppdateringsdata
    const updatedData = {
      name: values.name || club.name,
      email: values.email || club.email,
      description: values.description || club.description,
      // Legg til flere klubbrelaterte innstillinger her
    };

    console.log("Oppdaterer klubbinnstillinger i databasen...");
    const updatedClub = await client.club.update({
      where: { id: club.id },
      data: updatedData,
    });

    console.log("Klubbinnstillinger oppdatert:", updatedClub);

    return { success: "Klubbinnstillinger oppdatert!" };
  } catch (error) {
    console.error("Feil under oppdatering av klubbinnstillinger:", error);
    return { error: "Kunne ikke oppdatere klubbinnstillinger. Prøv igjen senere." };
  }
};
