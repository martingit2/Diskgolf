import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function MedlemsomradePage({
  params,
}: {
  params: Promise<{ id: string }>; // Oppdatert til Promise<{ id: string }>
}) {
  // Vent på at params-resolusjonen kommer fram
  const { id } = await params; // Hent `id` fra Promise

  try {
    // Hent klubben med relatert informasjon
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        meetings: true, // Inkluder møteinnkallinger og referater
      },
    });

    if (!club) {
      return notFound();
    }

    // Sjekk om brukeren er medlem
    const isMember = await checkIfUserIsMember(id); // Alltid true for testing

    if (!isMember) {
      return notFound();
    }

    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Tab-navigasjon */}
          <div className="flex space-x-4 border-b border-gray-200 mb-8">
            <Button variant="ghost" className="text-lg" disabled>
              Medlemsområde
            </Button>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Medlemsområde for {club.name}
          </h1>

          {/* Møteinnkallinger og referater */}
          <div className="space-y-6">
            {club.meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-shadow bg-white"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {meeting.title}
                </h3>
                <p className="text-gray-600 mt-2">{meeting.description}</p>
                {meeting.pdfUrl && (
                  <Link href={meeting.pdfUrl} passHref>
                    <Button className="mt-4">Last ned PDF</Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Error fetching club:", error);
    return notFound();
  }
}

// Midlertidig funksjon for testing: alltid returner true
async function checkIfUserIsMember(clubId: string): Promise<boolean> {
  return true; // Alltid true for testing
}