'use client';

import { StatsData } from '@/app/(protected)/stats/page';
import { BarChart, XAxis, YAxis, Bar, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface BarChartPlotProps {
  data?: StatsData[];  // Legg til ? for å gjøre det optional
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' 
              ? entry.name === 'Gj.snitt par' 
                ? entry.value.toFixed(1) 
                : entry.value
              : entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const BarChartPlot = ({ data = [] }: BarChartPlotProps) => {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-500">Ingen data tilgjengelig</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="completedGames" 
          fill="#8884d8" 
          name="Fullførte spill" 
        />
        <Bar 
          dataKey="obCount" 
          fill="#82ca9d" 
          name="OB-kast" 
        />
        <Bar 
          dataKey="pars" 
          fill="#ff7300" 
          name="Gj.snitt par" 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartPlot;