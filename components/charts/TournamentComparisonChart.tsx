// Fil: components/charts/TournamentComparisonChart.tsx
// Formål: Definerer en React-komponent for å vise et søylediagram som sammenligner brukerens score med gjennomsnittlig og beste score for ulike turneringer.
//         Bruker Recharts-biblioteket for visualisering og inkluderer standard tooltip og legend.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TournamentComparisonChartProps {
  data: {
    tournament: string;
    yourScore: number;
    avgScore: number;
    bestScore: number;
  }[];
}

const TournamentComparisonChart = ({ data }: TournamentComparisonChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tournament" />
        <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="yourScore" fill="#8884d8" name="Din score" />
        <Bar dataKey="avgScore" fill="#82ca9d" name="Gj.snitt" />
        <Bar dataKey="bestScore" fill="#ffc658" name="Beste score" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TournamentComparisonChart;