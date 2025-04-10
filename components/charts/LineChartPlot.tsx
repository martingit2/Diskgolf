// components/charts/LineChartPlot.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { TimeSeriesDataPoint } from '@/app/[lng]/(protected)/stats/page'; // Importer felles interface

interface LineChartPlotProps {
  data: TimeSeriesDataPoint[];
  xLabel?: string;
  yLabel?: string;
  lineLabel?: string;
}

// Fargepalett (hardkodet)
const COLORS = {
  line: "#8884d8",        // Lilla
  grid: "#e5e7eb",
  textMuted: "#6b7280",
  tooltipBg: "rgba(255, 255, 255, 0.95)",
  tooltipBorder: "#d1d5db",
  axisLabel: "#4b5563",
  tooltipHeader: "#1f2937",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as TimeSeriesDataPoint; // Bruker TimeSeriesDataPoint
    if (!dataPoint) return null;

    const formattedDate = new Date(dataPoint.date).toLocaleDateString('nb-NO', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
      <div style={{ /* ... (stil som i ScatterChartPlot) ... */ backgroundColor: COLORS.tooltipBg, padding: '10px', border: `1px solid ${COLORS.tooltipBorder}`, borderRadius: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: '12px' }}>
        <p style={{ fontWeight: 600, color: COLORS.tooltipHeader, marginBottom: '4px' }}>{formattedDate}</p>
        <p style={{ color: COLORS.line }}>
          {payload[0].name || 'Score'}: <span style={{ fontWeight: 700 }}>{dataPoint.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const LineChartPlot = ({
  data = [],
  xLabel = "Dato",
  yLabel = "Verdi",
  lineLabel = "Score"
}: LineChartPlotProps) => {

  // --- Sjekk for nok data ---
  if (!data || data.length < 2) {
    return <div className="h-full flex items-center justify-center text-sm" style={{ color: COLORS.textMuted }}>For lite data for linjediagram (trenger minst 2 punkter).</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis
          type="number"
          dataKey="timestamp" // Bruker timestamp
          domain={['dataMin', 'dataMax']}
          stroke={COLORS.textMuted}
          fontSize={11}
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('nb-NO', { month: 'short', year: '2-digit' })}
          tickLine={false}
          axisLine={{ stroke: COLORS.grid }}
          height={35}
          interval="preserveStartEnd"
          label={{ value: xLabel, position: 'bottom', fill: COLORS.axisLabel, fontSize: 12, dy: 10 }}
        />
        <YAxis
          stroke={COLORS.textMuted}
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: COLORS.grid }}
          width={45}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: COLORS.axisLabel, fontSize: 12, dx: -5 }}
          domain={['auto', 'auto']} // La den justere seg
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: COLORS.line, strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Line
          type="monotone"
          dataKey="value" // Bruker 'value' fra TimeSeriesDataPoint
          stroke={COLORS.line}
          strokeWidth={2}
          dot={{ r: 3, fill: COLORS.line }}
          activeDot={{ r: 6 }}
          name={lineLabel} // Bruker prop for legend/tooltip
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartPlot;