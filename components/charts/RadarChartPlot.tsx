// Fil: components/charts/RadarChartPlot.tsx
// Formål: Definerer en gjenbrukbar React-komponent for å vise et radardiagram ved hjelp av Recharts-biblioteket.
//         Komponenten visualiserer fleraksede data (f.eks. ulike prestasjonsmetrikker),
//         og inkluderer tilpassede tooltips, dynamisk skalering av akser og grunnleggende datahåndtering.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark?: number;
}

interface RadarChartPlotProps {
    data: RadarDataPoint[];
}

// Definer fargepalett
const COLORS = {
  radarLine: "#3b82f6", // Blå
  radarFill: "rgba(59, 130, 246, 0.4)", // Gjennomsiktig blå
  grid: "#e5e7eb",
  angleText: "#4b5563", // Litt mørkere grå for lesbarhet
  radiusText: "#9ca3af", // Lysere grå for skala
  tooltipBg: "rgba(255, 255, 255, 0.9)",
  tooltipBorder: "#d1d5db",
};


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
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
        <p style={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>{data.subject}</p>
        <p style={{ color: COLORS.radarLine }}>
          Verdi: <span style={{ fontWeight: 700 }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const RadarChartPlot = ({ data = [] }: RadarChartPlotProps) => {
   const validData = data.filter(item => typeof item.value === 'number' && !isNaN(item.value));

   if (validData.length < 3) { // Radar trenger minst 3 punkter
     return <div className="h-full flex items-center justify-center" style={{ color: COLORS.angleText }}>Trenger minst 3 datapunkter for radar.</div>;
   }

  const calculatedMax = Math.max(...validData.map(d => d.value), 0) * 1.2;
  const domainMax = calculatedMax > 0 ? Math.ceil(calculatedMax / 5) * 5 : 10; // Rund opp til nærmeste 5 eller 10

  const processedData = validData.map(item => ({
      ...item,
      fullMark: domainMax
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart
        cx="50%" cy="50%"
        outerRadius="75%" // Litt mindre for å gi plass til labels
        data={processedData}
        margin={{ top: 15, right: 25, left: 25, bottom: 10 }} // Mer plass rundt
      >
        <PolarGrid stroke={COLORS.grid} />
        <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: COLORS.angleText, fontSize: 11 }}
            stroke={COLORS.grid} // Bruk grid-farge for linjen
            tickLine={false}
        />
        <PolarRadiusAxis
            angle={90}
            domain={[0, domainMax]}
            tickCount={5} // Juster antall sirkler
            tick={{ fill: COLORS.radiusText, fontSize: 9 }}
            axisLine={false}
         />
        <Radar
          name="Din Prestasjon"
          dataKey="value"
          stroke={COLORS.radarLine}
          fill={COLORS.radarFill}
          fillOpacity={1} // La fill-fargen styre opacity
          strokeWidth={1.5}
        />
         <Tooltip content={<CustomTooltip />} cursor={{ stroke: COLORS.radarLine, strokeWidth: 1, fill: 'none' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartPlot;