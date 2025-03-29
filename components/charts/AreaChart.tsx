'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StatsData } from '@/app/(protected)/stats/page';

interface AreaChartPlotProps {
  data: StatsData[];
}

const AreaChartPlot: React.FC<AreaChartPlotProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => 
            name === 'OB-kast' ? [`${value} OB`, name] : [value, name]
          }
        />
        <Legend />
        <Area 
          type="monotone"
          dataKey="obCount"
          name="OB-kast"
          stroke="#ff6b6b"
          fill="#ff6b6b"
          fillOpacity={0.6}
          animationBegin={0}
          animationDuration={1000}
        />
        <Area 
          type="monotone"
          dataKey="pars"
          name="Gj.snitt par"
          stroke="#4ecdc4"
          fill="#4ecdc4"
          fillOpacity={0.6}
          animationBegin={500}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartPlot;