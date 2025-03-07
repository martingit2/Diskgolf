"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// 📌 Definer props for `selectedType`
interface MapAdminProps {
  selectedType: "bane" | "start" | "kurv" | "mål" | null;
}

// Dynamisk import av kart for å unngå SSR-problemer
const DynamicMap = dynamic(() => import("./MapAdminComponentNoSSR"), { ssr: false });

const MapAdminComponent: React.FC<MapAdminProps> = ({ selectedType }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <p style={{ textAlign: "center" }}>Laster inn...</p>;
  }

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <DynamicMap selectedType={selectedType} />
    </div>
  );
};

export default MapAdminComponent;
