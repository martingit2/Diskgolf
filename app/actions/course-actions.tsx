"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function deleteCourse(courseId: string) {
  try {
    await prisma.course.delete({
      where: { id: courseId },
    });
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Bane slettet!" };
  } catch (error) {
    console.error("Feil ved sletting av bane:", error);
    return { success: false, message: "Kunne ikke slette banen" };
  }
}

export async function updateCourse(courseId: string, updatedData: any) {
  try {
    // Slett eksisterende startpunkter for banen
    await prisma.start.deleteMany({
      where: { courseId },
    });

    // Slett eksisterende OB-soner for banen
    await prisma.oB.deleteMany({
      where: { courseId },
    });

    // Opprett nye startpunkter basert på dataene fra frontend
    if (updatedData.startPoints && updatedData.startPoints.length > 0) {
      await prisma.start.createMany({
        data: updatedData.startPoints.map((point: { lat: number; lng: number }) => ({
          courseId,
          latitude: point.lat,
          longitude: point.lng,
        })),
      });
    }

    // Opprett nye OB-soner basert på dataene fra frontend
    if (updatedData.obZones && updatedData.obZones.length > 0) {
      await prisma.oB.createMany({
        data: updatedData.obZones.map((obZone: any) => ({
          courseId,
          latitude: obZone.type === "circle" ? obZone.lat : null,
          longitude: obZone.type === "circle" ? obZone.lng : null,
          points: obZone.type === "polygon" ? obZone.points : null,
        })),
      });
    }

    // Oppdater resten av banedataene
    await prisma.course.update({
      where: { id: courseId },
      data: {
        name: updatedData.name,
        location: updatedData.location,
        latitude: updatedData.latitude,
        longitude: updatedData.longitude,
        par: updatedData.par,
        description: updatedData.description,
        difficulty: updatedData.difficulty,
        image: updatedData.image,
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true, message: "Bane oppdatert!" };
  } catch (error) {
    console.error("Feil ved oppdatering av bane:", error);
    return { success: false, message: "Kunne ikke oppdatere banen" };
  }
}