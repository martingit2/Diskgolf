'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GameModeData {
  name: string;
  value: number;
}

interface PieChartPlotProps {
  singleplayerCount?: number;
  multiplayerCount?: number;
}

const PieChartPlot = ({ 
  singleplayerCount = 0, 
  multiplayerCount = 0 
}: PieChartPlotProps) => {
  const data: GameModeData[] = [
    { name: 'Singleplayer', value: singleplayerCount },
    { name: 'Multiplayer', value: multiplayerCount },
  ];

  const colors = ['#8884d8', '#82ca9d'];
  const totalGames = singleplayerCount + multiplayerCount;

  if (totalGames === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-gray-500">Ingen spilldata tilgjengelig</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={60}
          fill="#8884d8"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          animationBegin={0}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => [
            value, 
            `${name}: ${value} spill (${((value / totalGames) * 100).toFixed(1)}%)`
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartPlot;