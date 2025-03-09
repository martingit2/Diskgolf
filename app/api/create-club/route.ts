import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/app/lib/auth"; // Importere currentUser for å hente den nåværende brukeren

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const description = formData.get("description") as string | null;
    const sted = formData.get("sted") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const postalCode = formData.get("postalCode") as string;

    // Hent nåværende bruker (brukeren som oppretter klubben) fra currentUser() funksjonen
    const user = await currentUser(); // Henter den nåværende brukeren
    if (!user) {
      console.error("Ingen bruker er logget inn.");
      return NextResponse.json({ error: "Brukeren er ikke autentisert." }, { status: 401 });
    }

    // Generere clubId automatisk når klubben opprettes
    const newClub = await prisma.club.create({
      data: {
        name,
        email: email || null,
        description: description || null,
        location: sted,
        address,
        phone,
        postalCode,
      },
    });

    // Legg til den nåværende brukeren som medlem i den nye klubben
    await prisma.membership.create({
      data: {
        userId: user.id, // Brukerens ID
        clubId: newClub.id, // ID til klubben som ble opprettet
      },
    });

    // Bekreft at klubben ble opprettet og brukeren ble lagt til som medlem
    console.log("Klubb opprettet og bruker lagt til:", newClub);

    return NextResponse.json({
      success: "Klubben ble opprettet, og du er automatisk medlem!",
      clubId: newClub.id, // Returner den genererte clubId
    }, { status: 201 });

  } catch (error) {
    console.error("Feil under opprettelse av klubb:", error);
    return NextResponse.json({ error: "Kunne ikke opprette klubben, prøv igjen senere." }, { status: 500 });
  }
}
