// components/charts/AreaChartPlot.tsx
"use client";

import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';
import { TimeSeriesDataPoint } from '@/app/(protected)/stats/page'; // Importer felles interface

interface AreaChartPlotProps {
  data: TimeSeriesDataPoint[];
  xLabel?: string;
  yLabel?: string;
  areaLabel?: string;
  lineLabel?: string;
}

// Fargepalett
const COLORS = {
  areaFill: "rgba(136, 132, 216, 0.4)", // Lys lilla for area fill
  areaStroke: "#8884d8", // Lilla for area stroke
  line: "#f97316",      // Oransje for OB line
  grid: "#e5e7eb",
  textMuted: "#6b7280",
  tooltipBg: "rgba(255, 255, 255, 0.95)",
  tooltipBorder: "#d1d5db",
  axisLabel: "#4b5563",
  tooltipHeader: "#1f2937",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as TimeSeriesDataPoint;
    if (!dataPoint) return null;

    const formattedDate = new Date(dataPoint.date).toLocaleDateString('nb-NO', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
      <div style={{ /* ... (stil) ... */ backgroundColor: COLORS.tooltipBg, padding: '10px', border: `1px solid ${COLORS.tooltipBorder}`, borderRadius: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: '12px' }}>
        <p style={{ fontWeight: 600, color: COLORS.tooltipHeader, marginBottom: '6px' }}>{formattedDate}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} style={{ color: entry.color, marginBottom: '2px' }}>
            {entry.name}: <span style={{ fontWeight: 700 }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AreaChartPlot = ({
  data = [],
  xLabel = "Dato",
  yLabel = "Verdi",
  areaLabel = "Score",
  lineLabel = "OB Kast"
}: AreaChartPlotProps) => {

  // --- Sjekk for nok data ---
  if (!data || data.length < 2) {
    return <div className="h-full flex items-center justify-center text-sm" style={{ color: COLORS.textMuted }}>For lite data for arealdiagram (trenger minst 2 punkter).</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 25 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.areaStroke} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={COLORS.areaStroke} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis
          type="number"
          dataKey="timestamp"
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
          domain={['auto', 'auto']}
          allowDecimals={false} // Viser vanligvis heltall for score/OB
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: COLORS.areaStroke, strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Legend verticalAlign="top" height={30} iconSize={10}/>
        <Area
          type="monotone"
          dataKey="value" // Score (totalScore)
          stroke={COLORS.areaStroke}
          fillOpacity={1}
          fill="url(#colorValue)" // Bruker gradient definert i <defs>
          strokeWidth={2}
          name={areaLabel}
          dot={false} // Kan fjerne dots for et renere utseende
        />
        {/* Sjekk om value2 (OB) finnes i dataen før linjen tegnes */}
        {data.some(d => d.value2 !== undefined && d.value2 > 0) && (
          <Line
            type="monotone"
            dataKey="value2" // OB
            stroke={COLORS.line}
            strokeWidth={1.5}
            dot={false}
            name={lineLabel}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartPlot;