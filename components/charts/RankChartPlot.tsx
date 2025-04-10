// components/charts/RankChartPlot.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { RankDataPoint } from '@/app/[lng]/(protected)/stats/page'; // Importer felles interface

interface RankChartPlotProps {
  data: RankDataPoint[];
  xLabel?: string;
  yLabel?: string;
  lineLabel?: string;
}

// Fargepalett (hardkodet)
const COLORS = {
  line: "#22c55e",        // Grønn for rank
  grid: "#e5e7eb",
  textMuted: "#6b7280",
  tooltipBg: "rgba(255, 255, 255, 0.95)",
  tooltipBorder: "#d1d5db",
  axisLabel: "#4b5563",
  tooltipHeader: "#1f2937",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as RankDataPoint;
    if (!dataPoint) return null;

    const formattedDate = new Date(dataPoint.date).toLocaleDateString('nb-NO', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
      <div style={{ backgroundColor: COLORS.tooltipBg, padding: '10px', border: `1px solid ${COLORS.tooltipBorder}`, borderRadius: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: '12px' }}>
        <p style={{ fontWeight: 600, color: COLORS.tooltipHeader, marginBottom: '4px' }}>{formattedDate}</p>
        <p style={{ color: COLORS.line }}>
          {payload[0].name || 'Plassering'}: <span style={{ fontWeight: 700 }}>{dataPoint.value}.</span> {/* Legg til punktum */}
        </p>
      </div>
    );
  }
  return null;
};

const RankChartPlot = ({
  data = [],
  xLabel = "Dato",
  yLabel = "Plassering",
  lineLabel = "Plassering"
}: RankChartPlotProps) => {

  // Sjekk for nok data
  if (!data || data.length < 2) {
    return <div className="h-full flex items-center justify-center text-sm" style={{ color: COLORS.textMuted }}>For lite data for plasseringsutvikling (trenger minst 2 turneringer).</div>;
  }

  // Finn høyeste rank for å sette Y-akse domene
  const maxRank = Math.max(...data.map(d => d.value), 1); // Minst 1

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 25 }}
      >
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
          reversed={true} // --- VIKTIG: Reverserer aksen ---
          domain={[1, maxRank]} // Starter på 1, går til høyeste rank
          allowDecimals={false} // Rank er heltall
          tickFormatter={(value) => `${value}.`} // Legg til punktum etter rank
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: COLORS.line, strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Line
          type="step" // 'step' kan være bra for rank, ellers 'monotone'
          dataKey="value" // Bruker 'value' (som er rank)
          stroke={COLORS.line}
          strokeWidth={2}
          dot={{ r: 3, fill: COLORS.line }}
          activeDot={{ r: 6 }}
          name={lineLabel}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RankChartPlot;