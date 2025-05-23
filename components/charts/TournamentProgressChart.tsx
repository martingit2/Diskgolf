// Fil: components/charts/TournamentProgressChart.tsx
// Formål: Definerer en React-komponent for å vise et linjediagram som visualiserer progresjon (score og plassering) gjennom rundene i en turnering.
//         Bruker Recharts-biblioteket og to Y-akser for å vise de ulike metrikkene.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TournamentProgressChartProps {
  data: { round: number; score: number; rank: number }[];
}

const TournamentProgressChart = ({ data }: TournamentProgressChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="round" label={{ value: 'Runde', position: 'insideBottom' }} />
        <YAxis yAxisId="left" label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: 'Plassering', angle: 90, position: 'insideRight' }} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="score" stroke="#8884d8" name="Score" />
        <Line yAxisId="right" type="monotone" dataKey="rank" stroke="#82ca9d" name="Plassering" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TournamentProgressChart;