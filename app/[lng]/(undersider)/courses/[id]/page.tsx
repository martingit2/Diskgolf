// app/(protected)/courses/[id]/page.tsx
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
import FavoriteButton from "@/components/FavoriteButton";
import { getCurrentUserFavorites } from "@/app/actions/get-user-favorites";
import { ReportErrorModal } from '@/components/ReportErrorModal';

export const dynamic = "force-dynamic";

// --- Korrekt Props Type ---
export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // --- Await params ---
  const { id } = await params;
  if (!id) {
    return notFound();
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // --- Parallell datainnhenting ---
    const [courseResponse, reviewsResponse, favoritesResult] = await Promise.all([
      fetch(`${baseUrl}/api/courses/${id}`),
      fetch(`${baseUrl}/api/reviews?course_id=${id}`),
      getCurrentUserFavorites()
    ]);

    // 1) Håndter kursdata
    if (!courseResponse.ok) {
      console.error(`CoursePage: Kunne ikke hente kurs ${id}. Status: ${courseResponse.status}`);
      return notFound();
    }
    const course = await courseResponse.json();

    if (!course || !course.name) {
        console.error(`CoursePage: Manglende data for kurs ${id}.`);
        return notFound();
    }

    // 2) Håndter anmeldelser
    let reviews = [];
    if (reviewsResponse.ok) {
      reviews = await reviewsResponse.json();
    } else {
      console.warn(`CoursePage: Kunne ikke hente anmeldelser for ${id}. Status: ${reviewsResponse.status}`);
    }

    // 3) Håndter favorittresultat
    const initialUserFavorites = favoritesResult.data || [];
    const isInitiallyFavorite = initialUserFavorites.includes(id);

    // 4) Hent klubbens navn
    const clubName = course.club?.name || "Ukjent klubb";

    // 5) Værdata-funksjon
    function translateCondition(condition: string): string {
      const mapping: Record<string, string> = {
        lightsnow: "Lett snøfall", heavysnow: "Kraftig snøfall", clear: "Klart",
        partlycloudy: "Delvis skyet", cloudy: "Skyet", rain: "Regn", showers: "Byger",
      };
      return mapping[condition?.toLowerCase()] || condition || "Ukjent";
    }

    // 6) Hent værdata
    let weatherData: { temperature: number; windSpeed: number; condition: string; updatedAt: string; } | null = null;
    if (course.latitude && course.longitude) {
      try {
          const weatherResponse = await fetch(`${baseUrl}/api/weather?lat=${course.latitude}&lon=${course.longitude}`);
          if (weatherResponse.ok) {
              weatherData = await weatherResponse.json();
          } else {
              console.warn(`CoursePage: Kunne ikke hente vær for ${id}. Status: ${weatherResponse.status}`);
          }
      } catch(weatherError) {
          console.error(`CoursePage: Feil ved henting av vær for ${id}`, weatherError);
      }
    }

    // 7) Beregn antall kurver
    const numHoles = course.numHoles ?? course.baskets?.length ?? 0;

    // --- Returnerer JSX ---
    return (
      // Ytterste container forblir hvit
      <div className="max-w-6xl mx-auto px-4 py-8 bg-white rounded-lg shadow-md">
        {/* Overskrift og lokasjon */}
        <div className="mb-6 border-b pb-4">
          <h1 className="text-4xl font-bold text-gray-800">{course.name}</h1>
          <p className="text-lg text-green-700 mt-1">{course.location || "Ukjent sted"}</p>
        </div>

        {/* Beskrivelse */}
        {course.description && (
          // ----- ENDRET HER: lagt til bg-gray-50 -----
          <div className="mt-4 mb-8 border-l-4 border-green-500 bg-gray-50 shadow-sm rounded-md p-5">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Beskrivelse</h2>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>
        )}

        {/* To kolonner */}
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* VENSTRE KOLONNE */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            {/* Bilde (ingen endring her) */}
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-xl group">
              {course.image ? (
                 <>
                  <Image
                    src={ course.image.startsWith("http") ? course.image : `${baseUrl}${course.image}` }
                    alt={`Bilde av ${course.name}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <FavoriteButton courseId={id} initialIsFavorite={isInitiallyFavorite} />
                </>
               ) : (
                 <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded-lg text-gray-500">
                    <Layers className="w-20 h-20" />
                    <span className="ml-2">Bilde mangler</span>
                 </div>
               )}
            </div>

            {/* Knapper under bildet (ingen endring her) */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md flex-grow sm:flex-grow-0">
                 <Link href={`/spill?course=${course.id}`}>
                    <FaPlay className="mr-2 h-5 w-5" /> Start Banespill
                 </Link>
              </Button>
              {course.latitude && course.longitude && ( <MapModal courseId={course.id} /> )}
              <ReportErrorModal courseId={id} courseName={course.name} />
            </div>

            {/* Separator */}
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* HØYRE KOLONNE */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            {/* Baneinformasjon */}
            {/* ----- ENDRET HER: lagt til bg-gray-50 ----- */}
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Baneinformasjon
              </h3>
              <div className="space-y-3 text-gray-700">
                 {/* Par */}
                {course.par != null && (
                  <div className="flex items-center gap-3">
                    <Disc className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="font-medium">Par:</span>
                    <span>{course.par}</span>
                  </div>
                 )}
                 {/* Antall kurver */}
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span className="font-medium">Antall kurver:</span>
                  <span>{numHoles > 0 ? numHoles : 'Ukjent'}</span>
                </div>
                 {/* Antall Tee */}
                {course.start?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="font-medium">Antall Tee:</span>
                    <span>{course.start.length} {course.start.length === 1 ? 'punkt' : 'punkter'}</span>
                  </div>
                )}
                 {/* OB Soner */}
                {course.obZones?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="font-medium">OB-soner:</span>
                    <span>{course.obZones.length} {course.obZones.length === 1 ? 'sone' : 'soner'}</span>
                  </div>
                )}
                 {/* Banelengde */}
                {course.totalDistance != null && course.totalDistance > 0 && (
                  <div className="flex items-center gap-3">
                    <Ruler className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="font-medium">Banelengde:</span>
                    <span>{course.totalDistance.toFixed(0)} m</span>
                  </div>
                )}
                 {/* Rating */}
                {course.averageRating != null && (
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span className="font-medium">Vurdering:</span>
                     <div className="flex items-center gap-1">
                       {Array.from({ length: 5 }, (_, i) => (
                         <FaStar
                           key={i}
                           className={i < Math.round(course.averageRating ?? 0) ? "text-yellow-400" : "text-gray-300"}
                         />
                       ))}
                       <span className="text-sm text-gray-500 ml-1">
                         ({course.totalReviews ?? 0} {course.totalReviews === 1 ? 'anm.' : 'anm.'})
                       </span>
                     </div>
                  </div>
                )}
                <hr className="my-4 border-t border-gray-200" />
                 {/* Tilleggsinfo */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Tilleggsinfo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <span className="font-medium">Baneeier:</span>
                      <span className="text-gray-600">{clubName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Værdata */}
            {weatherData && (
              // ----- ENDRET HER: lagt til bg-gray-50 -----
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-md text-gray-700">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">
                  Lokalt Vær
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span>Temperatur:</span>
                    <span className="font-medium">{weatherData.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-blue-500 flex-shrink-0" />
                     <span>Vind:</span>
                    <span className="font-medium">{weatherData.windSpeed} m/s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-gray-500 flex-shrink-0" />
                     <span>Forhold:</span>
                    <span className="font-medium capitalize">
                      {translateCondition(weatherData.condition)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-right">
                  Oppdatert: {new Date(weatherData.updatedAt).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit'})}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Anmeldelser */}
        <div className="mt-12 pt-6 border-t">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Anmeldelser</h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(
                (review: {
                  id: string; rating: number; comment?: string | null; createdAt?: string;
                  user?: { name?: string | null; image?: string | null; };
                }) => (
                  // ----- ENDRET HER: lagt til bg-gray-50 -----
                  <div key={review.id} className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50 space-y-3">
                    {/* Anmeldelse Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        {/* Brukerbilde */}
                        {review.user?.image ? (
                          <Image
                            src={review.user.image}
                            alt={review.user.name || "Bruker"}
                            width={40} height={40}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-2 border-gray-300">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                         {/* Brukernavn */}
                        <span className="font-semibold text-md text-gray-800">
                          {review.user?.name || "Anonym bruker"}
                        </span>
                      </div>
                      {/* Stjerner */}
                      <div className="flex text-yellow-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <FaStar
                            key={index}
                            className={`text-xl ${index < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                     {/* Kommentar */}
                    {review.comment && (
                      // Denne kan forbli hvit eller få bg-white for ekstra kontrast mot bg-gray-50
                      <blockquote className="text-gray-700 text-base leading-relaxed border-l-4 border-green-400 pl-4 py-2 italic bg-white rounded-r-md">
                        "{review.comment}"
                      </blockquote>
                    )}
                     {/* Tidsstempel */}
                    {review.createdAt && (
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        Skrevet {new Date(review.createdAt).toLocaleDateString("no-NO", { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-5">Ingen anmeldelser er skrevet for denne banen enda.</p>
          )}
          {/* Skriv ny anmeldelse */}
          {/* ----- ENDRET HER: lagt til bg-gray-50 ----- */}
          <div className="mt-10 pt-6 border-t bg-gray-50 p-6 rounded-lg shadow-sm">
             <h3 className="text-2xl font-semibold mb-4 text-gray-800">Skriv din anmeldelse</h3>
            <WriteReview courseId={id} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`❌ Error fetching data for CoursePage ID ${id}:`, error);
    return notFound();
  }
}