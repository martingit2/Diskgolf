"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { TournamentStatus } from "@prisma/client";

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  status: TournamentStatus;
  maxParticipants: number | null;
  courseId: string;
  organizerId: string;
  clubId: string | null;
}

interface Course {
  id: string;
  name: string;
  location: string | null;
}

export default function TournamentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const [tournamentRes, coursesRes] = await Promise.all([
          fetch(`${baseUrl}/api/tournaments/${id}`),
          fetch(`${baseUrl}/api/courses`)
        ]);

        if (!tournamentRes.ok || !coursesRes.ok) {
          throw new Error("Kunne ikke hente data");
        }

        const tournamentData = await tournamentRes.json();
        const coursesData = await coursesRes.json();

        setTournament(tournamentData);
        setCourses(coursesData);
      } catch (error) {
        console.error("Feil ved henting av data:", error);
        toast.error("Kunne ikke laste turneringsdata");
        router.push("/tournaments");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    setIsSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/tournaments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tournament,
          startDate: new Date(tournament.startDate).toISOString(),
          endDate: tournament.endDate ? new Date(tournament.endDate).toISOString() : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kunne ikke oppdatere turnering");
      }

      toast.success("Turnering oppdatert!");
      router.push(`/tournament/${id}`);
    } catch (error) {
      console.error("Oppdatering feilet:", error);
      toast.error(
        error instanceof Error ? error.message : "En feil oppstod ved oppdatering"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-500">Turnering ikke funnet</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Rediger turnering</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-medium">Navn *</label>
            <input
              type="text"
              value={tournament.name}
              onChange={(e) => setTournament({...tournament, name: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Status *</label>
            <select
              value={tournament.status}
              onChange={(e) => setTournament({...tournament, status: e.target.value as TournamentStatus})}
              className="w-full p-2 border rounded"
              required
            >
              {Object.values(TournamentStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Beskrivelse</label>
          <textarea
            value={tournament.description || ""}
            onChange={(e) => setTournament({...tournament, description: e.target.value})}
            className="w-full p-2 border rounded min-h-[100px]"
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-medium">Startdato *</label>
            <input
              type="datetime-local"
              value={new Date(tournament.startDate).toISOString().slice(0, 16)}
              onChange={(e) => setTournament({
                ...tournament, 
                startDate: new Date(e.target.value).toISOString()
              })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Sluttdato</label>
            <input
              type="datetime-local"
              value={tournament.endDate ? new Date(tournament.endDate).toISOString().slice(0, 16) : ""}
              onChange={(e) => setTournament({
                ...tournament, 
                endDate: e.target.value ? new Date(e.target.value).toISOString() : null
              })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-medium">Bane *</label>
            <select
              value={tournament.courseId}
              onChange={(e) => setTournament({...tournament, courseId: e.target.value})}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Velg bane</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} {course.location && `(${course.location})`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Maks deltakere</label>
            <input
              type="number"
              min="2"
              value={tournament.maxParticipants || ""}
              onChange={(e) => setTournament({
                ...tournament, 
                maxParticipants: e.target.value ? parseInt(e.target.value) : null
              })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Sted *</label>
          <input
            type="text"
            value={tournament.location}
            onChange={(e) => setTournament({...tournament, location: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push(`/tournament/${id}`)}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? "Lagrer..." : "Lagre endringer"}
          </button>
        </div>
      </form>
    </div>
  );
}