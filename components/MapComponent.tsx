// src/components/MapComponent.tsx
"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// Importerer MapPopupCard (den kompakte versjonen)
import { MapPopupCard } from "./MapPopupCard";

// Markør-ikon (uendret)
const greenMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Course interface (uendret)
interface Course {
  id: string;
  name: string;
  location?: string;
  latitude: number;
  longitude: number;
  image?: string;
  difficulty?: string;
  averageRating?: number;
  totalReviews?: number;
  totalDistance?: number;
  par?: number;
  description?: string;
  baskets?: unknown[];
  numHoles?: number;
}

const MapComponent = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Kunne ikke hente baneinformasjon (Status: ${res.status})`);
        }
        let data: Course[] = await res.json();

        data = data.map(course => ({
            ...course,
            numHoles: course.numHoles ?? (Array.isArray(course.baskets) ? course.baskets.length : undefined)
        }));

        setCourses(data);
      } catch (err) {
        console.error("Feil ved henting av kursdata for kart:", err);
        if (err instanceof Error) {
          setError(`Kunne ikke laste inn baner: ${err.message}`);
        } else {
          setError("En ukjent feil oppstod under lasting av baner.");
        }
      } finally {
        setLoading(false);
      }
    };
     fetchCourses();
  }, []);


  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      {loading && (
        <div className="flex items-center justify-center h-full bg-gray-50">
            <p className="text-center text-gray-500">Laster inn kart...</p>
        </div>
      )}
      {error && (
         <div className="flex items-center justify-center h-full bg-red-50">
            <p className="text-center text-red-600 p-4">{error}</p>
         </div>
      )}

      {!loading && !error && (
        <MapContainer
            center={[62.5, 10.5]} zoom={5} className="w-full h-full" scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {courses
             .filter(course => typeof course.latitude === 'number' && typeof course.longitude === 'number')
             .map((course) => {
                const displayNumHoles = typeof course.numHoles === 'number' ? course.numHoles : 'Ukjent';

                const popupCourseData = {
                  id: course.id,
                  name: course.name,
                  location: course.location,
                  image: course.image,
                  difficulty: course.difficulty,
                  averageRating: course.averageRating,
                  totalReviews: course.totalReviews,
                  totalDistance: course.totalDistance,
                  par: course.par,
                  numHoles: displayNumHoles,
                };

                return (
                <Marker key={course.id} position={[course.latitude, course.longitude]} icon={greenMarkerIcon}>
                    {/* *** VIKTIG ENDRING: Økt maxWidth kraftig for mye bredere popup *** */}
                    {/* Prøver med 650px, juster etter behov basert på visning */}
                    <Popup maxWidth={650} minWidth={400}>
                      {/* Bruker den kompakte MapPopupCard */}
                      <MapPopupCard course={popupCourseData} />
                    </Popup>
                </Marker>
                );
            })}
        </MapContainer>
      )}
    </div>
  );
};

export default MapComponent;