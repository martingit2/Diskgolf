'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AreaChartPlot = () => {
  const data = [
    { month: 'Jan', score: 50, accuracy: 85 },
    { month: 'Feb', score: 55, accuracy: 88 },
    { month: 'Mar', score: 52, accuracy: 86 },
    { month: 'Apr', score: 60, accuracy: 90 },
    { month: 'May', score: 58, accuracy: 89 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
        <Area type="monotone" dataKey="accuracy" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartPlot;
