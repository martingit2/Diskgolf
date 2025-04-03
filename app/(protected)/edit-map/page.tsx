"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteCourse, updateCourse } from "@/app/actions/course-actions";

// Dynamisk import av kartet for å unngå SSR-problemer
const EditCourseMap = dynamic(() => import("@/components/EditCourseMap"), { ssr: false });

interface ObZone {
  type: "polygon";
  points: [number, number][];
}

interface CourseData {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  par: number;
  description: string;
  difficulty: string;
  startPoints: { lat: number; lng: number }[];
  goalPoint: { lat: number; lng: number } | null;
  holes: { latitude: number; longitude: number; number: number; par: number }[];
  obZones: ObZone[];
  image: File | null;
}

const EditMapDashboard = () => {
  const [selectedType, setSelectedType] = useState<"bane" | "start" | "kurv" | "mål" | "ob" | null>(null);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [distanceMeasurements, setDistanceMeasurements] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("Middels");
  const [mapCenter, setMapCenter] = useState<[number, number]>([59.9127, 10.7461]); // Standard senter for kartet

  // Hent alle baner når komponenten lastes
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Kunne ikke hente baner");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        toast.error("Kunne ikke laste baner");
      }
    };

    fetchCourses();
  }, []);

  // Hent banedata når en bane er valgt
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${selectedCourseId}`);
        if (!response.ok) throw new Error("Kunne ikke hente banedata");
        const data = await response.json();

        // Mapper startpunkter fra Start-modellen til frontend-format
        const mappedData: CourseData = {
          id: data.id,
          name: data.name || "",
          location: data.location || "",
          latitude: data.latitude || 59.9127,
          longitude: data.longitude || 10.7461,
          par: data.par || 3,
          description: data.description || "",
          difficulty: data.difficulty || "Middels",
          startPoints: data.start?.map((start: { latitude: number; longitude: number }) => ({
            lat: start.latitude,
            lng: start.longitude,
          })) || [],
          goalPoint: data.goal ? { lat: data.goal.latitude, lng: data.goal.longitude } : null,
          holes: data.holes || [],
          obZones: data.obZones || [],
          image: null,
        };

        setCourseData(mappedData);
        setDifficulty(data.difficulty || "Middels");

        // Oppdater kartets senter til banens posisjon
        if (data.latitude && data.longitude) {
          setMapCenter([data.latitude, data.longitude]);
        }
      } catch (error) {
        toast.error("Kunne ikke laste banedata");
      }
    };

    fetchCourse();
  }, [selectedCourseId]);

  // Håndter bildeopplasting
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Maks filstørrelse er 10MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Kun JPG, PNG og WEBP er tillatt");
      return;
    }

    setImage(file);
  };

  // Oppdater banedata
  const handleUpdateCourse = async () => {
    if (!courseData || !selectedCourseId) return;

    try {
      const updatedData = {
        ...courseData,
        difficulty,
        image: image ? await handleImageUploadToServer(image) : null,
      };

      const response = await updateCourse(selectedCourseId, updatedData);
      if (response.success) {
        toast.success("Bane oppdatert!");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Feil ved oppdatering av bane:", error);
      toast.error("Kunne ikke oppdatere banen");
    }
  };

  // Hjelpefunksjon for å laste opp bilde til serveren
  const handleImageUploadToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Kunne ikke laste opp bildet");
    }

    const data = await response.json();
    return data.secure_url; // Returner URLen til det opplastede bildet
  };

  // Slett bane
  const handleDeleteCourse = async () => {
    if (!selectedCourseId) return;
    if (!confirm("Er du sikker på at du vil slette denne banen?")) return;

    const response = await deleteCourse(selectedCourseId);
    if (response.success) {
      toast.success("Bane slettet!");
      setCourses((prev) => prev.filter((course) => course.id !== selectedCourseId));
      setSelectedCourseId(null);
      setCourseData(null);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white">Rediger Banekart</h1>

      <div className="w-full max-w-7xl mt-6">
        <label className="block font-medium mb-2 text-white">Velg bane å redigere:</label>
        <Select onValueChange={(value) => setSelectedCourseId(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Velg en bane" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCourseId && courseData && (
        <div className="flex gap-6 mt-6 w-full max-w-7xl">
          <Card className="w-60">
            <CardHeader>
              <h4 className="text-lg font-semibold">Velg markørtype</h4>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "bane", label: "Bane" },
                { type: "start", label: "Tee" },
                { type: "kurv", label: "Kurv" },
                { type: "mål", label: "Mål" },
                { type: "ob", label: "OB" },
              ].map(({ type, label }) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type as "bane" | "start" | "kurv" | "mål" | "ob")}
                >
                  {label}
                </Button>
              ))}
            </CardContent>

            <CardContent className="mt-4">
              <h4 className="text-lg font-semibold">Avstandsmålinger</h4>
              <div className="bg-gray-100 p-3 rounded-md text-sm">
                {distanceMeasurements.length > 0 ? (
                  distanceMeasurements.map((d, i) => <p key={i}>{d}</p>)
                ) : (
                  <p>Ingen avstander beregnet ennå</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex-1 min-w-[600px] h-[500px] bg-gray-200 rounded-lg">
            <EditCourseMap
              courseId={selectedCourseId}
              onUpdate={(updatedData) => {
                if (courseData) {
                  setCourseData({
                    ...courseData,
                    ...updatedData,
                  });
                }
              }}
              selectedType={selectedType}
              setDistanceMeasurements={setDistanceMeasurements}
              mapCenter={mapCenter} // Send kartets senter som en prop
            />
          </div>

          <Card className="w-80">
            <CardHeader>
              <h3 className="text-xl font-semibold">Rediger bane</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block font-medium">Navn på bane:</label>
                <Input
                  type="text"
                  value={courseData.name}
                  onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Sted:</label>
                <Input
                  type="text"
                  value={courseData.location}
                  onChange={(e) => setCourseData({ ...courseData, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-medium">Latitude:</label>
                  <Input
                    type="number"
                    value={courseData.latitude}
                    readOnly // Lås feltet
                    className="bg-gray-100 cursor-not-allowed" // Visuell indikator på at feltet er låst
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-medium">Longitude:</label>
                  <Input
                    type="number"
                    value={courseData.longitude}
                    readOnly // Lås feltet
                    className="bg-gray-100 cursor-not-allowed" // Visuell indikator på at feltet er låst
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Par:</label>
                <Input
                  type="number"
                  value={courseData.par}
                  onChange={(e) => setCourseData({ ...courseData, par: parseInt(e.target.value, 10) })}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Beskrivelse:</label>
                <Textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Vanskelighetsgrad:</label>
                <Select
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg vanskelighetsgrad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lett">Lett</SelectItem>
                    <SelectItem value="Middels">Middels</SelectItem>
                    <SelectItem value="Vanskelig">Vanskelig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Bilde:</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {image && (
                  <p className="text-sm text-gray-500 mt-1">
                    Valgt bilde: {image.name} ({Math.round(image.size / 1024)} KB)
                  </p>
                )}
              </div>

              <Button onClick={handleUpdateCourse}>Oppdater bane</Button>
              <Button onClick={handleDeleteCourse} className="bg-red-600">
                Slett bane
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EditMapDashboard;