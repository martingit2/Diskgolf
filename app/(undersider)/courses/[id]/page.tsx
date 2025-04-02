// app/(protected)/courses/[id]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaPlay, FaStar } from "react-icons/fa";

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
  AlertTriangle,
} from "lucide-react";
import WriteReview from "@/components/WriteReview";
import MapModal from "@/components/MapModal";
import FavoriteButton from "@/components/FavoriteButton";
import { getCurrentUserFavorites } from "@/app/actions/get-user-favorites";


export const dynamic = "force-dynamic";

// Helper function (uendret)
function translateCondition(condition: string): string {
  const mapping: Record<string, string> = {
    lightsnow: "Lett snøfall", heavysnow: "Kraftig snøfall", clear: "Klart",
    partlycloudy: "Delvis skyet", cloudy: "Skyet", rain: "Regn", showers: "Byger",
  };
  return mapping[condition] || condition;
}

// --- Props type som matcher ditt fungerende eksempel ---
export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>; // <--- Korrigert til Promise
}) {
  // --- Vent på at Promise resolvere ---
  const { id } = await params; // <--- Bruk await her
  if (!id) {
    console.log("CoursePage: ID mangler i params etter await.");
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

    // 2) Håndter anmeldelser
    let reviews = [];
    if (reviewsResponse.ok) {
        reviews = await reviewsResponse.json();
    } else {
        console.warn(`CoursePage: Kunne ikke hente anmeldelser for ${id}. Status: ${reviewsResponse.status}`);
    }

    // 3) Håndter favoritter
    const initialUserFavorites = favoritesResult.data || [];
    const isInitiallyFavorite = initialUserFavorites.includes(id);

    // Hent klubbnavn
    const clubName = course.club?.name || "Ukjent";

    // 4) Hent værdata
    let weatherData: { temperature: number; windSpeed: number; condition: string; updatedAt: string } | null = null;
    if (course.latitude && course.longitude) {
      try {
        const weatherResponse = await fetch(`${baseUrl}/api/weather?lat=${course.latitude}&lon=${course.longitude}`);
        if (weatherResponse.ok) {
          weatherData = await weatherResponse.json();
        } else {
            console.warn(`CoursePage: Kunne ikke hente vær for ${id}. Status: ${weatherResponse.status}`);
        }
      } catch (weatherError) {
          console.error(`CoursePage: Feil ved henting av vær for ${id}:`, weatherError);
      }
    }

    // Beregn antall kurver
    const numHoles = course.numHoles ?? course.baskets?.length ?? 0;

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overskrift og lokasjon */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          <p className="text-gray-600">{course.location || "Ukjent sted"}</p>
        </div>

         {/* Beskrivelse */}
         {course.description && (
          <div className="mt-4 mb-8 border-l-4 border-green-500 bg-white shadow-sm rounded-md p-4">
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>
        )}

        {/* To kolonner */}
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* VENSTRE KOLONNE */}
          <div className="md:w-2/3 flex flex-col gap-6">
            {/* Bilde Container */}
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-lg group">
              {course.image ? (
                <>
                  <Image
                    src={
                      course.image.startsWith("http")
                        ? course.image
                        : `${baseUrl}${course.image}`
                    }
                    alt={course.name || "Banebilde"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <FavoriteButton
                    courseId={id}
                    initialIsFavorite={isInitiallyFavorite}
                  />
                </>
              ) : (
                 <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                    <Layers className="w-16 h-16 text-gray-400" />
                 </div>
              )}
            </div>

           {/* Knapper */}
            <div className="flex flex-col items-center justify-center md:flex-row gap-4 md:gap-8">
              <Link href={`/spill?course=${course.id}`} passHref>
                <Button className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2">
                  <FaPlay className="animate-pulse" /> Start banespill
                </Button>
              </Link>
              {course.latitude && course.longitude && <MapModal courseId={course.id} />}
              <Link href={`/meld-feil/${course.id}`} passHref>
                <Button className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Meld Feil på Bane
                </Button>
              </Link>
            </div>
            <hr className="my-6 border-t border-gray-300" />
          </div>

          {/* HØYRE KOLONNE */}
          <div className="md:w-1/3 flex flex-col gap-6">
            {/* Baneinformasjon-boks */}
            <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Baneinformasjon
              </h3>
               <div className="space-y-3 text-gray-800 text-sm">
                 {course.par != null && (
                   <div className="flex items-center gap-2">
                     <Disc className="w-5 h-5 text-gray-500" />
                     <span className="font-medium">Par:</span>
                     <span>{course.par}</span>
                   </div>
                 )}
                 <div className="flex items-center gap-2">
                   <Layers className="w-5 h-5 text-gray-500" />
                   <span className="font-medium">Antall kurver:</span>
                   <span>{numHoles > 0 ? numHoles : 'Ukjent'}</span>
                 </div>
                 {course.totalDistance != null && (
                   <div className="flex items-center gap-2">
                     <Ruler className="w-5 h-5 text-gray-500" />
                     <span className="font-medium">Banelengde:</span>
                     <span>{course.totalDistance.toFixed(0)} m</span>
                   </div>
                 )}
                 {course.averageRating != null && (
                   <div className="flex items-center gap-2">
                     <Star className="w-5 h-5 text-gray-500" />
                     <span className="font-medium">Vurdering:</span>
                     <div className="flex items-center gap-1 whitespace-nowrap">
                       {Array.from({ length: 5 }, (_, i) => (
                         <FaStar
                           key={i}
                           className={i < Math.round(course.averageRating ?? 0) ? "text-yellow-400" : "text-gray-300"}
                         />
                       ))}
                       <span className="text-sm text-gray-600 ml-1">
                         ({course.totalReviews ?? 0})
                       </span>
                     </div>
                   </div>
                 )}
                 <hr className="my-4 border-t border-gray-200" />
                 <div>
                   <h4 className="font-semibold text-gray-900 mb-2">Tilleggsinfo</h4>
                   <div className="space-y-2 text-sm">
                     <div className="flex items-center gap-2">
                       <User className="w-5 h-5 text-gray-500" />
                       <span className="font-medium">Baneeier:</span>
                       <span className="text-gray-700">{clubName}</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

            {/* Værdata-boks */}
            {weatherData && (
              <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-md text-gray-800">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Lokalt Vær
                </h3>
                 <div className="flex items-center gap-2">
                   <Sun className="w-6 h-6 text-yellow-500" />
                   <p className="text-sm">
                     Temp:{" "}
                     <span className="font-medium">{weatherData.temperature}°C</span>
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
                   Oppdatert: {new Date(weatherData.updatedAt).toLocaleString('no-NO', { hour: '2-digit', minute: '2-digit'})}
                 </p>
               </div>
            )}
          </div>
        </div>

        {/* Anmeldelser */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Anmeldelser</h2>
           {reviews.length > 0 ? (
             <div className="space-y-6">
               {reviews.map(
                 (review: {
                   id: string;
                   rating: number;
                   comment: string;
                   createdAt?: string;
                   user?: { name?: string; image?: string; };
                 }) => (
                   <div key={review.id} className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white space-y-3">
                     <div className="flex items-center justify-between flex-wrap gap-2">
                       <div className="flex items-center gap-3">
                         {review.user?.image ? (
                           <Image
                             src={review.user.image}
                             alt={review.user.name || "Bruker"}
                             width={40} height={40}
                             className="w-10 h-10 rounded-full object-cover border border-gray-300"
                           />
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border border-gray-300">
                             <User className="w-5 h-5" />
                           </div>
                         )}
                         <span className="font-semibold text-md text-gray-800">
                           {review.user?.name || "Ukjent bruker"}
                         </span>
                       </div>
                       <div className="flex text-yellow-500">
                         {Array.from({ length: 5 }).map((_, index) => (
                           <FaStar
                             key={index}
                             className={`text-md ${index < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                           />
                         ))}
                       </div>
                     </div>
                     {review.comment && (
                       <p className="text-gray-700 text-sm leading-relaxed border-l-2 border-green-400 pl-3 italic">
                         "{review.comment}"
                       </p>
                     )}
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
             <p className="text-gray-500 italic">Ingen anmeldelser er skrevet for denne banen enda.</p>
           )}
           {/* Husk at <Toaster /> fra react-hot-toast må ligge i layout.tsx */}
           <div className="mt-8">
            <WriteReview courseId={course.id} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`❌ Error fetching data for CoursePage ${params}:`, error); // Log hele params hvis await feiler
    return notFound();
  }
}