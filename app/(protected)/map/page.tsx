"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { toast, Toaster } from "react-hot-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MapAdminComponent = dynamic(
  () => import("@/components/MapAdminComponentNoSSR"),
  { ssr: false }
);

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const [selectedType, setSelectedType] = useState<"bane" | "start" | "kurv" | "mål" | null>(null);
  const [distanceMeasurements, setDistanceMeasurements] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<string>("Ukjent");
  const [holes, setHoles] = useState<{ latitude: number; longitude: number; number: number; par: number }[]>([]);
  const [kurvLabel, setKurvLabel] = useState<string>("Kurv 1");

  if (status === "loading") {
    return <p>Laster inn...</p>;
  }

  if (!session || session.user.role !== "ADMIN") {
    return <p>Du har ikke tilgang til denne siden.</p>;
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleSaveCourse = async () => {
    const name = (document.getElementById("courseName") as HTMLInputElement).value;
    const location = (document.getElementById("courseLocation") as HTMLInputElement).value;
    const latitude = parseFloat((document.getElementById("courseLat") as HTMLInputElement).value);
    const longitude = parseFloat((document.getElementById("courseLng") as HTMLInputElement).value);
    const par = parseInt((document.getElementById("coursePar") as HTMLInputElement).value, 10);
    const description = (document.getElementById("courseDescription") as HTMLInputElement).value;

    if (!name || !location || isNaN(latitude) || isNaN(longitude) || isNaN(par) || !difficulty) {
      toast.error("Vennligst fyll ut alle feltene!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("location", location);
    formData.append("latitude", latitude.toString());
    formData.append("longitude", longitude.toString());
    formData.append("par", par.toString());
    formData.append("description", description);
    formData.append("difficulty", difficulty);
    if (image) {
      formData.append("image", image);
    }

    formData.append(
      "holes",
      JSON.stringify(
        holes.map((hole) => ({
          latitude: hole.latitude,
          longitude: hole.longitude,
          number: hole.number,
          par: 3,
        }))
      )
    );

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Bane lagret!");
      } else {
        toast.error("Kunne ikke lagre bane.");
      }
    } catch (error) {
      console.error("Feil ved lagring av bane:", error);
      toast.error("Feil ved lagring av bane.");
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="flex gap-6 mt-6 w-full max-w-7xl">
        <Card className="w-60">
          <CardHeader>
            <h4 className="text-lg font-semibold">Velg markørtype</h4>
          </CardHeader>
          <CardContent className="space-y-3">
            {["bane", "start", "kurv", "mål"].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type as "bane" | "start" | "kurv" | "mål")}
              >
                {type === "kurv" ? kurvLabel : type.charAt(0).toUpperCase() + type.slice(1)}
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
          />
        </div>

        <Card className="w-80">
          <CardHeader>
            <h3 className="text-xl font-semibold">Legg til en ny bane</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block font-medium">Navn på bane:</label>
            <Input type="text" id="courseName" />

            <label className="block font-medium">Sted:</label>
            <Input type="text" id="courseLocation" />

            <label className="block font-medium">Latitude:</label>
            <Input type="number" id="courseLat" />

            <label className="block font-medium">Longitude:</label>
            <Input type="number" id="courseLng" />

            <label className="block font-medium">Par (min. 1):</label>
            <Input type="number" id="coursePar" min={1} defaultValue={3} />

            <label className="block font-medium">Beskrivelse:</label>
            <Textarea id="courseDescription" />

            <label className="block font-medium">Vanskelighetsgrad:</label>
            <Select onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Velg vanskelighetsgrad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lett">Lett</SelectItem>
                <SelectItem value="Middels">Middels</SelectItem>
                <SelectItem value="Vanskelig">Vanskelig</SelectItem>
              </SelectContent>
            </Select>

            <label className="block font-medium">Last opp bilde:</label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />

            <Button className="w-full bg-green-600 text-white" onClick={handleSaveCourse}>
              Legg til bane
            </Button>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminDashboard;
