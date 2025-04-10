// Fil: app/[lng]/(undersider)/baner/page.tsx (eller tilsvarende sti)
// Formål: Viser en oversikt over baner med søk, filtrering, sortering og favorittfunksjonalitet.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet og feilsøking.

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from 'react-i18next'; // <-- Bruker standard hook fra react-i18next
import { Input } from "@/components/ui/input";
import Map from "@/components/Map";
import { toggleFavorite } from "@/app/actions/favorites";
import { getCurrentUserFavorites } from "@/app/actions/get-user-favorites";
import { CourseCard } from "@/components/CourseCard";

// Definerer datastrukturen for en bane.
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
  numHoles?: number;
};

/**
 * Hovedkomponenten for baneoversiktssiden.
 */
export default function BaneoversiktPage() {
  const params = useParams();

  // Returnerer tidlig hvis URL-parametere ikke er tilgjengelige.
  if (!params) {
    return null;
  }

  // const lng = params.lng as string; // 'lng' hentes, men brukes ikke direkte av useTranslation her.
  const { t } = useTranslation('translation'); // Henter oversettelsesfunksjon for 'translation' namespace.

  // State for banedata, filtre, sortering og UI-tilstand.
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null);

  // Effekt for å hente initielle data (baner og favoritter).
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Henter banedata fra API.
        const courseResponse = await fetch("/api/courses");
        const courseData = await courseResponse.json();
        if (!courseResponse.ok) throw new Error(courseData.error || "Failed to fetch courses");

        // Prosesserer og setter banedata og lokasjoner for filtre.
        const uniqueLocations = Array.from(new Set(courseData.map((course: Course) => course.location.split(",")[0].trim())));
        setLocations(uniqueLocations as string[]);
        const formattedData = courseData.map((course: Course) => ({
          ...course,
          holes: course.holes?.map(hole => ({ distance: hole.distance ?? 0 })) ?? [],
          numHoles: course.baskets?.length ?? 0,
        }));
        setCourses(formattedData);

        // Henter brukerens favoritter.
        const favResult = await getCurrentUserFavorites();
        if (favResult.data) setFavorites(favResult.data);
        else console.error("Could not fetch initial favorites:", favResult.error);

      } catch (err) {
        console.error("Feil ved henting av data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // Kjøres kun ved mount.

  /**
   * Håndterer favoritt-toggling via Server Action.
   * @param courseId ID til banen som toggles.
   */
  const handleToggleFavorite = async (courseId: string) => {
    if (togglingFavoriteId) return; // Hindrer doble klikk.
    setTogglingFavoriteId(courseId);
    try {
      const result = await toggleFavorite(courseId);
      if (result.success && result.favorites !== undefined) {
        setFavorites(result.favorites); // Oppdaterer lokal state med serverens respons.
      } else {
        console.error("Failed to toggle favorite:", result.error);
      }
    } catch (error) {
      console.error("Error calling toggleFavorite action:", error);
    } finally {
      setTogglingFavoriteId(null); // Nullstiller toggle-status.
    }
  };

  // Filtrerer baner basert på state-verdier.
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (difficultyFilter === "" || course.difficulty === difficultyFilter) &&
    (locationFilter === "" || course.location.split(",")[0].trim() === locationFilter)
  );

  // Sorterer filtrerte baner basert på state-verdi.
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === "popular") return (b.totalReviews ?? 0) - (a.totalReviews ?? 0);
    if (sortBy === "highestRated") {
      const ratingA = a.averageRating ?? 0;
      const ratingB = b.averageRating ?? 0;
      const reviewsA = a.totalReviews ?? 0;
      const reviewsB = b.totalReviews ?? 0;
      if (ratingA === 5 && ratingB < 5) return -1;
      if (ratingB === 5 && ratingA < 5) return 1;
      if (ratingA === 5 && ratingB === 5) return reviewsB - reviewsA;
      if (ratingA !== ratingB) return ratingB - ratingA;
      return reviewsB - reviewsA;
    }
    return 0;
  });

  // Renderer komponenten.
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
        {t('course_overview.title')}
      </h1>

      {/* Filter- og søke-seksjon */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder={t('course_overview.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 text-gray-900 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />
        <select
          className="flex-1 p-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          aria-label={t('course_overview.location_all')}
        >
          <option value="">{t('course_overview.location_all')}</option>
          {locations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
        <select
          className="flex-1 p-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          aria-label={t('course_overview.difficulty_all')}
        >
          <option value="">{t('course_overview.difficulty_all')}</option>
          <option value="Lett">{t('course_overview.difficulty_easy')}</option>
          <option value="Middels">{t('course_overview.difficulty_medium')}</option>
          <option value="Vanskelig">{t('course_overview.difficulty_hard')}</option>
        </select>
        <select
          className="flex-1 p-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label={t('course_overview.sort_by_label')}
        >
          <option value="">{t('course_overview.sort_by_label')}</option>
          <option value="popular">{t('course_overview.sort_by_popular')}</option>
          <option value="highestRated">{t('course_overview.sort_by_highest_rated')}</option>
        </select>
      </div>

      <Map />

      {/* Viser lasteindikator, melding om ingen treff, eller listen med banekort */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-700">{t('course_overview.loading')}</div>
      ) : sortedCourses.length === 0 ? (
        <div className="text-center py-10 text-gray-600">{t('course_overview.no_courses_found')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 items-start">
          {sortedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isFavorite={favorites.includes(course.id)}
              onToggleFavorite={handleToggleFavorite}
              isToggling={togglingFavoriteId === course.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}