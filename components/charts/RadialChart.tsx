// Fil: components/charts/RadialChartPlot.tsx
// Formål: Definerer en gjenbrukbar React-komponent for å vise et radialt søylediagram ved hjelp av Recharts-biblioteket.
//         Komponenten visualiserer kategorisk data (f.eks. turneringsplasseringer) som radiale søyler,
//         inkluderer sentrert tekst (f.eks. totalt antall), tilpassede tooltips, legender og håndterer fargetildeling og sortering av data.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, Cell, PolarAngleAxis } from 'recharts';

interface RadialDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface RadialChartPlotProps {
  data: RadialDataPoint[];
  totalPlayed?: number;
}

// Definer fargepalett
const COLORS = {
  pie1: "#3b82f6", // Blå
  pie2: "#10b981", // Grønn/Teal
  pie3: "#f97316", // Oransje
  backgroundBar: "#f3f4f6", // Lys grå for bakgrunn
  textCenter: "#1f2937", // Mørk grå for sentertekst
  textCenterSub: "#6b7280", // Medium grå for subtekst
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
        <p style={{ fontWeight: 600, color: data.fill, marginBottom: '4px' }}>{data.name}</p>
        <p style={{ color: '#374151' }}>Antall: <span style={{ fontWeight: 700 }}>{data.value}</span></p>
      </div>
    );
  }
  return null;
};

const RadialChartPlot = ({ data = [], totalPlayed = 0 }: RadialChartPlotProps) => {
   const validData = data.filter(item => item.value > 0);

   if (validData.length === 0) {
    return <div className="h-full flex items-center justify-center" style={{ color: COLORS.textCenterSub }}>Ingen plasseringsdata.</div>;
  }

   validData.sort((a, b) => b.value - a.value);

   const sumOfValues = validData.reduce((acc, item) => acc + item.value, 0);
   const scaleTotal = Math.max(totalPlayed, sumOfValues, 1);
   const domainMax = scaleTotal > 0 ? scaleTotal : 1;

    // Tildel farger fra paletten dynamisk
   const coloredData = validData.map((item, index) => ({
       ...item,
       fill: [COLORS.pie1, COLORS.pie2, COLORS.pie3][index % 3] // Gjenbruk farger
   }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="40%" // Større hull
        outerRadius="95%"
        data={coloredData} // Bruk data med farger
        startAngle={90}
        endAngle={-270}
        barSize={12} // Litt tynnere barer
        margin={{ top: 0, right: 0, bottom: 30, left: 0 }} // Mer plass til legend
      >
         <PolarAngleAxis type="number" domain={[0, domainMax]} angleAxisId={0} tick={false} />

        <RadialBar
          background={{ fill: COLORS.backgroundBar }}
          cornerRadius={6}
          dataKey="value"
          angleAxisId={0}
          // Fjern label inne i baren
          // label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
        >
          {coloredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </RadialBar>

         {/* Sentrert tekst */}
         {totalPlayed > 0 && (
           <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ fill: COLORS.textCenter, fontSize: '20px', fontWeight: 600 }}>
             {totalPlayed}
             <tspan x="50%" dy="1.3em" style={{ fill: COLORS.textCenterSub, fontSize: '11px', fontWeight: 400 }}>Turneringer</tspan>
           </text>
         )}

        <Legend
          layout="horizontal" verticalAlign="bottom" align="center"
          iconType='circle' iconSize={8}
          wrapperStyle={{ fontSize: '11px', bottom: '0px' }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default RadialChartPlot;