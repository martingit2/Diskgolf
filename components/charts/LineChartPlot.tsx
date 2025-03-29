"use client";

import { StatsData } from '@/app/(protected)/stats/page';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface LineChartPlotProps {
  data: StatsData[]; // data vi skal vise
}

const LineChartPlot = ({ data }: LineChartPlotProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* Eksempel: vise totalThrows og bestRound */}
        <Line type="monotone" dataKey="totalThrows" stroke="#8884d8" strokeWidth={2} name="Antall kast" />
        <Line type="monotone" dataKey="bestRound" stroke="#82ca9d" strokeWidth={2} name="Beste runde" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartPlot;
