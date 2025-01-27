'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChartPlot = () => {
  // Dummy data relatert til DiskGolf-statistikk
  const data = [
    { month: 'Jan', totalThrows: 150, bestRound: 45, avgScore: 50 },
    { month: 'Feb', totalThrows: 130, bestRound: 42, avgScore: 48 },
    { month: 'Mar', totalThrows: 140, bestRound: 40, avgScore: 46 },
    { month: 'Apr', totalThrows: 120, bestRound: 38, avgScore: 44 },
    { month: 'May', totalThrows: 135, bestRound: 39, avgScore: 47 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* Totalt antall kast */}
        <Line type="monotone" dataKey="totalThrows" stroke="#8884d8" strokeWidth={2} />
        {/* Beste runde */}
        <Line type="monotone" dataKey="bestRound" stroke="#82ca9d" strokeWidth={2} />
        {/* Gjennomsnittlig poengsum */}
        <Line type="monotone" dataKey="avgScore" stroke="#ff7300" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartPlot;
