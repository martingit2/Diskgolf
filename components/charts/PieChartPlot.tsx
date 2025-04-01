// components/charts/PieChartPlot.tsx
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

// Definer fargepalett
const COLORS = {
  pie1: "#3b82f6", // Blå
  pie2: "#10b981", // Grønn/Teal
  textMuted: "#6b7280",
  tooltipBg: "rgba(255, 255, 255, 0.9)",
  tooltipBorder: "#d1d5db",
  pieLabelText: "#ffffff", // Hvit tekst inne i segmenter
  pieSeparator: "rgba(255, 255, 255, 0.5)", // Lys separator
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.totalGames; // Hent total
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

    return (
      <div style={{
          backgroundColor: COLORS.tooltipBg,
          padding: '10px',
          border: `1px solid ${COLORS.tooltipBorder}`,
          borderRadius: '6px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          fontSize: '12px',
          backdropFilter: 'blur(4px)',
        }}>
        <p style={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>{data.name}</p>
        <p style={{ color: data.fill /* Bruk fill-fargen fra data */ }}>
          Antall spill: <span style={{ fontWeight: 700 }}>{data.value}</span> ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};


const PieChartPlot = ({
  singleplayerCount = 0,
  multiplayerCount = 0
}: PieChartPlotProps) => {
  const totalGames = singleplayerCount + multiplayerCount;
  // Legg til farge og total i dataobjektet for enklere tilgang i tooltip/label
  const data = [
    { name: 'Alenespill', value: singleplayerCount, totalGames, fill: COLORS.pie1 },
    { name: 'Vennespill', value: multiplayerCount, totalGames, fill: COLORS.pie2 },
  ].filter(item => item.value > 0);

  if (totalGames === 0) {
    return <div className="h-full flex items-center justify-center" style={{ color: COLORS.textMuted }}>Ingen spilldata.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
         <Tooltip content={<CustomTooltip />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90} // Litt større
          innerRadius={55} // Litt større hull
          paddingAngle={3}
          cornerRadius={5}
          labelLine={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => { // Legg til value
             const RADIAN = Math.PI / 180;
             const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
             // Beregn posisjon litt lenger ut for bedre lesbarhet
             const radiusLabel = innerRadius + (outerRadius - innerRadius) * 0.6;
             const x = cx + radiusLabel * Math.cos(-midAngle * RADIAN);
             const y = cy + radiusLabel * Math.sin(-midAngle * RADIAN);

             if (percent < 0.05) return null; // Ikke vis label for veldig små segmenter

             return (
               <text x={x} y={y} fill={COLORS.pieLabelText} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
                  {/* Vis verdi i stedet for prosent? */}
                  {value}
                  {/* <tspan x={x} dy="1.1em" fontSize={8} opacity={0.8}>{name}</tspan> */}
               </text>
             );
           }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} stroke={COLORS.pieSeparator} strokeWidth={1} />
          ))}
        </Pie>
        <Legend
           iconType="circle" layout="horizontal" verticalAlign="bottom" align="center"
           iconSize={8}
           wrapperStyle={{ fontSize: '11px', bottom: '0px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartPlot;