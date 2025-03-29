"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BarChartPlot from "@/components/charts/BarChartPlot";
import PieChartPlot from "@/components/charts/PieChartPlot";
import RadarChartPlot from "@/components/charts/RadarChartPlot";
import LineChartPlot from "@/components/charts/LineChartPlot";
import AreaChartPlot from "@/components/charts/AreaChart";
import RadialChartPlot from "@/components/charts/RadialChart";
import ScatterChartPlot from "@/components/charts/ScatterChart";

export interface StatsData {
  name: string;
  totalThrows: number;
  bestRound: number;
  completedGames: number;
  obCount: number;
  pars: number;
}

interface UserStatsData {
  singleplayerCount: number;
  multiplayerCount: number;
  coursesPlayed: { id: string; name: string }[];
}

interface User {
  id: string;
  name?: string;
  email?: string;
}

const UserStats = () => {
  const [stats, setStats] = useState<StatsData[]>([]);
  const [userStats, setUserStats] = useState<UserStatsData | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch("/api/auth");
        if (!userResponse.ok) throw new Error("Kunne ikke hente brukerdata");
        const userData = await userResponse.json();
        setUser(userData);

        if (!userData?.id) throw new Error("Ingen bruker-ID");

        const [statsResponse, userStatsResponse] = await Promise.all([
          fetch(`/api/stats?userId=${userData.id}`),
          fetch(`/api/stats/user?userId=${userData.id}`)
        ]);

        if (!statsResponse.ok || !userStatsResponse.ok) {
          throw new Error("Kunne ikke hente statistikkdata");
        }

        const [statsData, userStatsData] = await Promise.all([
          statsResponse.json(),
          userStatsResponse.json()
        ]);

        setStats(statsData || []);
        setUserStats(userStatsData || null);
      } catch (error) {
        console.error("Feil ved henting av data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Laster statistikk...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Du er ikke innlogget</h2>
          <p className="mb-6">Vennligst logg inn for å se dine statistikker.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Logg inn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-8">
      <div className="w-full max-w-6xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mine Statistikker</h1>
            <p className="text-gray-600 mt-1">Innlogget som: {user.name}</p>
          </div>
          <button
            className="px-5 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
            onClick={() => setShowSummary(!showSummary)}
          >
            {showSummary ? "Vis Diagrammer" : "Vis Sammendrag"}
          </button>
        </div>

        {showSummary ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">Sammendrag</h2>
            {stats.length > 0 || userStats ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-gray-700">Spillmoduser</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                      title="Alenespill" 
                      value={userStats?.singleplayerCount || 0} 
                    />
                    <StatCard 
                      title="Vennespill" 
                      value={userStats?.multiplayerCount || 0} 
                    />
                    <StatCard 
                      title="Totalt" 
                      value={(userStats?.singleplayerCount || 0) + (userStats?.multiplayerCount || 0)}
                      highlight 
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-gray-700">Beste Prestasjoner</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard 
                      title="Beste Runde" 
                      value={stats.length > 0 ? Math.min(...stats.map(s => s.bestRound)) : 0}
                      unit="par"
                    />
                    <StatCard 
                      title="Totale OB-kast" 
                      value={stats.reduce((sum, s) => sum + s.obCount, 0)}
                    />
                  </div>
                </div>

                {userStats?.coursesPlayed && userStats.coursesPlayed.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-gray-700">Spilte Baner</h3>
                    <div className="flex flex-wrap gap-2">
                      {userStats.coursesPlayed.map(course => (
                        <span 
                          key={course.id}
                          className="bg-gray-200 px-3 py-1 rounded-full text-sm"
                        >
                          {course.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Ingen statistikkdata tilgjengelig</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
                Resultater over tid
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard 
                  title="Antall kast og Beste Runde" 
                  chart={<LineChartPlot data={stats} />}
                />
                <ChartCard 
                  title="OB-kast vs Par-performance" 
                  chart={<AreaChartPlot data={stats} />}
                />
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
                Statistikk per måned
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard 
                  title="Gjennomførte spill og OB-kast" 
                  chart={<BarChartPlot data={stats} />}
                />
                <ChartCard 
  title="Fordeling av spillmoduser" 
  chart={
    <PieChartPlot 
      singleplayerCount={userStats?.singleplayerCount}
      multiplayerCount={userStats?.multiplayerCount}
    />
  }
/>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
                Ferdighetsanalyse
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ChartCard 
                  title="Teknisk ferdighetsanalyse" 
                  chart={<RadarChartPlot />}
                />
                <ChartCard 
                  title="Ytelse per Spilltype" 
                  chart={<RadialChartPlot />}
                />
                <ChartCard 
                  title="Kastlengde vs Poeng" 
                  chart={<ScatterChartPlot />}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

// Hjelpekomponenter med type-sikkerhet
interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
  highlight?: boolean;
}

const StatCard = ({ title, value, unit = '', highlight = false }: StatCardProps) => (
  <div className={`p-4 rounded-lg ${highlight ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'}`}>
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-green-600' : 'text-gray-800'}`}>
      {value} {unit}
    </p>
  </div>
);

interface ChartCardProps {
  title: string;
  chart: React.ReactNode;
}

const ChartCard = ({ title, chart }: ChartCardProps) => (
  <div className="bg-gray-900 p-4 rounded-lg">
    <h3 className="text-lg font-semibold mb-3 text-green-300">{title}</h3>
    <div className="h-80">
      {chart}
    </div>
  </div>
);

export default UserStats;