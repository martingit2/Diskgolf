// Fil: src/app/tournament/[id]/standings/page.tsx
// Formål: Viser den offisielle stillingen (leaderboard) for en spesifikk turnering, inkludert rangering, spillernavn, totalscore og lenke til detaljer per spiller.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function TournamentStandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/tournaments/${id}/standings`)
      .then(res => res.json())
      .then(data => setStandings(data))
      .catch(error => {
        console.error(error);
        router.push(`/tournament/${id}`);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div>Laster resultater...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Turneringsresultater</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Plass</th>
              <th className="p-3 text-left">Spiller</th>
              <th className="p-3 text-left">Totalt</th>
              <th className="p-3 text-left">Detaljer</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr key={standing.playerId} className="border-t">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{standing.playerName}</td>
                <td className="p-3">{standing.totalScore}</td>
                <td className="p-3">
                  <button 
                    onClick={() => router.push(`/tournament/${id}/player/${standing.playerId}`)}
                    className="text-blue-500 hover:underline"
                  >
                    Se detaljer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}