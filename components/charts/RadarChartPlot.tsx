'use client';

import { RadarChart, Radar, PolarAngleAxis, PolarGrid, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const RadarChartPlot = () => {
  // Eksempel på dummy data for forskjellige spillstatistikker
  const data = [
    { subject: 'Kastnøyaktighet', A: 80, B: 70 },
    { subject: 'Putts', A: 90, B: 85 },
    { subject: 'OB-kast', A: 50, B: 60 },
    { subject: 'Par-hull', A: 70, B: 75 },
    { subject: 'Runder', A: 60, B: 80 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart outerRadius={90} width={730} height={250} data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <Radar name="Spiller A" dataKey="A" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
        <Radar name="Spiller B" dataKey="B" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartPlot;
