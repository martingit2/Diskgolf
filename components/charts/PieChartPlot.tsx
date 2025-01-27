'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PieChartPlot = () => {
  // Eksempel på dummy data relatert til disk golf-statistikk
  const data = [
    { name: 'Putts', value: 500 },
    { name: 'Drives', value: 800 },
    { name: 'Midrange', value: 300 },
    { name: 'Approach', value: 150 },
  ];

  const colors = ['#8884d8', '#82ca9d', '#ff7300', '#ffbb00'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartPlot;
