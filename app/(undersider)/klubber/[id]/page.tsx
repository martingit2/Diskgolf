import { notFound } from "next/navigation";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FiUserPlus } from "react-icons/fi";
import { Calendar, Users, Mail, Phone, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

interface Course {
  id: string;
  name: string;
  location?: string;
  numHoles?: number;
}

interface News {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface Admin {
  id: string;
  name?: string;
}

interface Club {
  id: string;
  name: string;
  location?: string;
  description?: string;
  imageUrl?: string;
  established: string;
  courses: Course[];
  memberships: unknown[];
  clubNews: News[];
  admins: Admin[];
  email?: string;
  phone?: string;
  website?: string;
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ id: string }>; // Oppdatert til Promise<{ id: string }>
}) {
  // Vent på at params-resolusjonen kommer fram
  const { id } = await params; // Hent `id` fra Promise

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const clubResponse = await fetch(`${baseUrl}/api/clubs/${id}`);
    if (!clubResponse.ok) {
      return notFound();
    }
    const club: Club = await clubResponse.json();

    // Sjekk om brukeren er medlem
    const isMember = await checkIfUserIsMember(id); // Alltid true for testing

    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">{club.name}</h1>
            {club.location && (
              <p className="text-lg text-gray-600 mt-1">{club.location}</p>
            )}
          </div>

          {/* Horisontal linje øverst */}
          <hr className="my-8 border-gray-200" />

          {/* Main innhold */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Venstre kolonne */}
            <div className="md:w-2/3 space-y-8">
              {/* Klubbbilde med fallback */}
              <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-2xl group">
                <Image
                  src={
                    club.imageUrl ||
                    "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"
                  }
                  alt={club.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Handlingsknapper */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link href={`/klubber/${id}/medlem`} passHref>
                  <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2">
                    <FiUserPlus className="animate-bounce" /> Bli medlem
                  </Button>
                </Link>
                <Link href={`/klubber/${id}/kontakt`} passHref>
                  <Button className="bg-gray-900 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    Kontakt klubben
                  </Button>
                </Link>
              </div>

              {/* Horisontal linje under handlingsknapper */}
              <hr className="my-8 border-gray-200" />

              {/* Klubbens beskrivelse */}
              {club.description && (
                <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-green-500">
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {club.description}
                  </p>
                </div>
              )}

              {/* Baner eid av klubben */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Baner eid av klubben
                </h2>
                {club.courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {club.courses.map((course: Course) => (
                      <Link key={course.id} href={`/courses/${course.id}`} passHref>
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-xl transition-shadow cursor-pointer bg-white">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {course.name}
                          </h3>
                          {course.location && (
                            <p className="text-gray-600">{course.location}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            Antall kurver: {course.numHoles || "Ukjent"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Klubben eier ingen baner enda.
                  </p>
                )}
              </div>

              {/* Klubbnyheter */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Klubbnyheter
                </h2>
                {club.clubNews.length > 0 ? (
                  <div className="space-y-6">
                    {club.clubNews.map((news: News) => (
                      <div
                        key={news.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-shadow bg-white"
                      >
                        <h3 className="text-xl font-semibold text-gray-800">
                          {news.title}
                        </h3>
                        <p className="text-gray-600 mt-2">{news.content}</p>
                        {news.imageUrl && (
                          <div className="relative w-full h-48 mt-4 overflow-hidden rounded-lg">
                            <Image
                              src={news.imageUrl}
                              alt={news.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Publisert:{" "}
                          {new Date(news.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Ingen nyheter enda.</p>
                )}
              </div>
            </div>

            {/* Høyre kolonne */}
            <div className="md:w-1/3 space-y-8">
              {/* Klubbinformasjon */}
              <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Klubbinformasjon
                </h3>
                <div className="space-y-4 text-gray-800 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-gray-500" />
                    <div>
                      <span className="font-medium">Etablert:</span>
                      <span className="ml-2">
                        {new Date(club.established).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-gray-500" />
                    <div>
                      <span className="font-medium">Medlemmer:</span>
                      <span className="ml-2">
                        {club.memberships?.length || "0"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-gray-500" />
                    <div>
                      <span className="font-medium">E-post:</span>
                      <a
                        href={`mailto:${club.email}`}
                        className="ml-2 text-blue-500 hover:underline"
                      >
                        {club.email || "Ingen e-post"}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-gray-500" />
                    <div>
                      <span className="font-medium">Telefon:</span>
                      <a
                        href={`tel:${club.phone}`}
                        className="ml-2 text-blue-500 hover:underline"
                      >
                        {club.phone || "Ingen telefon"}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-gray-500" />
                    <div>
                      <span className="font-medium">Nettside:</span>
                      <a
                        href={club.website || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-500 hover:underline"
                      >
                        {club.website || "Ingen nettside"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Klubbens administratorer */}
              <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Klubbens administratorer
                </h3>
                <div className="space-y-4 text-gray-800 text-sm">
                  {club.admins.length > 0 ? (
                    club.admins.map((admin: Admin) => (
                      <div key={admin.id} className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-gray-500" />
                        <span>{admin.name || "Ukjent admin"}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      Ingen administratorer registrert.
                    </p>
                  )}
                </div>
              </div>

              {/* Medlemsområde (kun for medlemmer) */}
              {isMember && (
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Medlemsområde
                  </h3>
                  <div className="space-y-4">
                    <Link href={`/klubber/${id}/medlem`} passHref>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        Gå til medlemsområde
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
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