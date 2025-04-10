// components/charts/BarChartPlot.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';
import { CategoricalDataPoint } from '@/app/[lng]/(protected)/stats/page'; // Importer felles interface

interface BarChartPlotProps {
  data: CategoricalDataPoint[];
  xLabel?: string;
  yLabel?: string;
  bar1Label?: string;
  bar2Label?: string;
}

// Fargepalett
const COLORS = {
  bar1: "#82ca9d",        // Grønn (f.eks. for rene kast)
  bar2: "#f97316",        // Oransje (f.eks. for OB)
  grid: "#e5e7eb",
  textMuted: "#6b7280",
  tooltipBg: "rgba(255, 255, 255, 0.95)",
  tooltipBorder: "#d1d5db",
  axisLabel: "#4b5563",
  tooltipHeader: "#1f2937",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as CategoricalDataPoint;
    if (!dataPoint) return null;

    return (
      <div style={{ /* ... (stil) ... */ backgroundColor: COLORS.tooltipBg, padding: '10px', border: `1px solid ${COLORS.tooltipBorder}`, borderRadius: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: '12px' }}>
        <p style={{ fontWeight: 600, color: COLORS.tooltipHeader, marginBottom: '6px' }}>{dataPoint.name}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} style={{ color: entry.fill, marginBottom: '2px' }}>
            {entry.name}: <span style={{ fontWeight: 700 }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarChartPlot = ({
  data = [],
  xLabel = "Turnering", // Endret default xLabel
  yLabel = "Antall Kast",
  bar1Label = "Rene kast",
  bar2Label = "OB Kast"
}: BarChartPlotProps) => {

  // --- Sjekk for nok data ---
  if (!data || data.length < 1) {
     return <div className="h-full flex items-center justify-center text-sm" style={{ color: COLORS.textMuted }}>Ingen data tilgjengelig for søylediagram.</div>;
  }

  // Begrens antall viste søyler hvis det er mange (f.eks. siste 10)
  const displayData = data.slice(-10); // Viser kun de 10 siste turneringene

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={displayData} // Bruker begrenset data
        margin={{ top: 5, right: 5, left: 10, bottom: 45 }} // Mer bunnmarg for skråstilte labels
      >
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis
          dataKey="name" // Turneringsnavn
          stroke={COLORS.textMuted}
          fontSize={10} // Mindre font for labels
          interval={0} // Vis alle labels
          angle={-45} // Skråstill labels
          textAnchor="end" // Juster ankerpunkt
          height={50} // Gi mer plass til skråstilte labels
          // label={{ value: xLabel, position: 'bottom', fill: COLORS.axisLabel, fontSize: 12, dy: 20 }} // Kan fjernes med skråstilte labels
        />
        <YAxis
          stroke={COLORS.textMuted}
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: COLORS.grid }}
          width={45}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: COLORS.axisLabel, fontSize: 12, dx: -5 }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,200,200,0.2)' }}/>
        <Legend verticalAlign="top" height={30} iconSize={10} />
        <Bar
            dataKey="value1" // Rene kast
            stackId="a" // Stabler søylene
            fill={COLORS.bar1}
            name={bar1Label}
            radius={[4, 4, 0, 0]} // Avrundet topp
        />
        <Bar
            dataKey="value2" // OB Kast
            stackId="a" // Stabler søylene
            fill={COLORS.bar2}
            name={bar2Label}
            radius={[4, 4, 0, 0]} // Avrundet topp
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartPlot;