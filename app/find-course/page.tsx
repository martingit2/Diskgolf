/** 
 * Filnavn: page.tsx
 * Beskrivelse: Kartkomponent som viser discgolf-baner ved hjelp av Leaflet og OpenStreetMap.
 *              Henter kursdata fra API-et og plasserer markører på kartet med informasjon i en popup.
 *              Bruker dynamisk import for å unngå SSR-problemer i Next.js.
 * Utvikler: Said Hussain Khawajazada
 */


"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";


// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Course {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export default function FindCourse() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Kunne ikke hente courses");
        const data = await res.json();
        console.log("Courses fetched:", data);
        setCourses(data);
      } catch (err) {
        console.error("Feil ved henting av courses:", err);
        setError("Kunne ikke hente courses");
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="w-full h-screen">
      {courses.length > 0 ? (
        <MapContainer center={[59.9139, 10.7522]} zoom={10} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {courses
            .filter((course) => course.latitude && course.longitude)
            .map((course) => (
              <Marker key={course.id} position={[course.latitude!, course.longitude!]}>
                <Popup>
                  <h3 className="font-semibold">{course.name}</h3>
                  <p>{course.location}</p>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      ) : (
        <p className="text-center text-gray-500 mt-4">Laster inn kart...</p>
      )}
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
    </div>
  );
}
