// Fil: src/actions/addCourseOwner.ts
// Formål: Server action for å knytte en spesifikk klubb som eier til en spesifikk bane i databasen.
//         Oppdaterer Course-modellen med clubId og revaliderer angitt sti for UI-oppdatering.
// Utvikler: Martin Pettersen


"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function addCourseOwner(courseId: string, clubId: string) {
  try {
    // Oppdater banen med den nye klubben som eier
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { clubId },
    });

    // Revalider banens side for å oppdatere UI
    revalidatePath("/map"); // Endre dette til riktig sti hvis nødvendig

    return { success: "Baneeier lagt til!", course: updatedCourse };
  } catch (error) {
    console.error("Feil ved tilknytning av baneeier:", error);
    return { error: "Kunne ikke legge til baneeier. Prøv igjen senere." };
  }
}