'use client';

import { BarChart, XAxis, YAxis, Bar, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartPlot = () => {
  // Eksempel på dummy data relatert til disk golf-statistikk
  const data = [
    { month: 'Jan', completedGames: 10, obCount: 5, pars: 12 },
    { month: 'Feb', completedGames: 12, obCount: 3, pars: 15 },
    { month: 'Mar', completedGames: 8, obCount: 4, pars: 10 },
    { month: 'Apr', completedGames: 15, obCount: 6, pars: 18 },
    { month: 'May', completedGames: 14, obCount: 2, pars: 14 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* Antall spill fullført */}
        <Bar dataKey="completedGames" fill="#8884d8" barSize={30} />
        {/* Antall OB kast */}
        <Bar dataKey="obCount" fill="#82ca9d" barSize={30} />
        {/* Antall par */}
        <Bar dataKey="pars" fill="#ff7300" barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
};


export default BarChartPlot;
