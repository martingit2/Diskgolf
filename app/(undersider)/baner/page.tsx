/* Filnavn: page.tsx
 * Beskrivelse: Viser en oversikt over disc golf baner med kart, søkefunksjon og filter.
 *
 * Utvikler: Said Hussain Khawajazada, Martin Pettersen
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Map from "@/components/Map";
import ReviewForm from "@/app/(protected)/_components/ReviewForm";
import Link from "next/link";
import { Heart } from "lucide-react"; // Importer et hjerte-ikon for favoritter
import { toggleFavorite } from "@/app/actions/favorites";
import { currentUser } from "@/app/lib/auth";


export default function BaneoversiktPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]); // Tilstand for favorittbaner

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
    holes: { distance: number }[]; // Antall kurver og avstand
    totalDistance?: number; // Total avstand for banen
    club?: { name: string; logoUrl: string }; // Klubbinformasjon
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log("🔍 Fetching courses from API...");
        const response = await fetch("/api/courses");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch courses");
        }

        // Beregn total avstand for hver bane
        const coursesWithDistance = data.map((course: Course) => ({
          ...course,
          totalDistance: course.holes.reduce((sum, hole) => sum + (hole.distance || 0), 0),
        }));

        console.log("✅ Kursdata hentet fra API:", coursesWithDistance);
        setCourses(coursesWithDistance);
      } catch (err) {
        console.error("❌ Feil ved henting av kurs:", err);
      }
    };

    fetchCourses();
  }, []);

  // Hent favorittbaner fra brukerens profil
 /* useEffect(() => {
    const fetchFavorites = async () => {
      const user = await currentUser();
      if (user) {
        setFavorites(user.favoriteCourses || []);
      }
    };

    fetchFavorites();
  }, []);
  */

  // Bruk Server Action for å legge til/fjerne favoritt
  const handleToggleFavorite = async (courseId: string) => {
    const result = await toggleFavorite(courseId);
    if (result.success) {
      setFavorites(result.favorites); // Oppdater tilstanden med nye favoritter
    } else {
      console.error(result.error);
    }
  };

  // Filter courses based on search and difficulty
  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (difficultyFilter === "" || course.difficulty === difficultyFilter)
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Baneoversikt</h1>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Søk etter bane..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded-md p-2"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Alle vanskelighetsgrader</option>
          <option value="Beginner">Nybegynner</option>
          <option value="Intermediate">Middels</option>
          <option value="Advanced">Avansert</option>
        </select>
      </div>

      {/* Use Existing Map Component */}
      <Map />

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="shadow-lg border border-gray-200 flex flex-col">
            {/* Bilde med blå/grå border og favoritt-hjerte */}
            <div className="relative">
              <div className="border-4 border-gray-900 rounded-lg overflow-hidden">
                <Image
                  src={course.image || "/courses/default-course.png"}
                  alt={course.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              </div>
              <button
                onClick={() => handleToggleFavorite(course.id)}
                className="absolute top-3 right-3 p-2 bg-white/80 rounded-full backdrop-blur-sm hover:bg-white/90 transition"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.includes(course.id) ? "text-red-500 fill-red-500" : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            {/* Innhold i kortet */}
            <CardContent className="flex flex-col flex-grow p-6">
              {/* Tittel og klubbinformasjon */}
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl font-semibold">{course.name}</CardTitle>
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

              {/* Banedetaljer */}
              <div className="space-y-2 flex-grow">
                <p><strong>Sted:</strong> {course.location}</p>
                <p><strong>Par:</strong> {course.par}</p>
                <p><strong>Vanskelighetsgrad:</strong> {course.difficulty || "Ukjent"}</p>
                <p><strong>Antall kurver:</strong> {course.holes.length}</p>
                <p><strong>Total avstand:</strong> {course.totalDistance ? `${course.totalDistance} m` : "Ukjent"}</p>
                <p className="line-clamp-3"><strong>Beskrivelse:</strong> {course.description}</p>
              </div>

              {/* ReviewForm */}
              <div className="mt-4">
                <ReviewForm
                  courseId={course.id}
                  totalReviews={course.totalReviews}
                  averageRating={course.averageRating}
                />
              </div>

              {/* Knapp for å se detaljer */}
              <div className="mt-4">
                <Link href={`/courses/${course.id}`} passHref>
                  <Button className="w-full">
                    Se detaljer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}