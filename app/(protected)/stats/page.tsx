// app/(protected)/stats/page.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Importer diagramkomponenter (VERIFISER DISSE STIENENE)
import BarChartPlot from "@/components/charts/BarChartPlot";
import PieChartPlot from "@/components/charts/PieChartPlot";
import RadarChartPlot from "@/components/charts/RadarChartPlot";
import LineChartPlot from "@/components/charts/LineChartPlot";
import RadialChartPlot from "@/components/charts/RadialChart";
import AreaChartPlot from "@/components/charts/AreaChart";

import RankChartPlot from "@/components/charts/RankChartPlot"; // <-- Den nye komponenten
import ScatterChartPlot from "@/components/charts/ScatterChart";

// --- Interfaces ---
interface UserStatsData {
    singleplayerCount: number;
    multiplayerCount: number;
    coursesPlayed: { id: string; name: string }[];
}
interface Tournament {
    id: string;
    name: string;
    status: string;
    startDate: string;
}
interface User {
    id: string;
    name?: string;
    email?: string;
}
interface AggregatedTournamentStats {
    totalObCount: number;
    totalScore: number;
    totalThrows: number;
}
interface TournamentPlacementSummary {
    played: number;
    bestPlacement: number | null;
    avgPlacement: number | null;
    top3Count: number;
    top10Count: number;
    othersCount: number;
}
export interface TournamentPerformance {
    tournamentId: string;
    tournamentName: string;
    totalScore: number;
    totalOb: number;
    totalThrows: number;
    rank: number;
    date: string;
}
interface ScatterDataPoint {
  x: number;
  y: number;
  name: string;
  rank?: number;
  date: string;
}
export interface TimeSeriesDataPoint {
    timestamp: number;
    date: string;
    value: number;
    value2?: number;
}
export interface CategoricalDataPoint {
    name: string;
    value1: number;
    value2: number;
}
interface RadarPoint {
    subject: string;
    value: number;
}
interface RadialPoint {
    name: string;
    value: number;
    fill: string;
}
// Interface for Rank Chart Data
export interface RankDataPoint {
    timestamp: number;
    date: string;
    value: number; // Rank
}
// --- Slutt Interfaces ---

