// src/components/CourseCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Heart, Loader2, MapPin, Target, Gauge, Ruler, Info } from "lucide-react"; // Importer ikoner
import ReviewForm from "@/app/[lng]/(protected)/_components/ReviewForm"; // Sjekk stien hvis nødvendig
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaPlay } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { cn } from "@/app/lib/utils"; // Importer cn for conditional classNames

// Type (uendret)
type Course = {
  id: string;
  name: string;
  location?: string | null;
  description?: string | null;
  par?: number | null;
  image?: string | null;
  difficulty?: string | null;
  averageRating?: number | null;
  totalReviews?: number | null;
  totalDistance?: number | null;
  baskets?: unknown[];
  numHoles?: number | null;
};

// Props (uendret)
type CourseCardProps = {
  course: Course;
  isFavorite: boolean;
  onToggleFavorite: (courseId: string) => void;
  isToggling: boolean;
};

export function CourseCard({ course, isFavorite, onToggleFavorite, isToggling }: CourseCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const router = useRouter();

  const numHoles = course.numHoles ?? (Array.isArray(course.baskets) ? course.baskets.length : 0);
  const shouldShowReadMore = course.description && course.description.length > 100;

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isToggling) {
          onToggleFavorite(course.id);
          toast.success(isFavorite ? "Fjerner fra favoritter..." : "Legger til i favoritter...");
      }
  };

  const getDifficultyClass = (difficulty?: string | null) => {
    switch (difficulty) {
        case "Lett": return "text-green-600 dark:text-green-400";
        case "Middels": return "text-yellow-600 dark:text-yellow-400";
        case "Vanskelig": return "text-red-600 dark:text-red-400";
        default: return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <Card className="shadow-lg border border-gray-200 dark:border-gray-700/50 flex flex-col transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl dark:hover:shadow-gray-900/60 rounded-xl overflow-hidden h-full bg-white dark:bg-gray-800">
      {/* Bilde og Favoritt */}
      <div className="relative">
        <Image
          src={course.image || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"}
          alt={course.name || "Banebilde"}
          width={350}
          height={200}
          className="w-full h-48 object-cover"
          priority={false}
          unoptimized={process.env.NODE_ENV === 'development'}
        />
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className={cn(
            "absolute top-3 right-3 p-1.5 bg-white/80 dark:bg-gray-900/70 rounded-full backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900/90 transition shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:ring-offset-gray-800",
            isToggling && 'cursor-not-allowed opacity-60'
          )}
          aria-label={isFavorite ? "Fjern fra favoritter" : "Legg til i favoritter"}
        >
          {isToggling ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500 dark:text-gray-400" />
          ) : (
            <Heart className={cn("w-5 h-5 transition-colors", isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 dark:text-gray-500 hover:text-red-500")} />
          )}
        </button>
      </div>

      {/* Kortinnhold */}
      <CardContent className="flex flex-col flex-grow p-5 md:p-6">
        {/* Header Seksjon */}
        <CardHeader className="p-0 mb-4">
  <Link href={`/courses/${course.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded">
    <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
      {course.name || "Ukjent Bane"}
    </CardTitle>
  </Link>
  {/* Legg til separator under banenavn */}
  <div className="border-b-4 border-green-500 dark:border-gray-700 w-full my-2"></div>
  {course.location && (
    <>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
        <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
        {course.location}
      </p>

    </>
  )}
</CardHeader>

        {/* Statistikk-Grid */}
        <div className="my-4 grid grid-cols-3 gap-x-3 text-center text-xs text-gray-600 dark:text-gray-400 border-t border-b border-gray-100 dark:border-gray-700 py-3">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-base text-gray-800 dark:text-gray-200">
                {numHoles > 0 ? numHoles : '-'}
              </span>
              <span className="text-[10px] uppercase tracking-wider mt-0.5">Hull</span>
            </div>
            <div className="flex flex-col items-center border-l border-r border-gray-100 dark:border-gray-700 px-2">
              <span className="font-semibold text-base text-gray-800 dark:text-gray-200">
                {course.par ?? '-'}
              </span>
              <span className="text-[10px] uppercase tracking-wider mt-0.5">Par</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-base text-gray-800 dark:text-gray-200">
                {course.totalDistance != null && course.totalDistance > 0 ? `${Math.round(course.totalDistance)}m` : '-'}
              </span>
              <span className="text-[10px] uppercase tracking-wider mt-0.5">Lengde</span>
            </div>
        </div>

        {/* Vanskelighetsgrad - MIDTSTILT */}
        {course.difficulty && (
             // --- ✨ KORREKSJON HER: Lagt til flex justify-center ✨ ---
             <div className="flex items-center justify-left text-sm text-gray-600 dark:text-gray-400 mb-4">
                 <Gauge className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="font-medium mr-1">Nivå:</span>
                <span className={cn("font-semibold", getDifficultyClass(course.difficulty))}>
                    {course.difficulty}
                </span>
             </div>
           )}
{/* Beskrivelse */}
{course.description && (
    <div className="text-sm text-gray-700 dark:text-gray-300 flex-grow mb-4">
        <div className="border-l-4 border-green-500/50 pl-3"> {/* Legg til denne linjen */}
            <p className={cn(!showFullDescription && shouldShowReadMore ? "line-clamp-3" : "")}>
                {course.description}
            </p>
            {shouldShowReadMore && (
                <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm mt-1 font-medium"
                >
                    {showFullDescription ? "Vis mindre" : "Les mer"}
                </button>
            )}
        </div>
    </div>
)}
        {/* Anmeldelser (Stjerner) - MIDTSTILT */}
        {(course.totalReviews != null || course.averageRating != null) && (
          // --- ✨ KORREKSJON HER: Lagt til flex justify-center ✨ ---
          // mt-auto dytter denne og knappene ned
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-center">
            <ReviewForm
              courseId={course.id}
              totalReviews={course.totalReviews ?? 0}
              averageRating={course.averageRating ?? 0}
              // Pass eventuelle andre props ReviewForm trenger
            />
          </div>
        )}

        {/* Knapper (alltid nederst) */}
        <div className="mt-5">
          <div className="flex flex-col gap-3">
            <Link href={`/courses/${course.id}`} passHref legacyBehavior>
                <a className="block w-full">
                    <Button variant="outline" className="w-full bg-gray-900 text-white hover:-text-white hover:bg-emerald-700 ">
                        Se detaljer
                    </Button>
                </a>
            </Link>
            <Button
              onClick={() => router.push(`/spill?course=${course.id}`)}
              className="w-full bg-green-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
            >
              <FaPlay /> Start spill
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}