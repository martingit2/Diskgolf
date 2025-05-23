// Fil: components/MapComponent.tsx
// Formål: Definerer en React-komponent ('use client') som viser et interaktivt Leaflet-kart med markører for flere diskgolfbaner.
//         Henter en liste over baner fra et API-endepunkt (/api/courses), viser dem på kartet med en grønn markør,
//         og inkluderer en popup for hver markør med et detaljert informasjonskort (bilde, navn, sted, rating, baneinfo, eier og en lenke til banens detaljside).
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaInfoCircle } from "react-icons/fa";
import { Disc, Layers, Ruler, Star, AlertCircle, User } from "lucide-react";

// 📌 Bruk en grønn Leaflet markør
const greenMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
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
  par?: number;
  numHoles?: number;
  baskets?: { id: string }[];
  start?: { latitude: number; longitude: number }[];
  obZones?: { id: string }[];
  owner?: string;
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
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
        />
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
          {courses.map((course) => {
            // ✅ Fiks for "Antall kurver"
            const numHoles = course.numHoles ?? (course.baskets ? course.baskets.length : "Ukjent");

            return (
              <Marker key={course.id} position={[course.latitude, course.longitude]} icon={greenMarkerIcon}>
                {/* --- INGEN ENDRINGER NØDVENDIG INNI POPUP-TAGGEN HER --- */}
                <Popup>
                  {/* 👇 ENDRING: Justert bredde til max-w-64 (16rem) */}
                  <Card className="max-w-80 shadow-md border border-gray-200 rounded-lg overflow-hidden">
                    {/* Høyde beholdes på h-32 */}
                    <div className="relative w-full h-32">
                      <Image
                        src={
                          course.image ||
                          "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp"
                        }
                        alt={course.name}
                        fill
                        className="object-cover rounded-t-lg"
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
                            ({course.totalReviews || 0} anmeldelser)
                          </span>
                        </div>
                      )}

                      {/* Utvidet baneinfo */}
                      <div className="text-xs text-gray-600 mt-2 space-y-2">
                        <p>
                          <Disc className="inline text-green-500 mr-2" />
                          <strong>Par:</strong> {course.par ?? "Ukjent"}
                        </p>
                        <p>
                          <Disc className="inline text-orange-500 mr-2" />
                          <strong>Antall kurver:</strong> {numHoles}
                        </p>
                        <p>
                          <Layers className="inline text-blue-500 mr-2" />
                          <strong>Antall Tee:</strong> {course.start ? course.start.length : "Ukjent"}
                        </p>
                        <p>
                          <AlertCircle className="inline text-red-500 mr-2" />
                          <strong>OB-soner:</strong> {course.obZones ? course.obZones.length : "0"} soner
                        </p>
                        <p>
                          <Ruler className="inline text-gray-600 mr-2" />
                          <strong>Banelengde:</strong>{" "}
                          {course.totalDistance ? `${course.totalDistance.toFixed(2)} m` : "Ukjent"}
                        </p>
                        {course.owner && (
                          <p>
                            <User className="inline text-gray-700 mr-2" />
                            <strong>Baneeier:</strong> {course.owner}
                          </p>
                        )}
                      </div>

                      {/* Knapper med spacing */}
                      {/* Margen beholdes på mt-4 */}
                      <div className="mt-4 flex flex-col gap-3">
                        <Button
                          className="w-full bg-gray-900 text-white hover:bg-gray-700 transition-all flex items-center gap-2 justify-center"
                          onClick={() => router.push(`/courses/${course.id}`)}
                        >
                          <FaInfoCircle className="text-white" />
                          Gå til Bane
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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