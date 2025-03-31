// components/tournaments/NyTurneringForm.tsx eller lignende
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TournamentStatus } from "@prisma/client"; // Kan brukes hvis du vil sette status ved opprettelse

interface Course {
  id: string;
  name: string;
  location: string | null;
}

// Valgfritt: Hvis du vil la bruker velge klubb hvis de er admin i flere
interface Club {
    id: string;
    name: string;
}

const NyTurneringForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");
  const [location, setLocation] = useState(""); // Valgfritt: La bruker sette spesifikk location
  const [image, setImage] = useState(""); // Valgfritt: URL til bilde
  // const [clubId, setClubId] = useState(""); // Valgfritt: For klubbvalg

  const [courses, setCourses] = useState<Course[]>([]);
  // const [userClubs, setUserClubs] = useState<Club[]>([]); // Valgfritt: For klubbvalg
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Hent tilgjengelige baner
  useEffect(() => {
    setLoadingCourses(true);
    fetch("/api/courses") // Antatt API-endepunkt for alle baner
      .then(res => res.ok ? res.json() : Promise.reject("Kunne ikke hente baner"))
      .then((data: Course[]) => setCourses(data))
      .catch(err => {
          console.error(err);
          toast.error("Kunne ikke laste listen over baner.");
      })
      .finally(() => setLoadingCourses(false));
  }, []);

  // TODO Valgfritt: Hent klubber brukeren administrerer hvis klubbtilknytning skal velges
  // useEffect(() => { fetch('/api/user-admin-clubs')... }, []);

  const handleMaxParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxParticipants(value === "" ? "" : parseInt(value, 10) || "");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validering
    if (!name || !startDate || !courseId) {
      toast.error("Fyll ut Turneringsnavn, Startdato og velg Bane.");
      return;
    }
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
        toast.error("Sluttdato kan ikke være før startdato.");
        return;
    }

    const tournamentData = {
      name,
      description,
      startDate: new Date(startDate).toISOString(), // Send som ISO string
      endDate: endDate ? new Date(endDate).toISOString() : null,
      courseId,
      maxParticipants: maxParticipants === "" ? null : maxParticipants,
      location: location || courses.find(c => c.id === courseId)?.location || "Ukjent sted", // Bruk spesifikk, ellers banens, ellers default
      image: image || null,
      // clubId: clubId || null, // Send med hvis klubbvalg er implementert
      status: TournamentStatus.PLANNING // Kan settes her eller i API
    };

    setIsSubmitting(true);
    try {
      // Kaller POST på /api/tournaments (den oppdaterte ruten)
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tournamentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kunne ikke opprette turnering");
      }

      const createdTournament = await response.json();
      toast.success("Turnering opprettet!");
      router.push(`/tournament/${createdTournament.id}`); // Gå til den nye turneringssiden
    } catch (error) {
      console.error("Feil ved oppretting av turnering:", error);
      toast.error(error instanceof Error ? error.message : "Ukjent feil ved oppretting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Opprett ny turnering</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Turneringsnavn */}
        <div>
          <Label htmlFor="name">Turneringsnavn *</Label>
          <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        {/* Bane */}
        <div>
          <Label htmlFor="courseId">Bane *</Label>
           <Select value={courseId} onValueChange={setCourseId} required disabled={loadingCourses}>
               <SelectTrigger id="courseId">
                   <SelectValue placeholder={loadingCourses ? "Laster baner..." : "Velg bane"} />
               </SelectTrigger>
               <SelectContent>
                   {!loadingCourses && courses.length > 0 ? (
                       courses.map((course) => (
                           <SelectItem key={course.id} value={course.id}>
                               {course.name} {course.location && `(${course.location})`}
                           </SelectItem>
                       ))
                   ) : (
                       !loadingCourses && <SelectItem value="" disabled>Ingen baner funnet</SelectItem>
                   )}
               </SelectContent>
           </Select>
        </div>

        {/* Beskrivelse */}
        <div>
          <Label htmlFor="description">Beskrivelse</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kort info om turneringen..." />
        </div>

        {/* Datoer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Startdato og tid *</Label>
              <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="endDate">Sluttdato og tid</Label>
              <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
            </div>
        </div>

        {/* Maks deltakere */}
        <div>
          <Label htmlFor="maxParticipants">Maks deltakere</Label>
          <Input id="maxParticipants" type="number" value={maxParticipants} onChange={handleMaxParticipantsChange} min={2} placeholder="Ubegrenset" />
        </div>

         {/* Sted (Valgfritt - overstyrer banens sted) */}
         <div>
            <Label htmlFor="location">Spesifikt sted (valgfritt)</Label>
            <Input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={courses.find(c => c.id === courseId)?.location || "F.eks. Parknavn, Område"}/>
            <p className="text-xs text-gray-500 mt-1">Hvis tomt, brukes banens lokasjon.</p>
         </div>

          {/* Bilde URL (Valgfritt) */}
          <div>
             <Label htmlFor="image">Bilde URL (valgfritt)</Label>
             <Input id="image" type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..."/>
          </div>


        {/* Submit-knapp */}
        <div className="pt-4 border-t">
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting || loadingCourses}>
            {isSubmitting ? "Oppretter..." : "Opprett turnering"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NyTurneringForm;