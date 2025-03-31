"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  maxParticipants: number | null;
  location: string;
  course: {
    id: string;
    name: string;
    location: string | null;
  };
  organizer: {
    id: string;
    name: string | null;
  };
  club: {
    id: string;
    name: string;
  } | null;
  participants: {
    id: string;
    name: string | null;
  }[];
  _count: {
    participants: number;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const router = useRouter();

  // Hent ID fra params promise
  const { id } = use(params);

  // Hent brukerdata
  useEffect(() => {
    fetch("/api/auth")
      .then((res) => {
        if (!res.ok) throw new Error("Kunne ikke hente brukerdata");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((error) => {
        console.error("Feil ved henting av bruker:", error);
        setUser(null);
      });
  }, []);

  // Hent turneringsdata
  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Kunne ikke hente turnering");
        return res.json();
      })
      .then((data) => setTournament(data))
      .catch((error) => {
        console.error("Feil ved henting av turnering:", error);
        router.push("/tournaments");
        toast.error("Turnering ikke funnet");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleRegister = async () => {
    if (!user) {
      toast.error("Du må være logget inn for å melde deg på");
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch("/api/tournaments/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tournamentId: id,
          playerId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Påmelding feilet");
      }

      const updatedTournament = await response.json();
      setTournament(updatedTournament);
      toast.success("Påmelding vellykket!");
    } catch (error) {
      console.error("Påmelding feilet:", error);
      toast.error(
        error instanceof Error ? error.message : "Påmelding feilet"
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!user || !tournament || user.id !== tournament.organizer.id) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch("/api/tournaments/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tournamentId: id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Statusoppdatering feilet");
      }

      const updatedTournament = await response.json();
      setTournament(updatedTournament);
      toast.success("Status oppdatert!");
    } catch (error) {
      console.error("Statusoppdatering feilet:", error);
      toast.error(
        error instanceof Error ? error.message : "Statusoppdatering feilet"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading || !tournament) {
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

  const isOrganizer = user?.id === tournament.organizer.id;
  const isParticipant = tournament.participants.some((p) => p.id === user?.id);
  const isRegistrationOpen = tournament.status === "REGISTRATION_OPEN";
  const canRegister =
    user &&
    !isParticipant &&
    isRegistrationOpen &&
    (!tournament.maxParticipants ||
      tournament._count.participants < tournament.maxParticipants);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-gray-600 mt-2">
            Arrangert av {tournament.organizer.name} • 
            Bane: {tournament.course.name} • 
            {tournament.club && `Klubb: ${tournament.club.name}`}
          </p>
        </div>
        {isOrganizer && (
          <Link
            href={`/tournament/${id}/edit`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Rediger
          </Link>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Turneringsdetaljer</h2>
          <div className="mt-4 space-y-2">
            <p>Start: {new Date(tournament.startDate).toLocaleString()}</p>
            {tournament.endDate && (
              <p>Slutt: {new Date(tournament.endDate).toLocaleString()}</p>
            )}
            <p>Status: {tournament.status}</p>
            {tournament.maxParticipants && (
              <p>Påmeldte: {tournament._count.participants} / {tournament.maxParticipants}</p>
            )}
            {tournament.description && (
              <p className="mt-4">{tournament.description}</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Påmeldte spillere</h2>
            {canRegister && (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm disabled:opacity-50"
              >
                {isRegistering ? "Melder på..." : "Meld meg på"}
              </button>
            )}
          </div>

          {tournament.participants.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {tournament.participants.map((player) => (
                <li key={player.id} className="flex items-center">
                  {player.name}
                  {isOrganizer && (
                    <button
                      onClick={() => {
                        toast("Fjerningsfunksjonalitet må implementeres");
                      }}
                      className="ml-auto text-red-500 hover:text-red-700 text-sm"
                    >
                      Fjern
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-500">Ingen påmeldte ennå</p>
          )}
        </div>
      </div>

      {isOrganizer && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Administrasjon</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <select
                defaultValue={tournament.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={isUpdatingStatus}
                className="border p-2 rounded disabled:opacity-50"
              >
                <option value="PLANNING">Planlegging</option>
                <option value="REGISTRATION_OPEN">Påmelding åpen</option>
                <option value="IN_PROGRESS">Pågår</option>
                <option value="COMPLETED">Fullført</option>
              </select>
              {isUpdatingStatus && (
                <span className="ml-2 text-gray-500">Oppdaterer...</span>
              )}
            </div>
            <Link
              href={`/tournament/${id}/results`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Registrer resultater
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}