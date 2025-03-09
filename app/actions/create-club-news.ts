import { currentUser } from "../lib/auth"; // Importer autentisering
import client from "../lib/prismadb"; // Prisma-klient

interface ClubNews {
  clubId: string;
  title: string;
  content: string;
}

export const createClubNews = async (values: ClubNews) => {
  console.log("Mottatte verdier fra frontend:", values);

  // Sjekk om brukeren er autentisert
  const user = await currentUser();
  if (!user) {
    console.error("Ingen bruker funnet");
    return { error: "Uautorisert" };
  }

  // Sjekk at brukeren har riktig rolle
  if (user.role !== "ADMIN" && user.role !== "CLUB_LEADER") {
    console.error("Ugyldig rolle, tilgang nektet");
    return { error: "Du har ikke tilgang til å opprette klubbnyheter" };
  }

  // Hent klubbens informasjon fra databasen
  try {
    const club = await client.club.findUnique({
      where: { id: values.clubId },
      include: {
        clubNews: true, // Hent også klubbens nyheter (om nødvendig)
      },
    });

    if (!club) {
      console.error("Fant ikke klubben i databasen");
      return { error: "Klubben ble ikke funnet" };
    }

    // Opprett nyheten i databasen
    const newClubNews = await client.clubNews.create({
      data: {
        clubId: club.id,
        title: values.title,
        content: values.content,
        createdAt: new Date(),
      },
    });

    console.log("Ny klubbnyhet opprettet:", newClubNews);
    return { success: "Klubbnyhet opprettet!" };
  } catch (error) {
    console.error("Feil under oppretting av klubbnyhet:", error);
    return { error: "Kunne ikke opprette klubbnyhet. Prøv igjen senere." };
  }
};
