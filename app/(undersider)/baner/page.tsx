"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Map from "@/components/Map";
import { toggleFavorite } from "@/app/actions/favorites";
import { CourseCard } from "@/components/CourseCard";

export default function BaneoversiktPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [locations, setLocations] = useState<string[]>([]);

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
    holes?: { distance: number }[];
    totalDistance?: number;
    baskets?: { latitude: number; longitude: number }[];
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

        const uniqueLocations = Array.from(new Set(data.map((course: Course) => course.location.split(",")[0])));
        setLocations(uniqueLocations as string[]);

        const formattedData = data.map((course: Course) => ({
          ...course,
          holes: course.holes?.map((hole) => ({ distance: hole.distance ?? 0 })) ?? [],
          numHoles: course.baskets?.length ?? 0,
        }));

        setCourses(formattedData);
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

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === "popular") {
      return b.totalReviews - a.totalReviews;
    }
    if (sortBy === "highestRated") {
      if (a.averageRating === 5 && b.averageRating < 5) return -1;
      if (b.averageRating === 5 && a.averageRating < 5) return 1;
      if (a.averageRating === 5 && b.averageRating === 5) {
        return b.totalReviews - a.totalReviews;
      }
      if (a.averageRating !== b.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.totalReviews - a.totalReviews;
    }
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Baneoversikt</h1>

      {/* 📌 Søkefelt og filtre */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Søkefelt */}
        <Input
          placeholder="Søk etter bane..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />

        {/* Sted */}
        <select
          className="flex-1 p-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Alle Steder</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        {/* Vanskelighetsgrad */}
        <select
          className="flex-1 p-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Alle Vanskelighetsgrader</option>
          <option value="Lett">Lett</option>
          <option value="Middels">Middels</option>
          <option value="Vanskelig">Vanskelig</option>
        </select>

        {/* Sortering */}
        <select
          className="flex-1 p-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sorter etter</option>
          <option value="popular">Mest populære</option>
          <option value="highestRated">Høyest vurdert</option>
        </select>
      </div>

      {/* 📌 Kart */}
      <Map />

      {/* 📌 Baneoversikt */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 items-start">
        {sortedCourses.map((course) => (
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
