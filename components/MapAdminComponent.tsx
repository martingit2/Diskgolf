"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// 📌 Update Props Interface
interface MapAdminProps {
  selectedType: "bane" | "start" | "kurv" | "mål" | null;
  setDistanceMeasurements: (distances: string[]) => void;
  setHoles: (holes: { latitude: number; longitude: number; number: number; par: number; }[]) => void;
  setKurvLabel: (label: string) => void;
}

// Dynamisk import av kart for å unngå SSR-problemer
const DynamicMap = dynamic(() => import("./MapAdminComponentNoSSR"), { ssr: false });

const MapAdminComponent: React.FC<MapAdminProps> = ({
  selectedType,
  setDistanceMeasurements,
  setHoles,
  setKurvLabel,
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
      />
    </div>
  );
};

export default MapAdminComponent;
