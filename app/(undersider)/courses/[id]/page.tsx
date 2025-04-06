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
  Layers, // Beholdt fra din kode
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
import { FaStar } from "react-icons/fa";
import MapModal from "@/components/MapModal";
import FavoriteButton from "@/components/FavoriteButton"; // Importer FavoriteButton
import { getCurrentUserFavorites } from "@/app/actions/get-user-favorites";


export const dynamic = "force-dynamic";

// --- Korrekt Props Type  ---
export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // --- Await params  ---
  const { id } = await params;
  if (!id) {
    return notFound();
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // --- ENDRET: Parallell datainnhenting (Kurs, Anmeldelser, Favoritter) ---
    const [courseResponse, reviewsResponse, favoritesResult] = await Promise.all([
      fetch(`${baseUrl}/api/courses/${id}`),
      fetch(`${baseUrl}/api/reviews?course_id=${id}`),
      getCurrentUserFavorites() // Henter favoritter samtidig
    ]);

    // 1) Håndter kursdata (din originale logikk)
    if (!courseResponse.ok) {
      console.error(`CoursePage: Kunne ikke hente kurs ${id}. Status: ${courseResponse.status}`); // Bedre feilmelding
      return notFound();
    }
    const course = await courseResponse.json();

    // 2) Håndter anmeldelser (din originale logikk, med fallback)
    let reviews = []; // Definer utenfor if
    if (reviewsResponse.ok) {
      reviews = await reviewsResponse.json();
    } else {
      // La den gå videre selv om anmeldelser feiler, men logg en advarsel
      console.warn(`CoursePage: Kunne ikke hente anmeldelser for ${id}. Status: ${reviewsResponse.status}`);
      // Vurder å returnere notFound() her hvis anmeldelser er kritiske
      // return notFound();
    }

    // *** NYTT: Håndter favorittresultat ***
    const initialUserFavorites = favoritesResult.data || [];
    const isInitiallyFavorite = initialUserFavorites.includes(id);


    // 3) Hent klubbens navn (din originale logikk)
    const clubName = course.club?.name || "Ukjent";

    // Din translateCondition funksjon (uendret)
    function translateCondition(condition: string): string {
      const mapping: Record<string, string> = {
        lightsnow: "Lett snøfall", heavysnow: "Kraftig snøfall", clear: "Klart",
        partlycloudy: "Delvis skyet", cloudy: "Skyet", rain: "Regn", showers: "Byger",
      };
      return mapping[condition] || condition;
    }

    // 4) Hent værdata (din originale logikk, med try/catch for robusthet)
    let weatherData: { temperature: number; windSpeed: number; condition: string; updatedAt: string; } | null = null;
    if (course.latitude && course.longitude) {
      try { // Lagt til try/catch rundt værhenting
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

    // Beregn antall kurver (din originale logikk)
    const numHoles = course.numHoles ?? course.baskets?.length ?? 0;

    // --- Returnerer din JSX, med kun én endring i FavoriteButton ---
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overskrift og lokasjon */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          <p className="text-green-600">{course.location || "Ukjent sted"}</p> {/* La til fallback */}
        </div>

        {/* Beskrivelse */}
        {course.description && (
          <div className="mt-4 mb-8 border-l-4 border-green-500 bg-white shadow-sm rounded-md p-4"> {/* La til mb-8 */}
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
              {course.image ? ( // Sjekk om bildet finnes
                <>
                  <Image
                    src={
                      course.image.startsWith("http")
                        ? course.image
                        : `${baseUrl}${course.image}`
                    }
                    alt={course.name || "Banebilde"} // Fallback
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px" // Lagt til
                    priority // Lagt til
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Favorittknapp - *** ENDRET: Sender inn initialIsFavorite *** */}
                  <FavoriteButton
                    courseId={id}
                    initialIsFavorite={isInitiallyFavorite} // <--- Prop lagt til her
                  />
                </>
               ) : (
                 // Fallback hvis bilde mangler
                 <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                    <Layers className="w-16 h-16 text-gray-400" />
                 </div>
               )}
            </div>

            {/* Knapper (din layout) */}
            <div className="flex flex-col items-center justify-center md:flex-row gap-4 md:gap-8"> {/* Justert gap */}
              <Link href={`/spill?course=${course.id}`} passHref>
                <Button className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2"> {/* justify-center */}
                  <FaPlay className="animate-pulse" /> Start banespill
                </Button>
              </Link>
              {/* Kart-knapp (vis kun hvis koordinater finnes) */}
              {course.latitude && course.longitude && <MapModal courseId={course.id} />}

              <Link href={`/meld-feil/${course.id}`} passHref>
                <Button className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2"> {/* justify-center */}
                  <AlertTriangle className="w-5 h-5" />
                  Meld Feil på Bane
                </Button>
              </Link>
            </div>

            {/* Separator under knappene */}
            <hr className="my-6 border-t border-gray-300" />
          </div>

          {/* HØYRE KOLONNE */}
          <div className="md:w-1/3 flex flex-col gap-6">
            {/* Baneinformasjon-boks (din layout) */}
            <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Baneinformasjon
              </h3>
              {/* Din baneinfo-seksjon (uendret fra din kode) */}
              <div className="space-y-3 text-gray-800 text-sm">
                {course.par != null && ( // Sjekk for null
                  <div className="flex items-center gap-2">
                    <Disc className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Par:</span>
                    <span>{course.par}</span>
                  </div>
                 )}
                <div className="flex items-center gap-2">
                  {/* Du brukte Disc, jeg bruker Layers her for variasjon, men endre gjerne tilbake */}
                  <Layers className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Antall kurver:</span>
                  <span>{numHoles > 0 ? numHoles : 'Ukjent'}</span>
                </div>
                {/* Antall Tee (uendret fra din kode) */}
                {course.start?.length > 0 && ( // Sjekk at array finnes og har elementer
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Antall Tee:</span>
                    <span>{course.start.length} punkter</span>
                  </div>
                )}
                {/* OB Soner (uendret fra din kode) */}
                {course.obZones?.length > 0 && ( // Sjekk at array finnes og har elementer
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">OB-soner:</span>
                    <span>{course.obZones.length} soner</span>
                  </div>
                )}
                {/* Banelengde (uendret fra din kode, la til null sjekk) */}
                {course.totalDistance != null && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Banelengde:</span>
                    {/* Bruker toFixed(0) for hele meter */}
                    <span>{course.totalDistance.toFixed(0)} m</span>
                  </div>
                )}
                {/* Rating (uendret fra din kode, la til null sjekk for rating) */}
                {course.averageRating != null && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Vurdering:</span> {/* Endret tekst */}
                     <div className="flex items-center gap-1 whitespace-nowrap">
                       {/* Din stjernevisning med FaStar */}
                       {Array.from({ length: 5 }, (_, i) => (
                         <FaStar
                           key={i}
                           className={i < Math.round(course.averageRating ?? 0) ? "text-yellow-400" : "text-gray-300"}
                         />
                       ))}
                       <span className="text-sm text-gray-600 ml-1">
                         ({course.totalReviews ?? 0}) {/* Viser antall */}
                       </span>
                     </div>
                  </div>
                )}
                {/* Separator (uendret) */}
                <hr className="my-4 border-t border-gray-200" />
                {/* Tilleggsinfo (uendret fra din kode) */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tilleggsinfo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Baneeier:</span>
                      <span className="text-gray-700">{clubName}</span> {/* Normal farge */}
                    </div>
                    {/* Beholdt disse som "Ukjent" som i din kode */}
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

            {/* Værdata-boks (din layout) */}
            {weatherData && (
              <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-md text-gray-800">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Lokalt Vær {/* Endret tittel */}
                </h3>
                <div className="flex items-center gap-2">
                  <Sun className="w-6 h-6 text-yellow-500" />
                  <p className="text-sm">
                    Temp:{" "} {/* Kortere */}
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
                  Oppdatert: {new Date(weatherData.updatedAt).toLocaleString('no-NO', { hour: '2-digit', minute: '2-digit'})} {/* Kun klokkeslett */}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Anmeldelser (din layout) */}
        <div className="mt-12"> {/* Økt margin */}
          <h2 className="text-2xl font-bold mb-6 text-white">Anmeldelser</h2>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(
                (review: {
                  id: string; rating: number; comment: string; createdAt?: string;
                  user?: { name?: string; image?: string; };
                }) => (
                  // Din anmeldelses-styling
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
          {/* Skriv ny anmeldelse */}
          <div className="mt-8">
            <WriteReview courseId={course.id} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`❌ Error fetching data for CoursePage ID ${id}:`, error); // Log ID
    return notFound();
  }
}