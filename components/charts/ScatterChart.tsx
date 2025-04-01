// components/charts/ScatterChartPlot.tsx
"use client";

import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label,
    ReferenceLine
} from 'recharts';

// Interface for data som komponenten NÅ mottar fra page.tsx
interface ScatterDataPoint {
  x: number; // Timestamp
  y: number; // Score
  name: string; // Tournament name
  rank?: number;
  date: string; // Original dato-string for tooltip
}

interface ScatterChartPlotProps {
  data: ScatterDataPoint[]; // Forventer den transformerte dataen
  xLabel?: string;
  yLabel?: string;
}

// Definer fargepalett med hardkodede verdier
const COLORS = {
  scatterPoint: "#2563eb",    // En klar blåfarge
  referenceLine: "#a1a1aa",   // Mellomgrå (zinc-400)
  grid: "#e5e7eb",            // Lys grå (gray-200)
  textMuted: "#6b7280",        // Dempet tekstfarge (gray-500)
  tooltipBg: "rgba(255, 255, 255, 0.95)", // Halvtransparent hvit
  tooltipBorder: "#d1d5db",     // Grå kantlinje (gray-300)
  axisLabel: "#4b5563",       // Aksetekstfarge (gray-600)
  tooltipHeader: "#1f2937",    // Tooltip-overskrift (gray-800)
  tooltipValue: "#1d4ed8",      // Mørkere blå for score (blue-700)
  tooltipRank: "#111827",      // Mørk tekst for plassering (gray-900)
};

// Forbedret Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as ScatterDataPoint;
    if (!dataPoint) return null;

    // Bruk dataPoint.date (den originale strengen) for formatering
    const formattedDate = new Date(dataPoint.date).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return (
      <div style={{
          backgroundColor: COLORS.tooltipBg,
          padding: '12px',
          border: `1px solid ${COLORS.tooltipBorder}`,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontSize: '13px',
          lineHeight: '1.6',
          backdropFilter: 'blur(5px)',
        }}>
        <p style={{ fontWeight: 600, color: COLORS.tooltipHeader, marginBottom: '5px', borderBottom: `1px solid ${COLORS.grid}`, paddingBottom: '5px' }}>
            {dataPoint.name} {/* Turneringsnavn */}
        </p>
        <p style={{ color: COLORS.textMuted, fontSize: '11px', marginBottom: '8px' }}>
            {formattedDate} {/* Formatert dato */}
        </p>
        <p style={{ color: COLORS.tooltipValue, marginBottom: '3px' }}>
            Score: <span style={{ fontWeight: 700 }}>{dataPoint.y}</span> {/* Score (fra y-verdi) */}
        </p>
         {dataPoint.rank !== undefined && dataPoint.rank !== null && dataPoint.rank > 0 && (
             <p style={{ color: COLORS.tooltipRank }}>
                Plassering: <span style={{ fontWeight: 700 }}>{dataPoint.rank}.</span>
            </p>
         )}
      </div>
    );
  }
  return null;
};


const ScatterChartPlot = ({
  data = [], // Mottar nå ScatterDataPoint[]
  xLabel = "Dato",
  yLabel = "Score"
}: ScatterChartPlotProps) => {

  // Ingen intern transformasjon nødvendig, dataen er allerede i riktig format.
  // Sortering skjer nå i page.tsx før dataen settes i state.

  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm" style={{ color: COLORS.textMuted }}>Ingen turneringsdata å vise.</div>;
  }

  // Beregn gjennomsnittsscore fra den mottatte dataen (som nå er garantert å ha gyldige y-verdier)
  const validScores = data.map(item => item.y).filter(score => typeof score === 'number' && !isNaN(score));
  const avgScore = validScores.length > 0 ? validScores.reduce((sum, item) => sum + item, 0) / validScores.length : NaN;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{ top: 15, right: 25, left: 5, bottom: 30 }} // Justert marginer
      >
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis
          type="number"
          dataKey="x" // Bruker timestamp
          domain={['dataMin', 'dataMax']} // Automatisk domene basert på data
          name={xLabel}
          stroke={COLORS.textMuted}
          fontSize={11}
          // Formaterer timestamp til lesbar dato
          tickFormatter={(unixTime) => {
              // Ekstra sjekk for sikkerhets skyld
              if (typeof unixTime !== 'number' || isNaN(unixTime) || unixTime <= 0) return '';
              try {
                return new Date(unixTime).toLocaleDateString('nb-NO', { month: 'short', year: '2-digit' });
              } catch (e) {
                console.error("Error formatting tick:", unixTime, e);
                return ''; // Returner tom streng ved feil
              }
          }}
          tickLine={false}
          axisLine={{ stroke: COLORS.grid }}
          height={40}
          interval="preserveStartEnd" // Sørger for at første/siste tick vises
          label={{ value: xLabel, position: 'bottom', fill: COLORS.axisLabel, fontSize: 12, dy: 10 }}
        />
        <YAxis
          type="number"
          dataKey="y" // Bruker score
          name={yLabel}
          stroke={COLORS.textMuted}
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: COLORS.grid }}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: COLORS.axisLabel, fontSize: 12, dx: -5 }}
          width={50}
          domain={['auto', 'auto']} // La Recharts bestemme Y-aksens grenser
        />
        <Tooltip
           content={<CustomTooltip />}
           cursor={{ stroke: COLORS.scatterPoint, strokeWidth: 1, strokeDasharray: '3 3' }}
           />
        <Scatter
          name="Turnering"
          data={data} // Bruker den ferdigfiltrerte og transformerte dataen
          fill={COLORS.scatterPoint}
          shape="circle"
          // x og y props er ikke nødvendig, hentes fra XAxis/YAxis dataKey
        />
         {/* Referanselinje for gjennomsnittsscore */}
         {!isNaN(avgScore) && avgScore > 0 && data.length > 1 && (
             <ReferenceLine
                y={avgScore}
                stroke={COLORS.referenceLine}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                    value: `Snitt: ${avgScore.toFixed(1)}`,
                    position: 'insideTopRight',
                    fill: COLORS.referenceLine,
                    fontSize: 10,
                    fontWeight: 500,
                    dy: -6,
                    dx: -5
                }}
            />
         )}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterChartPlot;