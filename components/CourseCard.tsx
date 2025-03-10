"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Heart } from "lucide-react";
import ReviewForm from "@/app/(protected)/_components/ReviewForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaPlay } from "react-icons/fa";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  name: string;
  location: string;
  description: string;
  par: number;
  image?: string;
  difficulty?: string;
  averageRating: number;
  totalReviews: number;
  holes: { distance: number }[];
  totalDistance?: number;
  club?: { name: string; logoUrl: string };
};

type CourseCardProps = {
  course: Course;
  isFavorite: boolean;
  onToggleFavorite: (courseId: string) => void;
};

export function CourseCard({ course, isFavorite, onToggleFavorite }: CourseCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const router = useRouter();

  // Sjekk om beskrivelsen er lang nok til å trenge en "Les mer"-knapp
  const shouldShowReadMore = course.description.length > 100;

  return (
    <Card className="shadow-2xl border border-solid border-gray-200 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="relative">
        <div className="border-4 border-gray-100 rounded-lg overflow-hidden">
          <Image
            src={course.image || "/courses/default-course.png"}
            alt={course.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
        </div>
        <button
          onClick={() => onToggleFavorite(course.id)}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full backdrop-blur-sm hover:bg-white/90 transition"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
        </button>
      </div>

      <CardContent className="flex flex-col flex-grow p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-600 via-green-500 to-green-600 bg-clip-text">
            {course.name}
          </CardTitle>
          <hr className="my-3 border-t-2 border-gray-900" />
          {course.club && (
            <div className="flex items-center gap-2 mt-2">
              <Image
                src={course.club.logoUrl || "/clubs/default-club.png"}
                alt={course.club.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm text-gray-600">{course.club.name}</span>
            </div>
          )}
        </CardHeader>

        <div className="space-y-2 flex-grow">
          <div className="flex text-sm justify-between">
            <p><strong>Sted:</strong></p>
            <p>{course.location}</p>
          </div>
          <div className="flex text-sm justify-between">
            <p><strong>Par:</strong></p>
            <p>{course.par}</p>
          </div>
          <div className="flex text-sm justify-between">
            <p><strong>Vanskelighetsgrad:</strong></p>
            <p
              className={`italic ${
                course.difficulty === "Lett"
                  ? "text-green-500"
                  : course.difficulty === "Middels"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {course.difficulty || "Ukjent"}
            </p>
          </div>
          <div className="flex text-sm justify-between">
            <p><strong>Antall kurver:</strong></p>
            <p>{course.holes.length}</p>
          </div>
          <div className="flex text-sm justify-between">
            <p><strong>Total avstand:</strong></p>
            <p>{course.totalDistance ? `${course.totalDistance} m` : "Ukjent"}</p>
          </div>
          <div className="flex text-sm justify-between">
            <p><strong>Beskrivelse:</strong></p>
            <div>
              <p className={`italic ${!showFullDescription && shouldShowReadMore ? "line-clamp-3" : ""}`}>
                {course.description}
              </p>
              {shouldShowReadMore && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-500 hover:underline"
                >
                  {showFullDescription ? "Vis mindre" : "Les mer"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ReviewForm
            courseId={course.id}
            totalReviews={course.totalReviews}
            averageRating={course.averageRating}
          />
        </div>

        <div className="mt-4">
          <div className="flex flex-col gap-4">
            <Link href={`/courses/${course.id}`} passHref>
              <Button className="w-full py-4 px-10 bg-gray-900 text-white font-semibold rounded-full text-lg shadow-xl hover:scale-105 transition-all duration-300">
                Se detaljer
              </Button>
            </Link>
            <Button
              onClick={() => router.push(`/spill?course=${course.id}`)}
              className="w-full py-4 px-10 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full text-lg shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <FaPlay className="animate-pulse" /> Start banespill
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}