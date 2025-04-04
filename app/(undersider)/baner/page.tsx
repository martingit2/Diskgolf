"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Map from "@/components/Map";
import { toggleFavorite } from "@/app/actions/favorites"; // Server action for toggling
import { getCurrentUserFavorites } from "@/app/actions/get-user-favorites"; // Server action for fetching initial favorites
import { CourseCard } from "@/components/CourseCard";

// Definer Course-typen (samme som før)
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
  numHoles?: number; // Lagt til her for klarhet, selv om den settes i map
};

export default function BaneoversiktPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]); // Holder ID-ene til favorittbanene
  const [sortBy, setSortBy] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); // State for å vise lasting av baner/favoritter
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null); // NY STATE: Holder ID-en til banen som toggles

  // Hent baner og initielle favoritter
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Start lasting
      try {
        // Hent baner
        const courseResponse = await fetch("/api/courses");
        const courseData = await courseResponse.json();

        if (!courseResponse.ok) {
          throw new Error(courseData.error || "Failed to fetch courses");
        }

        const uniqueLocations = Array.from(
          new Set(courseData.map((course: Course) => course.location.split(",")[0]))
        );
        setLocations(uniqueLocations as string[]);

        const formattedData = courseData.map((course: Course) => ({
          ...course,
          holes: course.holes?.map((hole) => ({ distance: hole.distance ?? 0 })) ?? [],
          numHoles: course.baskets?.length ?? 0,
        }));
        setCourses(formattedData);

        // Hent brukerens favoritter
        const favResult = await getCurrentUserFavorites();
        if (favResult.data) {
          setFavorites(favResult.data);
        } else {
          console.error("Could not fetch initial favorites:", favResult.error);
          // Vurder å vise en feilmelding til brukeren her
        }

      } catch (err) {
        console.error("Feil ved henting av data:", err);
        // Vurder å vise en feilmelding til brukeren her
      } finally {
        setIsLoading(false); // Fullfør lasting
      }
    };

    fetchData();
  }, []); // Kjører kun én gang når komponenten mountes

  // Håndter favoritt-toggling
  const handleToggleFavorite = async (courseId: string) => {
    // Ikke gjør noe hvis en annen favoritt allerede toggles
    if (togglingFavoriteId) return;

    setTogglingFavoriteId(courseId); // Marker denne banen som "toggler"

    try {
      const result = await toggleFavorite(courseId); // Kall server action

      if (result.success && result.favorites) {
        // Oppdater favorittlisten lokalt med den nye listen fra serveren
        setFavorites(result.favorites);
      } else {
        console.error("Failed to toggle favorite:", result.error);
        // Valgfritt: Vis feilmelding til brukeren
        // Siden vi henter initielle favoritter, kan vi la være å reversere UI
        // med mindre feilen er kritisk.
      }
    } catch (error) {
        console.error("Error calling toggleFavorite action:", error);
         // Valgfritt: Vis feilmelding til brukeren
    } finally {
      setTogglingFavoriteId(null); // Nullstill "toggler"-status uansett resultat
    }
  };

  // Filtrer og sorter baner (samme logikk som før)
  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (difficultyFilter === "" || course.difficulty === difficultyFilter) &&
      (locationFilter === "" || course.location.split(",")[0] === locationFilter)
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === "popular") {
      return (b.totalReviews ?? 0) - (a.totalReviews ?? 0); // Bruk ?? 0 for sikkerhet
    }
    if (sortBy === "highestRated") {
       const ratingA = a.averageRating ?? 0;
       const ratingB = b.averageRating ?? 0;
       const reviewsA = a.totalReviews ?? 0;
       const reviewsB = b.totalReviews ?? 0;

      // Prioriter 5 stjerner
      if (ratingA === 5 && ratingB < 5) return -1;
      if (ratingB === 5 && ratingA < 5) return 1;
      // Hvis begge er 5 stjerner, sorter etter flest reviews
      if (ratingA === 5 && ratingB === 5) {
        return reviewsB - reviewsA;
      }
      // Ellers, sorter etter rating (høyest først)
      if (ratingA !== ratingB) {
        return ratingB - ratingA;
      }
      // Hvis rating er lik (og ikke 5), sorter etter flest reviews
      return reviewsB - reviewsA;
    }
    return 0; // Ingen sortering valgt
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Baneoversikt</h1>

      {/* 📌 Søkefelt og filtre (uendret) */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Søkefelt */}
        <Input
          placeholder="Søk etter bane..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 text-gray-900 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />

        {/* Sted */}
        <select
          className="flex-1 p-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">Alle steder</option>
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
          <option value="">Alle vanskelighetsgrader</option>
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

      {/* 📌 Kart (uendret) */}
      <Map /> {/* Antar Map ikke trenger favorittdata direkte */}

      {/* 📌 Baneoversikt */}
      {isLoading ? (
        // Vis en enkel lastemelding eller skeletons hvis du har
        <div className="text-center py-10">Laster baner...</div>
      ) : sortedCourses.length === 0 ? (
        <div className="text-center py-10 text-gray-600">Ingen baner funnet med de valgte filtrene.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 items-start">
          {sortedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              // Sjekk om denne banens ID er i favorittlisten
              isFavorite={favorites.includes(course.id)}
              // Send med funksjonen for å toggle
              onToggleFavorite={handleToggleFavorite}
              // Send med status for om *denne spesifikke* banen toggles
              isToggling={togglingFavoriteId === course.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}