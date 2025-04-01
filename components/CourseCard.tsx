// src/components/CourseCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Heart, Loader2 } from "lucide-react"; // Importer Loader2 for spinner
import ReviewForm from "@/app/(protected)/_components/ReviewForm"; // Sjekk stien
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Shadcn UI Button
import { FaPlay } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Type for kursdata - bør matche dataen som sendes inn
type Course = {
  id: string; // ID-type må matche den brukt i store/server action
  name: string;
  location?: string;
  description?: string; // Valgfri
  par?: number;
  image?: string;
  difficulty?: string;
  averageRating?: number; // Gjør disse valgfrie hvis de kan mangle
  totalReviews?: number;  // Gjør disse valgfrie hvis de kan mangle
  totalDistance?: number;
  baskets?: unknown[]; // Antar array
};

// Props for komponenten, nå med isToggling
type CourseCardProps = {
  course: Course;
  isFavorite: boolean;
  onToggleFavorite: (courseId: string) => void;
  isToggling: boolean; // NY PROP: Status for pågående favoritt-oppdatering
};

export function CourseCard({ course, isFavorite, onToggleFavorite, isToggling }: CourseCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const router = useRouter();

  // FIKSET: Sjekk om description finnes FØR .length
  const shouldShowReadMore = course.description
    ? course.description.length > 100
    : false;

  // Beregn antall kurver
  const numHoles = Array.isArray(course.baskets) ? course.baskets.length : 0;

  // Handler for favorittklikk (med sjekk for isToggling)
  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isToggling) { // Utfør kun hvis ikke en oppdatering allerede pågår
          onToggleFavorite(course.id);
      }
  };

  // Hjelpefunksjon for vanskelighetsgrad-farge (lik din originale logikk)
   const getDifficultyClass = (difficulty?: string) => {
    switch (difficulty) {
        case "Lett": return "text-green-500";
        case "Middels": return "text-yellow-500";
        case "Vanskelig": // Antar at 'Vanskelig' er den siste
        default: return "text-red-500"; // Bruk rød som default hvis ikke Lett/Middels
    }
   };

  return (
    // Bruker dine originale Card klasser
    <Card className="shadow-lg border border-gray-200 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden h-full">
      {/* Bildeseksjon (dine originale klasser) */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-transparent rounded-t-xl pointer-events-none"></div>
        <Image
          src={course.image || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"}
          alt={course.name || "Banebilde"} // La til fallback for alt-tekst
          width={300} // Beholdt dine dimensjoner
          height={200}
          className="w-full h-48 object-cover rounded-t-xl shadow-lg" // Beholdt dine klasser
          priority={false} // Kan settes til true om nødvendig for LCP
        />

        {/* Din originale favoritt-knapp, men med isToggling-logikk */}
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling} // Deaktiveres under oppdatering
          // Beholder dine originale klasser + legger til deaktivert-stil
          className={`absolute top-3 right-3 p-2 bg-white/80 rounded-full backdrop-blur-md hover:bg-white transition shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isToggling ? 'cursor-not-allowed opacity-60' : '' // Stil for deaktivert tilstand
          }`}
          aria-label={isFavorite ? "Fjern fra favoritter" : "Legg til i favoritter"}
        >
          {isToggling ? (
             // Vis spinner når isToggling er true
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : (
            // Vis hjerteikon ellers (med din originale fargelogikk)
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"}`} />
          )}
        </button>
      </div>

      {/* Kortinnhold (dine originale klasser) */}
      <CardContent className="flex flex-col flex-grow p-6 bg-white">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">{course.name || "Ukjent Bane"}</CardTitle>
          <hr className="my-3 border-t-2 border-gray-300" />
        </CardHeader>

        {/* Informasjon (din originale struktur og klasser) */}
        <div className="space-y-2 flex-grow">
          {course.location && (
            <div className="flex text-sm justify-between text-gray-600">
              <p className="font-medium">Sted:</p>
              <p>{course.location}</p>
            </div>
          )}
          {course.par != null && (
            <div className="flex text-sm justify-between text-gray-600">
              <p className="font-medium">Par:</p>
              <p>{course.par}</p>
            </div>
          )}
           {course.difficulty && (
             <div className="flex text-sm justify-between text-gray-600">
                <p className="font-medium">Vanskelighetsgrad:</p>
                {/* Bruker din originale fargeklasse-logikk */}
                <p className={getDifficultyClass(course.difficulty)}>
                    {course.difficulty}
                </p>
             </div>
           )}
          <div className="flex text-sm justify-between text-gray-600">
            <p className="font-medium">Antall kurver:</p>
            <p>{numHoles > 0 ? numHoles : "Ukjent"}</p>
          </div>
          {course.totalDistance != null && (
            <div className="flex text-sm justify-between text-gray-600">
              <p className="font-medium">Banelengde:</p>
              {/* Beholdt din .toFixed(2) */}
              <p>{`${course.totalDistance.toFixed(2)} m`}</p>
            </div>
           )}

          {/* Beskrivelse (din originale struktur og klasser) */}
          {course.description && ( // Vis kun hvis beskrivelse finnes
            <div className="flex text-sm mt-3">
              <p className="mr-2 font-medium">Beskrivelse:</p>
              <div className="flex flex-col">
                <p className={`text-gray-700 ${!showFullDescription && shouldShowReadMore ? "line-clamp-2" : ""}`}>
                  {course.description}
                </p>
                {shouldShowReadMore && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-500 hover:underline text-sm mt-1 self-start" // La til self-start
                  >
                    {showFullDescription ? "Vis mindre" : "Les mer"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sentralisert anmeldelser (din originale struktur og klasser) */}
        {(course.totalReviews != null || course.averageRating != null) && (
          <div className="mt-6 flex flex-col items-center text-center">
            <ReviewForm
              courseId={course.id}
              totalReviews={course.totalReviews ?? 0}
              averageRating={course.averageRating ?? 0}
            />
          </div>
        )}

        {/* Knapper (din originale struktur og klasser) */}
        <div className="mt-auto pt-4"> {/* La til mt-auto og pt-4 for å skyve ned og gi luft */}
          <div className="flex flex-col gap-4">
            {/* Bruker legacyBehavior for å unngå hydration errors med custom Button inni Link */}
            <Link href={`/courses/${course.id}`} passHref legacyBehavior>
                <a className="block w-full"> {/* <a> tag for full bredde */}
                    <Button className="w-full py-4 px-10 bg-gray-900 text-white font-semibold rounded-lg text-lg shadow-md hover:bg-gray-800 transition-all duration-300">
                        Se detaljer
                    </Button>
                </a>
            </Link>
            <Button
              onClick={() => router.push(`/spill?course=${course.id}`)}
              className="w-full py-4 px-10 bg-green-500 text-white font-semibold rounded-lg text-lg shadow-md hover:bg-green-600 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <FaPlay className="animate-pulse" /> Start banespill
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}