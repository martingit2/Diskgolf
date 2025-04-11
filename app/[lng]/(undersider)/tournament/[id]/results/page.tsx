// Fil: src/app/tournament/[id]/standings/register/page.tsx // (Antatt filsti basert på funksjon)
// Formål: Klientkomponent som tilbyr et skjema for å manuelt registrere score (antall kast) for deltakere i en spesifikk turnering.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



"use client";
import { useState, useEffect, use } from "react"; 
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function TournamentResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Bruk use-hooken for å unwrappe Promise
  const [scores, setScores] = useState<Record<string, number[]>>({});
  const [players, setPlayers] = useState<any[]>([]);
  const [holes, setHoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Hent turneringsdata
    Promise.all([
      fetch(`/api/tournaments/${id}/participants`).then(res => res.json()),
      fetch(`/api/tournaments/${id}/holes`).then(res => res.json())
    ])
      .then(([participants, holes]) => {
        setPlayers(participants);
        setHoles(holes);
        
        // Initialiser scores-objekt
        const initialScores: Record<string, number[]> = {};
        participants.forEach((player: any) => {
          initialScores[player.id] = new Array(holes.length).fill(0);
        });
        setScores(initialScores);
      })
      .catch(error => {
        toast.error("Kunne ikke laste turneringsdata");
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores })
      });

      if (!response.ok) throw new Error("Kunne ikke lagre resultater");
      
      toast.success("Resultater lagret!");
      router.push(`/tournament/${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "En feil oppstod");
    }
  };

  if (loading) return <div>Laster...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Registrer resultater</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Spiller</th>
              {holes.map((hole, index) => (
                <th key={hole.id} className="border p-2">Hull {index + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td className="border p-2">{player.name}</td>
                {holes.map((_, index) => (
                  <td key={index} className="border p-2">
                    <input
                      type="number"
                      min="1"
                      className="w-16 p-1 border rounded"
                      value={scores[player.id]?.[index] || 0}
                      onChange={(e) => {
                        const newScores = { ...scores };
                        newScores[player.id][index] = parseInt(e.target.value) || 0;
                        setScores(newScores);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Lagre resultater
      </button>
    </div>
  );
}