// src/components/MapPopupCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ReviewForm from "@/app/[lng]/(protected)/_components/ReviewForm"; // Dobbeltsjekk sti
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa";

// Interface (uendret)
interface MapPopupCourse {
  id: string;
  name: string;
  location?: string;
  image?: string;
  difficulty?: string;
  averageRating?: number;
  totalReviews?: number;
  totalDistance?: number;
  par?: number;
  numHoles?: number | string;
}

interface MapPopupCardProps {
  course: MapPopupCourse;
}

// Fargefunksjon (uendret)
const getDifficultyClass = (difficulty?: string) => {
  switch (difficulty) {
    case "Lett": return "text-green-500";
    case "Middels": return "text-yellow-500";
    case "Vanskelig": return "text-red-500";
    default: return "text-gray-500";
  }
};

export function MapPopupCard({ course }: MapPopupCardProps) {
  const router = useRouter();

  const displayDistance = course.totalDistance != null ? `${course.totalDistance.toFixed(0)} m` : null;
  const displayPar = course.par != null ? course.par : null;
  const displayNumHoles = course.numHoles;

  const handlePlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    router.push(`/spill?course=${course.id}`);
  };

   const handleDetailsClick = (e: React.MouseEvent | React.TouchEvent) => {
     e.stopPropagation();
     router.push(`/courses/${course.id}`);
   };


  return (
    <Card className="shadow-none border-none flex flex-col overflow-hidden rounded-lg p-0 m-0 bg-transparent">
      {/* Bildecontainer: Bruker relativ posisjonering. Prøver h-36 */}
      <div className="relative w-full h-36 flex-shrink-0"> {/* Juster h-36 ved behov */}
        <Image
          src={course.image || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"}
          alt={course.name || "Banebilde"}
          fill
          sizes="(max-width: 220px) 100vw, 220px" // Basert på din CSS bredde
          className="object-cover rounded-t-lg" // Behold avrunding
          priority={false}
        />
        {/* Mørkere gradient nederst for bedre tekstkontrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none rounded-t-lg"></div>

        {/* *** Header posisjonert ABSOLUTT nederst i bildecontaineren *** */}
        <CardHeader className="absolute bottom-0 left-0 right-0 z-10 p-1.5"> {/* p-1.5 for litt luft */}
          {/* Tittel med hvit tekst */}
          <CardTitle className="text-base font-bold text-white leading-tight drop-shadow-md"> {/* Hvit tekst + skygge */}
            {course.name || "Ukjent Bane"}
          </CardTitle>
          {/* <hr /> er fjernet */}
        </CardHeader>
      </div>

      {/* CardContent starter NÅ, under bildet */}
      {/* Holder denne delen kompakt */}
      <CardContent className="flex flex-col flex-grow p-1 bg-white rounded-b-lg"> {/* p-1 og bg */}

        {/* Info (starter rett under bildet/header-overlay) */}
        <div className="flex-grow text-xs space-y-0 px-1 py-1"> {/* Litt padding top/bottom */}
          {course.location && (
            <div className="flex justify-between text-gray-600 leading-none mb-0">
              <p className="font-medium mr-1 flex-shrink-0">Sted:</p>
              <p className="text-right truncate" title={course.location}>{course.location}</p>
            </div>
          )}
          {displayPar !== null && (
            <div className="flex justify-between text-gray-600 leading-none mb-0">
              <p className="font-medium mr-1 flex-shrink-0">Par:</p>
              <p>{displayPar}</p>
            </div>
          )}
          {course.difficulty && (
            <div className="flex justify-between text-gray-600 leading-none mb-0">
              <p className="font-medium mr-1 flex-shrink-0">Nivå:</p>
              <p className={`${getDifficultyClass(course.difficulty)} font-medium`}>
                {course.difficulty}
              </p>
            </div>
          )}
           {displayNumHoles !== undefined && (
             <div className="flex justify-between text-gray-600 leading-none mb-0">
               <p className="font-medium mr-1 flex-shrink-0">Kurver:</p>
               <p>{displayNumHoles}</p>
             </div>
           )}
          {displayDistance && (
            <div className="flex justify-between text-gray-600 leading-none mb-0">
              <p className="font-medium mr-1 flex-shrink-0">Lengde:</p>
              <p>{displayDistance}</p>
            </div>
          )}
        </div>

        {/* Reviews */}
        {(course.totalReviews != null || course.averageRating != null) && (
          // mt-1 gir litt luft før reviews
          <div className="mt-1 mb-0 flex flex-col items-center text-center px-1">
            <ReviewForm
              courseId={course.id}
              totalReviews={course.totalReviews ?? 0}
              averageRating={course.averageRating ?? 0}
              size="small"
            />
          </div>
        )}

        {/* Knapper */}
        {/* pt-1.5 for litt luft over knappene */}
        <div className="mt-auto pt-1.5 pb-1 px-1 flex flex-col gap-1">
          {/* Se detaljer */}
          <Button
            size="sm"
            className="w-full bg-gray-900 text-white font-semibold rounded-md text-xs py-1 shadow-sm hover:bg-gray-800 transition-all duration-300"
            onClick={handleDetailsClick}
          >
            Se detaljer
          </Button>

          {/* Start spill */}
          <Button
             size="sm"
             className="w-full bg-green-500 text-white font-semibold rounded-md text-xs py-1 shadow-sm hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-1.5"
             onClick={handlePlayClick}
          >
            <FaPlay className="w-2.5 h-2.5" />
             Start spill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}