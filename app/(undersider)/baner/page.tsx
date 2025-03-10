"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Map from "@/components/Map";
import { toggleFavorite } from "@/app/actions/favorites";
import { CourseCard } from "@/components/CourseCard"; // Importer den nye komponenten

export default function BaneoversiktPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch courses");
        }

        const formattedData = data.map((course: Course) => ({
          ...course,
          holes: course.holes.map(hole => ({ distance: hole.distance ?? 0 })), // Sikrer at distance aldri er undefined
        }));

        setCourses(formattedData); // Bruker totalDistance direkte fra API-et
      } catch (err) {
        console.error("Feil ved henting av kurs:", err);
      }
    };

    fetchCourses();
  }, []);

  const handleToggleFavorite = async (courseId: string) => {
    const result = await toggleFavorite(courseId);
    if (result.success) {
      setFavorites(result.favorites);
    } else {
      console.error(result.error);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (difficultyFilter === "" || course.difficulty === difficultyFilter)
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Baneoversikt</h1>

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
          <option value="Lett">Lett</option>
          <option value="Middels">Middels</option>
          <option value="Vanskelig">Vanskelig</option>
        </select>
      </div>

      <Map />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 items-start">

        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isFavorite={favorites.includes(course.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}