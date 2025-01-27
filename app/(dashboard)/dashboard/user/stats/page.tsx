'use client';

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import BarChartPlot from "@/components/charts/BarChartPlot";
import PieChartPlot from "@/components/charts/PieChartPlot";
import RadarChartPlot from "@/components/charts/RadarChartPlot";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";

// Define the type of the data
interface StatsData {
  name: string;
  totalThrows: number;
  bestRound: number;
  completedGames: number;
  obCount: number;
  pars: number;
}

// Simulated data for testing
const data = [
  { name: "Jan", totalThrows: 120, bestRound: 38, completedGames: 10, obCount: 5, pars: 3 },
  { name: "Feb", totalThrows: 140, bestRound: 36, completedGames: 12, obCount: 4, pars: 5 },
  { name: "Mar", totalThrows: 160, bestRound: 39, completedGames: 14, obCount: 6, pars: 7 },
  { name: "Apr", totalThrows: 180, bestRound: 37, completedGames: 15, obCount: 8, pars: 9 },
  { name: "Mai", totalThrows: 150, bestRound: 38, completedGames: 13, obCount: 7, pars: 6 },
];

const UserStats = () => {
  const [stats, setStats] = useState<StatsData[] | null>(null); // Use the defined type

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data: StatsData[] = await response.json(); // Assuming the API returns data in this format
        setStats(data);
      } catch (error) {
        console.error("Feil ved henting av statistikkene:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Dashboard Navbar */}
      <DashboardNavbar userRole="bruker" /> {/* Passer brukerrolle her */}

      <div className="flex-grow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mine Statistikker</h1>
          <button className="px-4 py-2 bg-gray-950 text-white font-semibold rounded-md hover:bg-green-700 transition">
            Se Sammendrag
          </button>
        </div>

        {/* Grid Layout for Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart for kast */}
          <div className="w-full h-auto bg-[var(--headerColor)] rounded p-4">
            <h2 className="text-xl text-green-300 font-semibold mb-4">Antall kast og Beste Runde</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats || data}> {/* Use stats if available, else fallback to simulated data */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="totalThrows"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="bestRound"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Legend layout="vertical" align="center" verticalAlign="bottom" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* BarChart for annen statistikk */}
          <div className="w-full h-auto bg-[var(--headerColor)] rounded p-4">
            <h2 className="text-xl text-green-300 font-semibold mb-4">Spill Statistikker per Måned</h2>
            <BarChartPlot />
          </div>
        </div>

        {/* Grid Layout for PieChart and RadarChart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
          {/* PieChart for statistikkfordeling */}
          <div className="w-full h-auto bg-[var(--headerColor)] rounded p-4">
            <h2 className="text-xl text-green-300 font-semibold mb-4">Kast Fordeling</h2>
            <PieChartPlot />
          </div>

          {/* RadarChart for spillers ferdigheter */}
          <div className="w-full h-auto bg-[var(--headerColor)] rounded p-4">
            <h2 className="text-xl text-green-300 font-semibold mb-4">Spill Ferdigheter</h2>
            <RadarChartPlot />
          </div>
        </div>

        {/* Vis statistikkene som tekst */}
      </div>
    </div>
  );
};

export default UserStats;
