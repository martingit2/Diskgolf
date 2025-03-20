// app/spill/[id]/page.tsx
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Definer typen for params
interface PageProps {
  params: Promise<{ id: string }>; // Oppdatert til Promise<{ id: string }>
}

export default async function SpillPage({ params }: PageProps) {
  // Vent på at params-resolusjonen kommer fram
  const { id } = await params; // Hent `id` fra Promise

  try {
    // Hent rommet med relatert informasjon
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        course: true, // Inkluder banedata
        participants: true, // Inkluder deltakere
      },
    });

    if (!room) {
      return notFound(); // Returner en 404-side hvis rommet ikke finnes
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-6">{room.name}</h1>
        <p>Bane: {room.course?.name}</p>
        <p>Spillere:</p>
        <ul>
          {room.participants.map((participant) => (
            <li key={participant.id}>{participant.playerName}</li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error("❌ Feil ved henting av rom:", error);
    return notFound(); // Returner en 404-side hvis noe går galt
  }
}