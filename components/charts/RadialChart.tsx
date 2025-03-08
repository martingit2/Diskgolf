'use client';

import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const RadialChartPlot = () => {
  const data = [
    { name: 'Putts', value: 70, fill: '#8884d8' },
    { name: 'Drives', value: 85, fill: '#82ca9d' },
    { name: 'Midrange', value: 60, fill: '#ff7300' },
    { name: 'Approach', value: 75, fill: '#ffbb00' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadialBarChart innerRadius="10%" outerRadius="80%" data={data} startAngle={90} endAngle={-270}>
        <RadialBar 
          dataKey="value"
          label={{ position: 'insideStart', fill: '#fff' }} 
          background 
        />
        <Legend />
        <Tooltip />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default RadialChartPlot;
