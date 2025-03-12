"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaMapMarkedAlt, FaInfoCircle } from "react-icons/fa";

// 📌 Bruk en grønn Leaflet markør
const greenMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png", 
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});



interface Course {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  image?: string;
  difficulty?: string;
  averageRating?: number;
  totalReviews?: number;
  totalDistance?: number;
}

const MapComponent = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Kunne ikke hente baneinformasjon");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Feil ved henting av kursdata:", err);
        setError("Kunne ikke laste inn baner");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Genererer stjerner basert på rating
  const renderStars = (rating: number) => (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          fill={i < rating ? "#FFD700" : "#E0E0E0"}
          viewBox="0 0 24 24"
          className="h-4 w-4"
        >
          <path d="M12 .587l3.668 7.431 8.215 1.192-5.938 5.778 1.404 8.182L12 18.896l-7.349 3.864 1.404-8.182L.117 9.21l8.215-1.192z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="w-full h-[500px]">
      {loading && <p className="text-center text-gray-500">Laster inn kart...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <MapContainer center={[59.9139, 10.7522]} zoom={6} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Dynamisk genererte markører for baner */}
          {courses.map((course) => (
            <Marker key={course.id} position={[course.latitude, course.longitude]} icon={greenMarkerIcon}>
              <Popup>
                <Card className="w-56 shadow-md border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative">
                    <Image
                      src={
                        course.image ||
                        "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"
                      }
                      alt={course.name}
                      width={250}
                      height={150}
                      className="w-full h-28 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-lg"></div>
                  </div>

                  <CardContent className="p-3">
                    {/* Navn og lokasjon */}
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="text-md font-bold text-gray-900">{course.name}</CardTitle>
                      <p className="text-xs text-gray-600">{course.location}</p>
                      <hr className="my-2 border-gray-300" />
                    </CardHeader>

                    {/* ⭐ Stjernerating */}
                    {course.averageRating !== undefined && (
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(course.averageRating))}
                        <span className="text-xs text-gray-700">
                          ({course.totalReviews || 0})
                        </span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                      <p>
                        <span className="font-medium">Vanskelighetsgrad:</span>{" "}
                        <span
                          className={
                            course.difficulty === "Lett"
                              ? "text-green-500"
                              : course.difficulty === "Middels"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }
                        >
                          {course.difficulty || "Ukjent"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Banelengde:</span>{" "}
                        {course.totalDistance ? `${course.totalDistance.toFixed(2)} m` : "Ukjent"}
                      </p>
                    </div>

                    {/* Knapper med spacing */}
                    <div className="mt-5 flex flex-col gap-3">
  <Button
    className="w-full bg-gray-900 text-white hover:bg-gray-700 transition-all flex items-center gap-2 justify-center"
    onClick={() => router.push(`/courses/${course.id}`)}
  >
    <FaInfoCircle className="text-white" />
    Gå til Bane
  </Button>
  <Link href={`/map/${course.id}`} passHref>
    <Button className="w-full bg-green-800 text-white hover:bg-green-600 transition-all flex items-center gap-2 justify-center">
      <FaMapMarkedAlt className="text-white" />
      Vis Baneoversikt
    </Button>
  </Link>
</div>
                       
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default MapComponent;
