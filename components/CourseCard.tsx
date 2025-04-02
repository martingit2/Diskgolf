// src/components/CourseCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Heart, Loader2 } from "lucide-react";
import ReviewForm from "@/app/(protected)/_components/ReviewForm"; // Sjekk stien
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaPlay } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast'; // <--- Importer toast

// Type (uendret)
type Course = {
  id: string;
  name: string;
  location?: string;
  description?: string;
  par?: number;
  image?: string;
  difficulty?: string;
  averageRating?: number;
  totalReviews?: number;
  totalDistance?: number;
  baskets?: unknown[];
};

// Props (uendret)
type CourseCardProps = {
  course: Course;
  isFavorite: boolean;
  onToggleFavorite: (courseId: string) => void; // Denne kalles for å trigge logikken i parent
  isToggling: boolean; // Denne viser loading state fra parent
};

export function CourseCard({ course, isFavorite, onToggleFavorite, isToggling }: CourseCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const router = useRouter();

  const shouldShowReadMore = course.description
    ? course.description.length > 100
    : false;

  const numHoles = Array.isArray(course.baskets) ? course.baskets.length : 0;

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isToggling) {
          // Kall funksjonen i parent som gjør jobben
          onToggleFavorite(course.id);
          // Vis umiddelbar toast - parent håndterer faktisk suksess/feil
          toast.success(isFavorite ? "Fjerner fra favoritter..." : "Legger til i favoritter...");
      }
  };

  // Hjelpefunksjon (uendret)
   const getDifficultyClass = (difficulty?: string) => {
    switch (difficulty) {
        case "Lett": return "text-green-500";
        case "Middels": return "text-yellow-500";
        case "Vanskelig":
        default: return "text-red-500";
    }
   };

  return (
    <Card className="shadow-lg border border-gray-200 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden h-full">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-transparent rounded-t-xl pointer-events-none"></div>
        <Image
          src={course.image || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"}
          alt={course.name || "Banebilde"}
          width={300}
          height={200}
          className="w-full h-48 object-cover rounded-t-xl shadow-lg"
          priority={false}
        />

        {/* Favorittknapp */}
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className={`absolute top-3 right-3 p-2 bg-white/80 rounded-full backdrop-blur-md hover:bg-white transition shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isToggling ? 'cursor-not-allowed opacity-60' : ''
          }`}
          aria-label={isFavorite ? "Fjern fra favoritter" : "Legg til i favoritter"}
        >
          {isToggling ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : (
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"}`} />
          )}
        </button>
      </div>

      {/* Kortinnhold (uendret) */}
      <CardContent className="flex flex-col flex-grow p-6 bg-white">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">{course.name || "Ukjent Bane"}</CardTitle>
          <hr className="my-3 border-t-2 border-gray-300" />
        </CardHeader>

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
              <p>{`${course.totalDistance.toFixed(2)} m`}</p>
            </div>
           )}

          {course.description && (
            <div className="flex text-sm mt-3">
              <p className="mr-2 font-medium">Beskrivelse:</p>
              <div className="flex flex-col">
                <p className={`text-gray-700 ${!showFullDescription && shouldShowReadMore ? "line-clamp-2" : ""}`}>
                  {course.description}
                </p>
                {shouldShowReadMore && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-500 hover:underline text-sm mt-1 self-start"
                  >
                    {showFullDescription ? "Vis mindre" : "Les mer"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {(course.totalReviews != null || course.averageRating != null) && (
          <div className="mt-6 flex flex-col items-center text-center">
            <ReviewForm
              courseId={course.id}
              totalReviews={course.totalReviews ?? 0}
              averageRating={course.averageRating ?? 0}
            />
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="flex flex-col gap-4">
            <Link href={`/courses/${course.id}`} passHref legacyBehavior>
                <a className="block w-full">
                    <Button className="w-full py-4 px-10 bg-gray-900 text-white font-semibold rounded-lg text-lg shadow-md hover:bg-gray-800 transition-all duration-300">
                        Se detaljer
                    </Button>
                </a>
            </Link>
            <Button
              onClick={() => router.push(`/spill?course=${course.id}`)}
              className="w-full py-4 px-10 bg-green-500 text-white font-semibold rounded-lg text-lg shadow-md hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-3" // Lagt til justify-center
            >
              <FaPlay className="animate-pulse" /> Start banespill
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}