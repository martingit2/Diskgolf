/**
 * Filnavn: UserStats.tsx
 * Beskrivelse: Brukerstatistikk-side med tekst- og diagramoversikt, samt mulighet for å veksle mellom dem.
 * Utvikler: Martin Pettersen
 */

"use client";

import { useState, useEffect } from "react";

import BarChartPlot from "@/components/charts/BarChartPlot";
import PieChartPlot from "@/components/charts/PieChartPlot";
import RadarChartPlot from "@/components/charts/RadarChartPlot";
import LineChartPlot from "@/components/charts/LineChartPlot";
import AreaChartPlot from "@/components/charts/AreaChart";
import RadialChartPlot from "@/components/charts/RadialChart";
import ScatterChartPlot from "@/components/charts/ScatterChart";

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
  const [stats, setStats] = useState<StatsData[] | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data: StatsData[] = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Feil ved henting av statistikkene:", error);
        setStats(data);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-6xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mine Statistikker</h1>
          <button
            className="px-4 py-2 bg-gray-950 text-white font-semibold rounded-md hover:bg-green-700 transition"
            onClick={() => setShowSummary(!showSummary)}
          >
            {showSummary ? "Se Diagrammer" : "Se Sammendrag"}
          </button>
        </div>

        {/* Hvis 'Se Sammendrag' er trykket */}
        {showSummary ? (
          <div className="text-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Sammendrag</h2>
            <p className="mb-4">Her er en tekstbasert oversikt over spillerens prestasjoner:</p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold">Beste Runde:</h3>
              <p>Den beste runden ble gjennomført i Mars med 36 kast.</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold">Total Kast:</h3>
              <p>Total antall kast har økt gjennom perioden, fra 120 i Januar til 150 i Mai.</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold">Gjennomførte Spill:</h3>
              <p>Gjennomførte spill har også økt fra 10 i Januar til 13 i Mai.</p>
            </div>

            {/* Eventuelle flere sammendragstekster her */}
          </div>
        ) : (
          // Diagrammer vises her
          <>
            {/* Seksjon 1: Resultater */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resultater over tid</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LineChart */}
                <div className="bg-[var(--headerColor)] p-4 rounded">
                  <h3 className="text-lg text-green-300 font-semibold mb-2">Antall kast og Beste Runde</h3>
                  <LineChartPlot />
                </div>

                {/* AreaChart */}
                <div className="bg-[var(--headerColor)] p-4 rounded">
                  <h3 className="text-lg text-green-300 font-semibold mb-2">Spillscore og Nøyaktighet</h3>
                  <AreaChartPlot />
                </div>
              </div>
            </section>

            {/* Seksjon 2: Statistikk per måned */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Statistikk per måned</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BarChart */}
                <div className="bg-[var(--headerColor)] p-4 rounded">
                  <h3 className="text-lg text-green-300 font-semibold mb-2">Gjennomførte spill og OB-kast</h3>
                  <BarChartPlot />
                </div>

                {/* PieChart */}
                <div className="bg-[var(--headerColor)] p-4 rounded">
                  <h3 className="text-lg text-green-300 font-semibold mb-2">Kastfordeling</h3>
                  <PieChartPlot />
                </div>
              </div>
            </section>

            {/* Seksjon 3: Ferdigheter */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ferdighetsanalyse</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* RadarChart */}
                <div className="bg-[var(--headerColor)] p-4 rounded">
                  <h3 className="text-lg text-green-300 font-semibold mb-2">Teknisk ferdighetsanalyse</h3>
                  <RadarChartPlot />
                </div>

                {/* RadialChart */}
                <div className="bg-[var(--headerColor)] p-4 rounded">
                  <h3 className="text-lg text-green-300 font-semibold mb-2">Ytelse per Spilltype</h3>
                  <RadialChartPlot />
                </div>

                {/* ScatterChart */}
                <div className="bg-[var(--headerColor)] p-4 rounded">
                  <h3 className="text-lg text-green-300 font-semibold mb-2">Kastlengde vs Poeng</h3>
                  <ScatterChartPlot />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default UserStats;
