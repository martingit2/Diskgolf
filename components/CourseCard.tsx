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

  const shouldShowReadMore = course.description.length > 100;

  return (
    <Card className="shadow-lg border border-gray-200 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden">
      
      {/* 📌 Bildeseksjon med fancy effekter */}
      <div className="relative">
        {/* 🔥 Gradient-overlay og myk skygge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-transparent rounded-t-xl pointer-events-none"></div>

        <Image
          src={course.image || "/courses/default-course.png"}
          alt={course.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover rounded-t-xl shadow-lg"
        />

        {/* 💎 Fancy favoritt-knapp med glass-effekt */}
        <button
          onClick={() => onToggleFavorite(course.id)}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full backdrop-blur-md hover:bg-white transition shadow-md"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
        </button>
      </div>

      <CardContent className="flex flex-col flex-grow p-6 bg-white">
        {/* 📌 Tittel + Styling */}
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">{course.name}</CardTitle>
          <hr className="my-3 border-t-2 border-gray-300" />
        </CardHeader>

        {/* 📌 Informasjon */}
        <div className="space-y-2 flex-grow">
          <div className="flex text-sm justify-between text-gray-600">
            <p className="font-medium">Sted:</p>
            <p>{course.location}</p>
          </div>
          <div className="flex text-sm justify-between text-gray-600">
            <p className="font-medium">Par:</p>
            <p>{course.par}</p>
          </div>
          <div className="flex text-sm justify-between text-gray-600">
            <p className="font-medium">Vanskelighetsgrad:</p>
            <p className={course.difficulty === "Lett" ? "text-green-500" : course.difficulty === "Middels" ? "text-yellow-500" : "text-red-500"}>
              {course.difficulty || "Ukjent"}
            </p>
          </div>
          <div className="flex text-sm justify-between text-gray-600">
            <p className="font-medium">Antall kurver:</p>
            <p>{course.holes.length}</p>
          </div>
          <div className="flex text-sm justify-between text-gray-600">
            <p className="font-medium">Total avstand:</p>
            <p>{course.totalDistance !== undefined ? `${course.totalDistance.toFixed(2)} m` : "Ukjent"}</p>
          </div>

          {/* 📌 Beskrivelse – Bedre mellomrom + lesbarhet */}
          <div className="flex text-sm mt-3">
            <p className="mr-2 font-medium">Beskrivelse:</p>
            <div className="flex flex-col">
              <p className={`text-gray-700 ${!showFullDescription && shouldShowReadMore ? "line-clamp-2" : ""}`}>
                {course.description}
              </p>
              {shouldShowReadMore && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-500 hover:underline text-sm mt-1"
                >
                  {showFullDescription ? "Vis mindre" : "Les mer"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📌 Sentralisert anmeldelser */}
        <div className="mt-6 flex flex-col items-center text-center">
          <ReviewForm courseId={course.id} totalReviews={course.totalReviews} averageRating={course.averageRating} />
        </div>

        {/* 📌 Knapper med bedre spacing */}
        <div className="mt-6">
          <div className="flex flex-col gap-4">
            <Link href={`/courses/${course.id}`} passHref>
              <Button className="w-full py-4 px-10 bg-gray-900 text-white font-semibold rounded-lg text-lg shadow-md hover:bg-gray-800 transition-all duration-300">
                Se detaljer
              </Button>
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
