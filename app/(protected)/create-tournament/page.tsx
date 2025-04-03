// app/(protected)/create-tournament/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Importer shadcn Input
import { Textarea } from "@/components/ui/textarea"; // Importer shadcn Textarea
import { Label } from "@/components/ui/label";

interface Course {
  id: string;
  name: string;
  location?: string;
}

export default function CreateTournamentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    maxParticipants: "",
    courseId: "",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Kunne ikke hente baner");
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        toast.error("Kunne ikke laste inn baner");
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizerId: session?.user?.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Kunne ikke opprette turnering");
      }

      const data = await res.json();
      toast.success("Turnering opprettet!");
      router.push(`/tournament/${data.id}`); // Antar denne ruten finnes
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "En feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Setter lys tekst på hovedcontaineren for siden (arves fra layout, men kan være eksplisitt)
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 text-white"> {/* Satt hvit tekst her */}
      <h1 className="text-2xl font-bold text-white">Opprett ny turnering</h1> {/* Sikrer hvit overskrift */}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Turneringsnavn */}
        <div className="space-y-2"> {/* Fjerner text-white herfra */}
          <Label htmlFor="name" className="text-white">Turneringsnavn *</Label> {/* Label må være hvit */}
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            minLength={3}
            maxLength={100}
            // Legger til mørk tekstfarge for input
            className="text-gray-900"
          />
        </div>

        {/* Beskrivelse */}
        <div className="space-y-2"> {/* Fjerner text-white herfra */}
          <Label htmlFor="description" className="text-white">Beskrivelse</Label> {/* Label må være hvit */}
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            maxLength={500}
            // Legger til mørk tekstfarge for textarea
            className="text-gray-900"
          />
        </div>

        {/* Datoer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"> {/* Fjerner text-white herfra */}
            <Label htmlFor="startDate" className="text-white">Startdato *</Label> {/* Label må være hvit */}
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
              // Legger til mørk tekstfarge for input
              className="text-gray-900"
            />
          </div>

          <div className="space-y-2"> {/* Fjerner text-white herfra */}
            <Label htmlFor="endDate" className="text-white">Sluttdato (valgfri)</Label> {/* Label må være hvit */}
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
               // Legger til mørk tekstfarge for input
              className="text-gray-900"
            />
          </div>
        </div>

        {/* Bane og Deltakere */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"> {/* Fjerner text-white herfra */}
            <Label htmlFor="courseId" className="text-white">Bane *</Label> {/* Label må være hvit */}
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              // Legger til mørk tekstfarge og justerer styling for select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900" // Lagt til text-gray-900
              required
            >
              <option value="" className="text-gray-500">Velg en bane</option> {/* Stil på placeholder option */}
              {courses.map((course) => (
                // Stil på options hvis nødvendig (ofte styrt av nettleser/OS)
                <option key={course.id} value={course.id} className="text-gray-900">
                  {course.name} {course.location && `(${course.location})`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2"> {/* Fjerner text-white herfra */}
            <Label htmlFor="maxParticipants" className="text-white">Maks deltakere (valgfri)</Label> {/* Label må være hvit */}
            <Input
              id="maxParticipants"
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
              min="2"
              max="100"
              // Legger til mørk tekstfarge for input
              className="text-gray-900"
            />
          </div>
        </div>

        {/* Submit knapp */}
        <Button type="submit" disabled={isSubmitting} className="w-full bg-green-700 hover:bg-emerald-600 text-white"> {/* Sikrer hvit tekst på knapp */}
          {isSubmitting ? "Oppretter..." : "Opprett turnering"}
        </Button>
      </form>
    </div>
  );
}