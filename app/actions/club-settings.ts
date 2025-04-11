// Fil: src/actions/updateClubSettings.ts
// Formål: Server action for å oppdatere innstillinger for en spesifikk klubb (navn, adresse, telefon, postnummer, logo).
//         Inkluderer sjekk for brukerautentisering og at brukeren har rollen ADMIN eller CLUB_LEADER for å utføre handlingen.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { currentUser } from "../lib/auth";
import client from "../lib/prismadb";


// Definer ClubSettings-typen
interface ClubSettings {
  clubId: string;
  name: string;
  address: string;
  phone: string;
  postalCode: string;
  logoUrl?: string;
}

// Serverfunksjon for å oppdatere klubbinnstillinger
export const updateClubSettings = async (values: ClubSettings) => {
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

  // Hent klubbens nåværende innstillinger fra databasen
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
      address: values.address || club.address,
      phone: values.phone || club.phone,
      postalCode: values.postalCode || club.postalCode,
      logoUrl: values.logoUrl || club.logoUrl,
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
