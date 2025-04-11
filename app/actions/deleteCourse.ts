// Fil: app/actions/deleteCourse.ts
// Formål: Server action for å slette en spesifikk bane fra databasen basert på dens ID.
//         Etter vellykket sletting, revalideres admin-stien for UI-oppdatering og brukeren
//         omdirigeres til admin-siden.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use server"; // Marker funksjonen som en server action

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache"; // For å oppdatere cache etter sletting
import { redirect } from "next/navigation"; // For å omdirigere brukeren etter sletting

const prisma = new PrismaClient();

export async function deleteCourse(id: string) {
  try {
    // Slett banen fra databasen
    await prisma.course.delete({
      where: { id },
    });

    // Oppdater cache og omdiriger brukeren
    revalidatePath("/admin"); // Oppdater siden som viser banelisten
    redirect("/admin"); // Omdiriger brukeren til admin-dashboardet
  } catch (error) {
    console.error("Feil ved sletting av bane:", error);
    throw new Error("Kunne ikke slette bane");
  }
}