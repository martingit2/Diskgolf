// Fil: app/api/delete-profile-image/route.ts
// Formål: API-endepunkt (DELETE) for å fjerne (sette til null) en brukers profilbilde-URL i databasen.
//         Tar imot 'userId' i request body og oppdaterer brukerprofilen.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { NextResponse } from "next/server";
import client from "@/app/lib/prismadb";

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Mangler userId" }, { status: 400 });
    }

    console.log("Forsøker å slette profilbilde for bruker:", userId);

    const updatedUser = await client.user.update({
      where: { id: userId },
      data: { image: null },
    });

    console.log("Bruker oppdatert i databasen:", updatedUser);

    return NextResponse.json(
      { message: "Profilbilde fjernet", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Feil ved sletting av profilbilde:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ukjent feil" },
      { status: 500 }
    );
  }
}