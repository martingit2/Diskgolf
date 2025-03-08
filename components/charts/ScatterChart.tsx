'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ScatterChartPlot = () => {
  const data = [
    { x: 10, y: 30 },
    { x: 20, y: 45 },
    { x: 30, y: 50 },
    { x: 40, y: 70 },
    { x: 50, y: 90 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" name="Kastlengde" unit="m" />
        <YAxis type="number" dataKey="y" name="Poeng" unit="p" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Kast vs Poeng" data={data} fill="#82ca9d" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterChartPlot;
