"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Course {
  id: string;
  name: string;
  location: string;
  latitude?: number;  // Made optional to handle missing data
  longitude?: number; // Made optional to handle missing data
}

export default function FindCourse() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        console.log("Courses fetched:", data);
        setCourses(data);
      })
      .catch((err) => {
        console.error("Feil ved henting av courses:", err);
        setError("Kunne ikke hente courses");
      });
  }, []);

  return (
    <div className="w-full h-screen">
      <MapContainer 
        center={[59.9139, 10.7522]} 
        zoom={10} 
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {courses
          .filter(course => course.latitude && course.longitude) // Avoid errors with missing coordinates
          .map((course) => (
            <Marker key={course.id} position={[course.latitude!, course.longitude!]}>
              <Popup>
                <h3 className="font-semibold">{course.name}</h3>
                <p>{course.location}</p>
              </Popup>
            </Marker>
          ))
        }
      </MapContainer>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
