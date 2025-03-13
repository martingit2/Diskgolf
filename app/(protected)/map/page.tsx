"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CourseTabNavigation from "../_components/CourseTabNaviation";

const MapAdminComponent = dynamic(() => import("@/components/MapAdminComponentNoSSR"), { ssr: false });

type ObZone =
  | { type: "circle"; lat: number; lng: number }
  | { type: "polygon"; points: [number, number][] };

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const [selectedType, setSelectedType] = useState<"bane" | "start" | "kurv" | "mål" | "ob" | null>(null);
  const [distanceMeasurements, setDistanceMeasurements] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<string>("Ukjent");
  const [holes, setHoles] = useState<{ latitude: number; longitude: number; number: number; par: number }[]>([]);
  const [kurvLabel, setKurvLabel] = useState<string>("Kurv 1");
  const [startPoints, setStartPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [goalPoint, setGoalPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [obZones, setObZones] = useState<ObZone[]>([]);
  const [selectedTab, setSelectedTab] = useState<"opprettBane" | "redigerBane">("opprettBane");
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]); // 🔹 Liste over baner
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null); // 🔹 Valgt bane-ID
  const [editCourseData, setEditCourseData] = useState<{
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
  } | null>(null); // 🔹 Data for redigering

  // Hent alle baner når komponenten lastes
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Kunne ikke hente baner");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Feil ved henting av baner:", error);
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
        setEditCourseData(data);
      } catch (error) {
        console.error("Feil ved henting av banedata:", error);
        toast.error("Kunne ikke laste banedata");
      }
    };

    fetchCourse();
  }, [selectedCourseId]);

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Bildeopplasting feilet");
      }

      return await response.json();
    } catch (error) {
      console.error("Feil under bildeopplasting:", error);
      toast.error(error instanceof Error ? error.message : "Ukjent feil");
      return null;
    }
  };


  

  const handleSaveCourse = async () => {
    const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
    
    const courseData = {
      name: getValue("courseName"),
      location: getValue("courseLocation"),
      latitude: parseFloat(getValue("courseLat")),
      longitude: parseFloat(getValue("courseLng")),
      par: parseInt(getValue("coursePar"), 10),
      description: getValue("courseDescription"),
      difficulty,
      start: startPoints,
      goal: goalPoint,
      baskets: holes,
      obZones: obZones.map(ob => ({
        type: ob.type,
        lat: ob.type === "circle" ? ob.lat : undefined,
        lng: ob.type === "circle" ? ob.lng : undefined,
        points: ob.type === "polygon" ? ob.points : undefined,
      })),
      image: null as string | null,
    };
  
    if (!courseData.name || !courseData.location || isNaN(courseData.latitude) || 
        isNaN(courseData.longitude) || isNaN(courseData.par) || !difficulty) {
      toast.error("Vennligst fyll ut alle påkrevde feltene!");
      return;
    }
  
    try {
      let imageUrl = null;
      if (image) {
        const uploadResult = await handleImageUpload(image);
        if (!uploadResult?.secure_url) {
          throw new Error("Kunne ikke laste opp bildet");
        }
        imageUrl = uploadResult.secure_url;
      }
  
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...courseData,
          image: imageUrl,
        }),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        toast.success("Bane lagret!");
        setStartPoints([]);
        setGoalPoint(null);
        setObZones([]);
        setHoles([]);
        setImage(null);
        ["courseName", "courseLocation", "courseLat", "courseLng", "coursePar", "courseDescription"]
          .forEach(id => ((document.getElementById(id) as HTMLInputElement).value = ""));
      } else {
        throw new Error(responseData.error || "Kunne ikke lagre bane");
      }
    } catch (error) {
      console.error("Lagringsfeil:", error);
      toast.error(error instanceof Error ? error.message : "Ukjent feil");
    }
  };

  const handleUpdateCourse = async () => {
    if (!editCourseData) return;

    try {
      let imageUrl = null;
      if (editCourseData.image) {
        const uploadResult = await handleImageUpload(editCourseData.image);
        if (!uploadResult?.secure_url) {
          throw new Error("Kunne ikke laste opp bildet");
        }
        imageUrl = uploadResult.secure_url;
      }

      const response = await fetch(`/api/courses/${selectedCourseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editCourseData,
          image: imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Kunne ikke oppdatere banen");
      toast.success("Bane oppdatert!");
    } catch (error) {
      console.error("Feil ved oppdatering av bane:", error);
      toast.error("Kunne ikke oppdatere banen");
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourseId) return;
  
    if (!confirm("Er du sikker på at du vil slette denne banen?")) return;
  
    try {
      const response = await fetch(`/api/courses/${selectedCourseId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) throw new Error("Kunne ikke slette banen");
  
      toast.success("Bane slettet!");
      setSelectedCourseId(null);
      setEditCourseData(null);
  
      // Oppdater listen over baner
      const updatedCourses = courses.filter((course) => course.id !== selectedCourseId);
      setCourses(updatedCourses);
    } catch (error) {
      console.error("Feil ved sletting av bane:", error);
      toast.error("Kunne ikke slette banen");
    }
  };

  if (status === "loading") return <p>Laster inn...</p>;
  if (!session || session.user.role !== "ADMIN") return <p>Du har ikke tilgang til denne siden.</p>;

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-900">Bane Dashboard</h1>

      {/* Legg til fanen for Opprett Bane og Rediger Bane */}
      <CourseTabNavigation selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      {/* Vis enten "Opprett Bane" eller "Rediger Bane" basert på selectedTab */}
      {selectedTab === "opprettBane" ? (
        <div className="flex gap-6 mt-6 w-full max-w-7xl">
          <Card className="w-60">
            <CardHeader>
              <h4 className="text-lg font-semibold">Velg markørtype</h4>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "bane", label: "Bane" },
                { type: "start", label: "Tee" },
                { type: "kurv", label: kurvLabel },
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
            <MapAdminComponent
              selectedType={selectedType}
              setDistanceMeasurements={setDistanceMeasurements}
              setHoles={setHoles}
              setKurvLabel={setKurvLabel}
              setStartPoints={setStartPoints}
              setGoalPoint={setGoalPoint}
              setObZones={setObZones}
            />
          </div>

          <Card className="w-80">
            <CardHeader>
              <h3 className="text-xl font-semibold">Legg til ny bane</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block font-medium">Navn på bane:</label>
                <Input type="text" id="courseName" required />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Sted:</label>
                <Input type="text" id="courseLocation" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-medium">Latitude:</label>
                  <Input type="number" id="courseLat" step="any" required />
                </div>
                <div className="space-y-2">
                  <label className="block font-medium">Longitude:</label>
                  <Input type="number" id="courseLng" step="any" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Par:</label>
                <Input type="number" id="coursePar" min={1} defaultValue={3} required />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Beskrivelse:</label>
                <Textarea id="courseDescription" />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Vanskelighetsgrad:</label>
                <Select onValueChange={setDifficulty} required>
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
                  onChange={(e) => {
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
                  }}
                  className="cursor-pointer"
                />
                {image && (
                  <p className="text-sm text-gray-500 mt-1">
                    Valgt bilde: {image.name} ({Math.round(image.size / 1024)} KB)
                  </p>
                )}
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSaveCourse}
              >
                Lagre bane
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-7xl mt-6">
          <div className="w-full mb-6">
            <label className="block font-medium mb-2">Velg bane å redigere:</label>
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

          {selectedCourseId && editCourseData && (
            <div className="flex gap-6 w-full">
              <Card className="w-60">
                <CardHeader>
                  <h4 className="text-lg font-semibold">Velg markørtype</h4>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { type: "bane", label: "Bane" },
                    { type: "start", label: "Tee" },
                    { type: "kurv", label: kurvLabel },
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
                <MapAdminComponent
                  selectedType={selectedType}
                  setDistanceMeasurements={setDistanceMeasurements}
                  setHoles={(holes) => setEditCourseData({ ...editCourseData, holes })}
                  setKurvLabel={setKurvLabel}
                  setStartPoints={(startPoints) => setEditCourseData({ ...editCourseData, startPoints })}
                  setGoalPoint={(goalPoint) => setEditCourseData({ ...editCourseData, goalPoint })}
                  setObZones={(obZones) => setEditCourseData({ ...editCourseData, obZones })}
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
                      value={editCourseData.name}
                      onChange={(e) => setEditCourseData({ ...editCourseData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium">Sted:</label>
                    <Input
                      type="text"
                      value={editCourseData.location}
                      onChange={(e) => setEditCourseData({ ...editCourseData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block font-medium">Latitude:</label>
                      <Input
                        type="number"
                        value={editCourseData.latitude}
                        onChange={(e) => setEditCourseData({ ...editCourseData, latitude: parseFloat(e.target.value) })}
                        step="any"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-medium">Longitude:</label>
                      <Input
                        type="number"
                        value={editCourseData.longitude}
                        onChange={(e) => setEditCourseData({ ...editCourseData, longitude: parseFloat(e.target.value) })}
                        step="any"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium">Par:</label>
                    <Input
                      type="number"
                      value={editCourseData.par}
                      onChange={(e) => setEditCourseData({ ...editCourseData, par: parseInt(e.target.value, 10) })}
                      min={1}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium">Beskrivelse:</label>
                    <Textarea
                      value={editCourseData.description}
                      onChange={(e) => setEditCourseData({ ...editCourseData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium">Vanskelighetsgrad:</label>
                    <Select
                      value={editCourseData.difficulty}
                      onValueChange={(value) => setEditCourseData({ ...editCourseData, difficulty: value })}
                      required
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
                      onChange={(e) => {
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
                        setEditCourseData({ ...editCourseData, image: file });
                      }}
                      className="cursor-pointer"
                    />
                    {editCourseData.image && (
                      <p className="text-sm text-gray-500 mt-1">
                        Valgt bilde: {editCourseData.image.name} ({Math.round(editCourseData.image.size / 1024)} KB)
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleUpdateCourse}
                  >
                    Oppdater bane
                  </Button>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
                    onClick={handleDeleteCourse}
                  >
                    Slett bane
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;