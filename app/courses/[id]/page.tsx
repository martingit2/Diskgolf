import { notFound } from "next/navigation";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";

// Ikoner fra lucide-react
import {
  Disc,
  Layers,
  Ruler,
  Star,
  MapPin,
  AlertCircle,
  User,
  RefreshCw,
  Award,
  Sun,
  Wind,
  Cloud,
} from "lucide-react";
import WriteReview from "@/components/WriteReview";
import { FaStar } from "react-icons/fa";
import MapModal from "@/components/MapModal";

// Importer MapModal-komponenten



export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) {
    return notFound();
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1) Hent kursdata
    const courseResponse = await fetch(`${baseUrl}/api/courses/${id}`, {
      cache: "no-cache",
    });
    if (!courseResponse.ok) {
      return notFound();
    }
    const course = await courseResponse.json();

    // 2) Hent anmeldelser
    const reviewsResponse = await fetch(
      `${baseUrl}/api/reviews?course_id=${id}`,
      { cache: "no-cache" }
    );
    if (!reviewsResponse.ok) {
      return notFound();
    }
    const reviews = await reviewsResponse.json();

    function translateCondition(condition: string): string {
      const mapping: Record<string, string> = {
        lightsnow: "Lett snøfall",
        heavysnow: "Kraftig snøfall",
        clear: "Klart",
        partlycloudy: "Delvis skyet",
        cloudy: "Skyet",
        rain: "Regn",
        showers: "Byger",
        // legg til flere oversettelser etter behov
      };

      return mapping[condition] || condition;
    }

    // 3) Hent værdata (hvis latitude/longitude finnes)
    let weatherData:
      | {
          temperature: number;
          windSpeed: number;
          condition: string;
          updatedAt: string;
        }
      | null = null;
    if (course.latitude && course.longitude) {
      const weatherResponse = await fetch(
        `${baseUrl}/api/weather?lat=${course.latitude}&lon=${course.longitude}`,
        { cache: "no-cache" }
      );
      if (weatherResponse.ok) {
        weatherData = await weatherResponse.json();
      }
    }

    // Beregn antall kurver
    const numHoles = course.numHoles ?? course.baskets?.length ?? 0;

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overskrift og lokasjon */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          <p className="text-gray-600">{course.location}</p>
        </div>

        {/* Beskrivelse */}
        {course.description && (
          <div className="mt-4 border-l-4 border-green-500 bg-white shadow-sm rounded-md p-4">
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>
        )}

        {/* To kolonner: Venstre (bilde, knapper), Høyre (baneinfo + vær) */}
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* VENSTRE KOLONNE */}
          <div className="md:w-2/3 flex flex-col gap-6">
            {/* Bilde */}
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-lg group">
              {course.image && (
                <>
                  <Image
                    src={
                      course.image.startsWith("http")
                        ? course.image
                        : `${baseUrl}${course.image}`
                    }
                    alt={course.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              )}
            </div>

            {/* Knapper */}
            <div className="flex flex-col items-center justify-center md:flex-row gap-8">
              <Link href={`/spill?course=${course.id}`} passHref>
                <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center gap-2">
                  <FaPlay className="animate-pulse" /> Start banespill
                </Button>
              </Link>
              {/* Kart-knapp */}
              <MapModal courseId={course.id} />

              <Link href={`/meld-feil/${course.id}`} passHref>
                <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300">
                  Meld Feil på Bane
                </Button>
              </Link>
            </div>

            {/* Separator under knappene */}
            <hr className="my-6 border-t border-gray-300" />
          </div>

          {/* HØYRE KOLONNE */}
          <div className="md:w-1/3 flex flex-col gap-6">
            {/* Baneinformasjon-boks (med ikoner) */}
            <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Baneinformasjon
              </h3>
              <div className="space-y-3 text-gray-800 text-sm">
                <div className="flex items-center gap-2">
                  <Disc className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Par:</span>
                  <span>{course.par}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Disc className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Antall kurver:</span>
                  <span>{numHoles}</span>
                </div>
                {course.start && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Antall Tee:</span>
                    <span>{course.start.length} punkter</span>
                  </div>
                )}
                {course.obZones && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">OB-soner:</span>
                    <span>{course.obZones.length} soner</span>
                  </div>
                )}
                {course.totalDistance !== undefined && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Banelengde:</span>
                    <span>{course.totalDistance.toFixed(2)} m</span>
                  </div>
                )}
                {course.averageRating !== undefined && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Gj.snittvurdering:</span>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span className="text-yellow-500">
                        {"★".repeat(Math.round(course.averageRating))}
                      </span>
                      <span className="text-gray-700">
                        {course.averageRating}
                        {course.totalReviews ? ` (${course.totalReviews} anmeldelser)` : ""}
                      </span>
                    </div>
                  </div>
                )}
                {/* Separator */}
                <hr className="my-4 border-t border-gray-300" />
                {/* Tilleggsinfo */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tilleggsinfo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Baneeier:</span>
                      <span>Ukjent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Totalt antall runder spilt:</span>
                      <span>Ukjent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Beste score:</span>
                      <span>Ukjent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Værdata-boks */}
            {weatherData && (
              <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-md text-gray-800">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Banens værforhold
                </h3>
                <div className="flex items-center gap-2">
                  <Sun className="w-6 h-6 text-yellow-500" />
                  <p className="text-sm">
                    Temperatur:{" "}
                    <span className="font-medium">{weatherData.temperature} °C</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Wind className="w-6 h-6 text-blue-500" />
                  <p className="text-sm">
                    Vind:{" "}
                    <span className="font-medium">{weatherData.windSpeed} m/s</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Cloud className="w-6 h-6 text-gray-500" />
                  <p className="text-sm">
                    Forhold:{" "}
                    <span className="font-medium">
                      {translateCondition(weatherData.condition)}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Oppdatert: {new Date(weatherData.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Anmeldelser */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Anmeldelser</h2>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(
                (review: {
                  id: string;
                  rating: number;
                  comment: string;
                  createdAt?: string;
                  user?: {
                    name?: string;
                    image?: string;
                  };
                }) => (
                  <div
                    key={review.id}
                    className="border border-gray-300 rounded-xl p-5 shadow-lg bg-white space-y-4 transition-transform duration-200 hover:scale-105"
                  >
                    {/* Stjerner og navn */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Profilbilde */}
                        {review.user?.image ? (
                          <img
                            src={review.user.image}
                            alt={review.user.name || "Bruker"}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border border-gray-300 shadow-md">
                            <User className="w-6 h-6" />
                          </div>
                        )}

                        {/* Navn */}
                        <span className="font-semibold text-lg text-gray-800">
                          {review.user?.name || "Ukjent bruker"}
                        </span>
                      </div>

                      {/* Stjerner */}
                      <div className="flex text-yellow-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <FaStar
                            key={index}
                            className={`text-lg ${index < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Kommentar */}
                    <p className="text-gray-700 italic leading-relaxed border-l-4 border-green-500 pl-4">
                      {review.comment}
                    </p>

                    {/* Dato for anmeldelse */}
                    {review.createdAt && (
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        {new Date(review.createdAt).toLocaleDateString("no-NO")}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500">Ingen anmeldelser enda.</p>
          )}
          {/* Skriv ny anmeldelse */}
          <div className="mt-8">
            <WriteReview courseId={course.id} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Error fetching course or reviews:", error);
    return notFound();
  }
}