const UserStats = () => {
    // --- State ---
    const [userStats, setUserStats] = useState<UserStatsData | null>(null);
    const [tournamentStats, setTournamentStats] = useState<AggregatedTournamentStats>({ totalObCount: 0, totalScore: 0, totalThrows: 0 });
    const [placementSummary, setPlacementSummary] = useState<TournamentPlacementSummary>({ played: 0, bestPlacement: null, avgPlacement: null, top3Count: 0, top10Count: 0, othersCount: 0 });
    const [tournamentPerformances, setTournamentPerformances] = useState<TournamentPerformance[]>([]);
    const [scatterPlotData, setScatterPlotData] = useState<ScatterDataPoint[]>([]);
    const [lineChartData, setLineChartData] = useState<TimeSeriesDataPoint[]>([]);
    const [areaChartData, setAreaChartData] = useState<TimeSeriesDataPoint[]>([]);
    const [barChartData, setBarChartData] = useState<CategoricalDataPoint[]>([]);
    const [rankChartData, setRankChartData] = useState<RankDataPoint[]>([]); // State for rank data
    const [showSummary, setShowSummary] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    // --- Slutt State ---

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
             if (!isMounted) return;
             setLoading(true);
             setError(null);
            try {
                // Hent brukerdata
                const userResponse = await fetch("/api/auth");
                if (!userResponse.ok) throw new Error("Kunne ikke hente brukerdata");
                const userData: User | null = await userResponse.json();
                if (!isMounted) return;
                setUser(userData);
                if (!userData?.id) throw new Error("Ingen bruker-ID funnet. Vennligst logg inn.");
                const userId = userData.id;

                // Hent User Stats & Past Tournaments
                const [userStatsResponse, tournamentsResponse] = await Promise.all([
                    fetch(`/api/stats/user?userId=${userId}`),
                    fetch(`/api/tournaments?page=1&limit=100&filter=past`)
                ]);

                if (!userStatsResponse.ok || !tournamentsResponse.ok) {
                    console.error("Fetch status:", { user: userStatsResponse.status, tourn: tournamentsResponse.status });
                    throw new Error("Kunne ikke hente brukerstatistikk eller turneringsliste");
                }

                const [userStatsData, tournamentsJson] = await Promise.all([
                    userStatsResponse.json(),
                    tournamentsResponse.json()
                ]);

                if (!isMounted) return;
                setUserStats(userStatsData || { singleplayerCount: 0, multiplayerCount: 0, coursesPlayed: [] });

                const safeTournaments: Tournament[] = Array.isArray(tournamentsJson.tournaments)
                    ? tournamentsJson.tournaments
                    : [];

                const performances: TournamentPerformance[] = [];
                let accumulatedOb = 0;
                let accumulatedScore = 0;
                let accumulatedThrows = 0;
                let placements: number[] = [];

                // Hent Standings
                const standingsResults = await Promise.allSettled(
                  safeTournaments.map(tournament =>
                      fetch(`/api/tournaments/${tournament.id}/standings`).then(res => {
                          if (!res.ok) {
                               if (res.status !== 404) console.warn(`Standings fetch for ${tournament.name} (ID: ${tournament.id}) feilet med status ${res.status}`);
                              return null;
                          }
                          return res.json();
                      }).catch(err => {
                          console.error(`Nettverksfeil ved henting av standings for ${tournament.id}:`, err);
                          return null;
                      })
                  )
                );

                if (!isMounted) return;

                // Behandle Standings & Bygg Performances
                 standingsResults.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value && Array.isArray(result.value)) {
                        const standings = result.value;
                        const tournament = safeTournaments[index];
                        const userRecord = standings.find((record: any) => record.playerId === userId);

                        if (userRecord && tournament && tournament.startDate) {
                            const dateObj = new Date(tournament.startDate);
                            if (!isNaN(dateObj.getTime()) && dateObj.getTime() > 0) {
                                const score = userRecord.totalScore || 0;
                                const ob = userRecord.totalOb || 0;
                                const throws = score - ob;

                                accumulatedScore += score;
                                accumulatedOb += ob;
                                accumulatedThrows += throws;

                                performances.push({
                                    tournamentId: tournament.id,
                                    tournamentName: tournament.name,
                                    totalScore: score,
                                    totalOb: ob,
                                    totalThrows: throws,
                                    rank: userRecord.rank || 0,
                                    date: tournament.startDate
                                });

                                if (userRecord.rank !== undefined && userRecord.rank !== null && userRecord.rank > 0) {
                                    placements.push(userRecord.rank);
                                }
                            } else {
                                console.warn(`Ugyldig startDate [${tournament.startDate}] for ${tournament.name}. Hopper over.`);
                            }
                        } else if (userRecord) {
                             console.warn(`Manglende data for ${safeTournaments[index]?.id}. Hopper over.`);
                        }
                    } else if (result.status === 'rejected') {
                         console.error(`Feil ved henting av standings for ${safeTournaments[index]?.id}:`, result.reason);
                    }
                });

                // Sorter Performances etter dato
                performances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setTournamentPerformances(performances);

                // Transformer data for spesifikke diagrammer
                const newScatterPlotData: ScatterDataPoint[] = performances.map(p => ({
                    x: new Date(p.date).getTime(),
                    y: p.totalScore,
                    name: p.tournamentName,
                    rank: p.rank,
                    date: p.date
                }));
                setScatterPlotData(newScatterPlotData);

                const newLineChartData: TimeSeriesDataPoint[] = performances.map(p => ({
                    timestamp: new Date(p.date).getTime(),
                    date: p.date,
                    value: p.totalScore
                }));
                setLineChartData(newLineChartData);

                const newAreaChartData: TimeSeriesDataPoint[] = performances.map(p => ({
                    timestamp: new Date(p.date).getTime(),
                    date: p.date,
                    value: p.totalScore,
                    value2: p.totalOb
                }));
                setAreaChartData(newAreaChartData);

                const newBarChartData: CategoricalDataPoint[] = performances.map(p => ({
                    name: p.tournamentName,
                    value1: p.totalThrows,
                    value2: p.totalOb
                }));
                setBarChartData(newBarChartData);

                 // Transformasjon for Rank Chart Data
                const newRankChartData: RankDataPoint[] = performances
                    .filter(p => p.rank > 0) // Inkluder kun gyldige ranks
                    .map(p => ({
                        timestamp: new Date(p.date).getTime(),
                        date: p.date,
                        value: p.rank // Bruker rank som verdi
                    }));
                setRankChartData(newRankChartData); // Sett state for rank data

                // Sett aggregerte turneringsstats
                setTournamentStats({
                    totalObCount: accumulatedOb,
                    totalScore: accumulatedScore,
                    totalThrows: accumulatedThrows
                });

                // Beregn plasseringssammendrag
                if (placements.length > 0) {
                    const bestPlacement = Math.min(...placements);
                    const avgPlacement = placements.reduce((a, b) => a + b, 0) / placements.length;
                    const top3Count = placements.filter(r => r <= 3).length;
                    const top10Count = placements.filter(r => r > 3 && r <= 10).length;
                    const othersCount = placements.length - top3Count - top10Count;
                    setPlacementSummary({ played: placements.length, bestPlacement, avgPlacement, top3Count, top10Count, othersCount });
                } else {
                    setPlacementSummary({ played: 0, bestPlacement: null, avgPlacement: null, top3Count: 0, top10Count: 0, othersCount: 0 });
                }

            } catch (error) {
                console.error("Feil i fetchData:", error);
                 if (isMounted) {
                    setError(error instanceof Error ? error.message : "En ukjent feil oppstod.");
                 }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Loading, Error, User states ---
    if (loading) { return ( <div className="min-h-screen bg-gray-100 flex justify-center items-center"> <div className="text-center text-gray-600"> <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" /> <p className="text-lg">Laster statistikk...</p> </div> </div> ); }
    if (error) { return ( <div className="min-h-screen bg-gray-100 flex justify-center items-center"> <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md border border-destructive"> <h2 className="text-2xl font-bold mb-4 text-destructive">Feil</h2> <p className="mb-6 text-destructive-foreground">{error}</p> </div> </div> ); }
    if (!user) { return ( <div className="min-h-screen bg-gray-100 flex justify-center items-center"> <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md"> <h2 className="text-2xl font-bold mb-4">Du er ikke innlogget</h2> <p className="mb-6">Vennligst logg inn for å se dine statistikker.</p> <button onClick={() => router.push("/login")} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"> Logg inn </button> </div> </div> ); }

    // --- Data for Radar og Radial (med eksplisitte typer) ---
    const radarData: RadarPoint[] = [
        { subject: "OB", value: !isNaN(tournamentStats.totalObCount) ? tournamentStats.totalObCount : 0 },
        { subject: "Score", value: !isNaN(tournamentStats.totalScore) ? tournamentStats.totalScore : 0 },
        { subject: "Kast", value: !isNaN(tournamentStats.totalThrows) ? tournamentStats.totalThrows : 0 },
    ];

    const radialChartData: RadialPoint[] = [
        { name: 'Top 3', value: placementSummary.top3Count, fill: '#3b82f6' },
        { name: 'Top 10', value: placementSummary.top10Count, fill: '#10b981' },
        { name: 'Øvrige', value: placementSummary.othersCount, fill: '#f97316' }
    ];

    // --- JSX Struktur ---
    return (
        <div className="min-h-screen bg-gray-100 py-8 md:py-12">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800">Mine Statistikker</h1>
                        {user.name && <p className="text-gray-900 mt-1">Velkommen, {user.name}!</p>}
                    </div>
                    <button
                        className="px-5 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm text-sm"
                        onClick={() => setShowSummary(!showSummary)}
                    >
                        {showSummary ? "Vis Diagrammer" : "Vis Sammendrag"}
                    </button>
                </div>

                {/* Innhold: Sammendrag eller Diagrammer */}
                {showSummary ? (
                    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8 animate-fade-in">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">Statistikk Sammendrag</h2>
                        <div className="space-y-8">
                            {/* Spillmoduser */}
                            <SummarySection title="Spillmoduser">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <StatCard title="Alenespill" value={userStats?.singleplayerCount ?? 0} />
                                    <StatCard title="Vennespill" value={userStats?.multiplayerCount ?? 0} />
                                    <StatCard
                                        title="Totalt Antall Spill"
                                        value={(userStats?.singleplayerCount ?? 0) + (userStats?.multiplayerCount ?? 0)}
                                        highlight
                                    />
                                </div>
                            </SummarySection>
                            {/* Generell Ytelse (Turneringer) */}
                            {tournamentPerformances.length > 0 && (
                                <SummarySection title="Generell Ytelse (Turneringer)">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                         <StatCard title="Turneringer Spilt" value={placementSummary.played} />
                                         <StatCard title="Totale OB (Turneringer)" value={tournamentStats.totalObCount} unit="kast" />
                                         <StatCard title="Totalt Antall Kast (Turneringer)" value={tournamentStats.totalScore} unit="kast" />
                                    </div>
                                </SummarySection>
                            )}
                             {/* Spilte Baner */}
                             {userStats?.coursesPlayed && userStats.coursesPlayed.length > 0 && (
                                <SummarySection title="Spilte Baner">
                                     <div className="flex flex-wrap gap-2">
                                        {userStats.coursesPlayed.map(course => (
                                            <span key={course.id} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                                                {course.name}
                                            </span>
                                        ))}
                                    </div>
                                </SummarySection>
                             )}
                            {/* Turneringsplasseringer */}
                            {placementSummary.played > 0 && (
                                <SummarySection title="Turneringsplasseringer">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                        <StatCard title="Turneringer Spilt" value={placementSummary.played} />
                                        <StatCard title="Beste Plassering" value={placementSummary.bestPlacement ?? 'N/A'} unit={placementSummary.bestPlacement !== null ? ". plass" : ""} />
                                        <StatCard title="Snitt Plassering" value={placementSummary.avgPlacement !== null ? Number(placementSummary.avgPlacement.toFixed(1)) : 'N/A'} unit={placementSummary.avgPlacement !== null ? ". plass" : ""} />
                                    </div>
                                    {/* Siste Turneringsresultater */}
                                    {tournamentPerformances.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-medium mb-3 text-gray-700">Siste Turneringsresultater</h4>
                                            <div className="overflow-x-auto rounded-md border">
                                                 <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Turnering</th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">OB</th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Plassering</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {tournamentPerformances.slice(-5).reverse().map((p, index) => (
                                                            <tr key={p.tournamentId + '-' + index} className="hover:bg-gray-50"><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{p.tournamentName}</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">{p.totalScore}</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">{p.totalOb}</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">{p.rank}.</td></tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </SummarySection>
                            )}
                            {/* Melding hvis ingen turneringer spilt */}
                            {placementSummary.played === 0 && (
                                <SummarySection title="Turneringssammendrag">
                                      <p className="text-gray-500">Du har ikke deltatt i noen fullførte turneringer enda.</p>
                                 </SummarySection>
                            )}
                        </div>
                    </div>
                ) : (
                    // --- Diagram-visning (INKLUDERT RANK CHART) ---
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-fade-in">
                         {/* Rad 1: Turneringsdata */}
                         <ChartCard title="Scoreutvikling (Turneringer)">
                             <LineChartPlot data={lineChartData} yLabel="Total Score" />
                         </ChartCard>
                         <ChartCard title="Score vs OB (Turneringer)">
                              <AreaChartPlot data={areaChartData} yLabel="Total Score" lineLabel="OB Kast" />
                         </ChartCard>

                         {/* Rad 2: Turneringsdata & Fordeling */}
                          <ChartCard title="Kast og OB per Turnering">
                              <BarChartPlot data={barChartData} bar1Label="Rene kast" bar2Label="OB Kast" />
                          </ChartCard>
                         <ChartCard title="Fordeling Spillmoduser">
                            <PieChartPlot
                                singleplayerCount={userStats?.singleplayerCount || 0}
                                multiplayerCount={userStats?.multiplayerCount || 0}
                            />
                         </ChartCard>

                          {/* Rad 3 & 4: Turneringsinnsikt */}
                          {placementSummary.played > 0 && (scatterPlotData.length > 0 || rankChartData.length > 0 || radialChartData.some(d => d.value > 0)) ? (
                              <>
                                  {/* Radar og Scatter (hvis data finnes) */}
                                  {scatterPlotData.length > 0 && (
                                      <>
                                          <ChartCard title="Turneringsprofil (Aggregert)">
                                              <RadarChartPlot data={radarData} />
                                          </ChartCard>
                                          <ChartCard title="Score per Turnering (Detaljert)">
                                              <ScatterChartPlot data={scatterPlotData} />
                                          </ChartCard>
                                      </>
                                  )}

                                  {/* Radial og Rank (hvis data finnes) */}
                                  {radialChartData.some(d => d.value > 0) && (
                                     <ChartCard title="Plasseringsfordeling (Turneringer)">
                                         <RadialChartPlot data={radialChartData} totalPlayed={placementSummary.played} />
                                     </ChartCard>
                                  )}
                                  {rankChartData.length > 0 && (
                                     <ChartCard title="Plasseringsutvikling (Turneringer)">
                                          <RankChartPlot data={rankChartData} />
                                     </ChartCard>
                                  )}

                                  {/* Filler div hvis det er et oddetall diagrammer i denne seksjonen */}
                                   {/* (Beregning av oddetall kan bli kompleks, kan droppes eller gjøres enklere) */}
                                  {/* <div className="lg:col-span-1 hidden lg:block"></div> */}

                              </>
                          ) : (
                               <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                                   Ingen fullførte turneringer med gyldig data funnet for å vise detaljert turneringsinnsikt.
                               </div>
                          )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Hjelpekomponenter (Korrekt) ---
const StatCard = ({ title, value, unit = "", highlight = false }: { title: string; value: number | string; unit?: string; highlight?: boolean }) => (
  <div className={`p-4 rounded-lg shadow-sm ${highlight ? "bg-primary/10 border border-primary/20" : "bg-white border border-gray-200"}`}>
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
      <p className={`text-2xl font-bold mt-1 ${highlight ? "text-primary" : "text-gray-800"}`}>
          {value} {unit}
      </p>
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-4 h-80">
          {children}
      </div>
  </div>
);

const SummarySection = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
      <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">{title}</h3>
          {children}
      </div>
  );
};
// --- Slutt Hjelpekomponenter ---

export default UserStats;