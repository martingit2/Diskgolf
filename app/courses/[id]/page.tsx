import { notFound } from "next/navigation";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";

// Ikoner fra lucide-react (installer om du ikke har det)
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
} from "lucide-react";

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

    // 3) Hent værdata (hvis latitude/longitude finnes)
    let weatherData: {
      temperature: number;
      windSpeed: number;
      condition: string;
      updatedAt: string;
    } | null = null;

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
        {/* Tittel + lokasjon */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold">{course.name}</h1>
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

        {/* To kolonner: Venstre (bilde + beskrivelse + knapper), Høyre (boks med baneinfo og værdata) */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* VENSTRE KOLONNE */}
          <div className="md:w-2/3 flex flex-col gap-4">
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

            
            {/* Knapper side om side */}
            <div className="flex flex-col items-center justify-center md:flex-row mt-4 gap-20">
              <Link href={`/spill?course=${course.id}`} passHref>
                <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 flex items-center gap-2">
                  <FaPlay className="animate-pulse" /> Start banespill
                </Button>
              </Link>
              <Link href={`/meld-feil/${course.id}`} passHref>
                <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300">
                  Meld Feil på Bane
                </Button>
              </Link>
            </div>
          </div>

          {/* HØYRE KOLONNE */}
          <div className="md:w-1/3 flex flex-col gap-4">
            {/* Baneinformasjon-boks (med ikoner) */}
            <div className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Baneinformasjon
              </h3>
              <div className="space-y-2 text-gray-700">
                {/* Par */}
                <div className="flex items-center gap-2">
                  <Disc className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Par:</span>
                  <span>{course.par}</span>
                </div>

                {/* Vanskelighetsgrad */}
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Vanskelighetsgrad:</span>
                  <span>{course.difficulty || "Ukjent"}</span>
                </div>

                {/* Antall kurver */}
                <div className="flex items-center gap-2">
                  <Disc className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Antall kurver:</span>
                  <span>{numHoles}</span>
                </div>

                {/* Banelengde */}
                {course.totalDistance !== undefined && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Banelengde:</span>
                    <span>{course.totalDistance.toFixed(2)} m</span>
                  </div>
                )}

                {/* Gj.snittvurdering */}
                {course.averageRating !== undefined && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Gj.snittvurdering:</span>
                    <span>
                      {course.averageRating}{" "}
                      {course.totalReviews
                        ? `(${course.totalReviews} anmeldelser)`
                        : ""}
                    </span>
                  </div>
                )}

                {/* Antall Tee */}
                {course.start && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Antall Tee:</span>
                    <span>{course.start.length} punkter</span>
                  </div>
                )}

                {/* OB-soner */}
                {course.obZones && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">OB-soner:</span>
                    <span>{course.obZones.length} soner</span>
                  </div>
                )}

                {/* Eier, Spilt, Beste score */}
                <div className="flex items-center gap-2 mt-2">
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

            {/* Værdata-boks */}
            {weatherData && (
              <div className="p-4 bg-gray-100 border border-gray-200 rounded-md shadow-sm text-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  Værdata
                </h3>
                <p>Temperatur: {weatherData.temperature} °C</p>
                <p>Vind: {weatherData.windSpeed} m/s</p>
                <p>Forhold: {weatherData.condition}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Oppdatert:{" "}
                  {new Date(weatherData.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Anmeldelser nederst */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Anmeldelser</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(
                (review: { id: string; rating: number; comment: string }) => (
                  <div
                    key={review.id}
                    className="border rounded p-4 shadow-md bg-white"
                  >
                    <p className="text-yellow-500">
                      {"★".repeat(review.rating)}
                    </p>
                    <p className="italic text-gray-700">{review.comment}</p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">Ingen anmeldelser enda.</p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Error fetching course or reviews:", error);
    return notFound();
  }
}
