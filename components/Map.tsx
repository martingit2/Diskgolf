/** 
 * Filnavn: Map.tsx
 * Beskrivelse: Kartkomponent for visning av diskgolfbaner. 
 * Laster Leaflet dynamisk for å unngå server-side rendering (SSR) problemer.
 * Utvikler: Martin Pettersen
 */


"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Last Leaflet dynamisk for å unngå SSR-problemer
const MapNoSSR = dynamic(() => import("./MapComponent"), { ssr: false });

const Map = () => {
  return (
    <div
      style={{
        height: "520px",
        width: "100%",
        padding: "12px",
        backgroundColor: "#292C3D",
        borderRadius: "20px",
        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
        overflow: "hidden",
        margin: "20px auto",
      }}
    >
      <MapNoSSR />
    </div>
  );
};

export default Map;
