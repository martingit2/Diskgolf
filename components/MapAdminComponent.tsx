"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Oppdater props-interface for å inkludere de nye funksjonene
interface MapAdminProps {
  selectedType: "bane" | "start" | "kurv" | "mål" | "ob" | null;
  setDistanceMeasurements: (distances: string[]) => void;
  setHoles: (holes: { latitude: number; longitude: number; number: number; par: number }[]) => void;
  setKurvLabel: (label: string) => void;
  setStartPoints: (startPoints: { lat: number; lng: number }[]) => void; // Legg til denne linjen
  setGoalPoint: (goalPoint: { lat: number; lng: number } | null) => void; // Legg til denne linjen
  setObZones: (obZones: { lat: number; lng: number }[]) => void; // Legg til denne linjen
}

// Dynamisk import av kart for å unngå SSR-problemer
const DynamicMap = dynamic(() => import("./MapAdminComponentNoSSR"), { ssr: false });

const MapAdminComponent: React.FC<MapAdminProps> = ({
  selectedType,
  setDistanceMeasurements,
  setHoles,
  setKurvLabel,
  setStartPoints,  // Mottar props for startpunktene
  setGoalPoint,   // Mottar props for målpunktet
  setObZones      // Mottar props for OB-soner
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <p style={{ textAlign: "center" }}>Laster inn...</p>;
  }

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <DynamicMap
        selectedType={selectedType}
        setDistanceMeasurements={setDistanceMeasurements}
        setHoles={setHoles}
        setKurvLabel={setKurvLabel}
        setStartPoints={setStartPoints}  // Passer startpunktene
        setGoalPoint={setGoalPoint}   // Passer målpunktet
        setObZones={setObZones}      // Passer OB-soner
      />
    </div>
  );
};

export default MapAdminComponent;