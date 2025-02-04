"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Map from "@/components/Map"; // ✅ Import your existing Map component

export default function BaneoversiktPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  // Fetch courses using Next.js API instead of Supabase directly
  type Course = {
    id: string;
    name: string;
    location: string;
    description: string;
    par: number;
    image?: string;
    difficulty?: string;
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

        console.log("✅ Kursdata hentet fra API:", data);
        setCourses(data);
      } catch (err) {
        console.error("❌ Feil ved henting av kurs:", err);
      }
    };

    fetchCourses();
  }, []);

  // ✅ Filter courses based on search and difficulty
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

      {/* ✅ Use Existing Map Component */}
      <Map />

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{course.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={course.image || "/courses/default-course.png"} // Fallback image if no image is provided
                alt={course.name}
                width={300}
                height={200}
                className="rounded-lg object-cover mb-3"
              />
              <p><strong>Sted:</strong> {course.location}</p>
              <p><strong>Par:</strong> {course.par}</p>
              <p><strong>Vanskelighetsgrad:</strong> {course.difficulty || "Ukjent"}</p>
              <p><strong>Beskrivelse:</strong> {course.description}</p>
              <Button className="mt-4 w-full">Se detaljer</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
