"use client";

import L from "leaflet";
import { useState, useEffect } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";

// ✅ Oppdater ikonfunksjonen for å støtte flere farger
const createIcon = (
  iconName: string,
  markerColor: "blue" | "red" | "green" | "purple" | "orange" | "darkred" | "darkgreen" | "cadetblue"
) => {
  return L.AwesomeMarkers.icon({
    icon: iconName,
    markerColor: markerColor,
    prefix: "fa",
  });
};

// 📍 Startposisjon for admin-kartet
const adminCenter: [number, number] = [59.9127, 10.7461];

// 📌 Typing for markører
interface CourseMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: "bane" | "start" | "kurv" | "mål";
}

// ✅ Bruker en fargemapping for hver type markør
const markerColors: Record<"bane" | "start" | "kurv" | "mål", "blue" | "green" | "orange" | "red"> = {
  bane: "blue",
  start: "green",
  kurv: "orange",
  mål: "red",
};

// 🔄 Håndter klikk på kartet for å legge til bane/start/kurv/mål
const MapClickHandler = ({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) => {
  useMapEvent("click", onMapClick);
  return null;
};

const MapAdminComponentNoSSR = () => {
  const [markers, setMarkers] = useState<CourseMarker[]>([]);

  // 🔄 Hent eksisterende markører ved lasting av kartet
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/map");
        if (response.ok) {
          const data: CourseMarker[] = await response.json();
          setMarkers(data);
        }
      } catch (error) {
        console.error("Feil ved henting av markører:", error);
      }
    };

    fetchCourses();
  }, []);

  // 📌 Legg til en ny markør ved klikk på kartet
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;

    const markerType = prompt("Velg type markør: (bane, start, kurv, mål)");
    if (!markerType || !["bane", "start", "kurv", "mål"].includes(markerType)) return;

    const markerName = prompt("Navn på markøren:");
    if (!markerName) return;

    const newMarker: CourseMarker = {
      id: Math.random().toString(),
      name: markerName,
      latitude: lat,
      longitude: lng,
      type: markerType as "bane" | "start" | "kurv" | "mål",
    };

    setMarkers((prev) => [...prev, newMarker]);
  };

  return (
    <MapContainer center={adminCenter} zoom={6} scrollWheelZoom style={{ height: "600px", width: "100%", borderRadius: "12px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
      <MapClickHandler onMapClick={handleMapClick} />

      {/* 🏌️‍♂️ Rendrer markører dynamisk med riktig farge og ikon */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={createIcon(
            marker.type === "bane"
              ? "golf-ball"
              : marker.type === "start"
              ? "flag"
              : marker.type === "kurv"
              ? "circle"
              : "check",
            markerColors[marker.type]
          )}
        >
          <Popup>{marker.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapAdminComponentNoSSR;
