"use client";

import L from "leaflet";
import { useState } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";

// ✅ Ikonfunksjon for markører
const createIcon = (iconName: string, markerColor: "blue" | "red" | "green" | "orange" | "cadetblue") => {
  return L.AwesomeMarkers.icon({
    icon: iconName,
    markerColor,
    prefix: "fa",
  });
};

// 📍 Startposisjon for admin-kartet
const adminCenter: [number, number] = [59.9127, 10.7461];

// 📌 Typing for markører
type MarkerType = "bane" | "start" | "kurv" | "mål";

interface CourseMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: MarkerType;
  location?: string;
}

// ✅ Fargemapping for markører
const markerColors: Record<MarkerType, "blue" | "green" | "orange" | "red"> = {
  bane: "blue",
  start: "green",
  kurv: "orange",
  mål: "red",
};

// 🔄 Håndter klikk på kartet
const MapClickHandler = ({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) => {
  useMapEvent("click", onMapClick);
  return null;
};

// 🌍 Hent sted og fylke basert på koordinater (kun for Bane)
const fetchLocationData = async (lat: number, lng: number) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();

    if (data.address) {
      return {
        city: data.address.city || data.address.town || data.address.village || "Ukjent sted",
        county: data.address.state || "Ukjent fylke",
      };
    }
  } catch (error) {
    console.error("Feil ved henting av stedsinformasjon:", error);
  }
  return { city: "Ukjent sted", county: "Ukjent fylke" };
};

// 📏 Beregn avstand mellom to punkter
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ✨ Hovedkomponenten
const MapAdminComponentNoSSR = ({ selectedType }: { selectedType: MarkerType | null }) => {
  const [markers, setMarkers] = useState<CourseMarker[]>([]);
  const [distanceText, setDistanceText] = useState<string[]>([]);

  // 📌 Legg til en ny markør ved klikk på kartet
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (!selectedType) {
      alert("Velg en markørtype først!");
      return;
    }

    const { lat, lng } = e.latlng;

    let locationData = { city: "", county: "" };

    // 🔄 Hent sted og fylke hvis markørtypen er "bane"
    if (selectedType === "bane") {
      locationData = await fetchLocationData(lat, lng);

      // ✅ Automatisk oppdatere input-feltene KUN for bane
      const locationField = document.getElementById("courseLocation") as HTMLInputElement;
      const latField = document.getElementById("courseLat") as HTMLInputElement;
      const lngField = document.getElementById("courseLng") as HTMLInputElement;

      if (locationField) locationField.value = `${locationData.city}, ${locationData.county}`;
      if (latField) latField.value = lat.toFixed(6);
      if (lngField) lngField.value = lng.toFixed(6);
    }

    const newMarker: CourseMarker = {
      id: Math.random().toString(),
      name: selectedType.charAt(0).toUpperCase() + selectedType.slice(1),
      latitude: lat,
      longitude: lng,
      type: selectedType,
      location: selectedType === "bane" ? `${locationData.city}, ${locationData.county}` : "",
    };

    setMarkers((prev) => [...prev, newMarker]);

    // 🔄 Oppdater distanser
    updateDistances([...markers, newMarker]);
  };

  // 🗑️ Slett markør ved klikk
  const handleMarkerClick = (id: string) => {
    if (window.confirm("Er du sikker på at du vil slette denne markøren?")) {
      setMarkers((prev) => prev.filter(marker => marker.id !== id));
      updateDistances(markers.filter(marker => marker.id !== id));
    }
  };

  // 🔍 Oppdater avstander mellom markører
  const updateDistances = (updatedMarkers: CourseMarker[]) => {
    const distances: string[] = [];

    for (let i = 0; i < updatedMarkers.length - 1; i++) {
      const distance = calculateDistance(
        updatedMarkers[i].latitude,
        updatedMarkers[i].longitude,
        updatedMarkers[i + 1].latitude,
        updatedMarkers[i + 1].longitude
      );

      distances.push(`Fra ${updatedMarkers[i].name} til ${updatedMarkers[i + 1].name}: ${distance.toFixed(2)} km`);
    }

    setDistanceText(distances);
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* 📌 Konsoll for avstandsmålinger under markørvalg */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "250px",
      }}>
        <div style={{
          width: "100%",
          height: "200px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
          padding: "10px",
          borderRadius: "10px",
          textAlign: "left",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          marginTop: "10px"
        }}>
          <strong>Avstandsmålinger:</strong>
          <pre style={{ whiteSpace: "pre-line", fontSize: "12px", marginTop: "5px" }}>
            {distanceText.length > 0 ? distanceText.join("\n") : "Ingen avstander beregnet ennå"}
          </pre>
        </div>
      </div>

      {/* 🗺️ Kart */}
      <MapContainer center={adminCenter} zoom={6} scrollWheelZoom style={{ height: "600px", width: "100%", borderRadius: "12px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        <MapClickHandler onMapClick={handleMapClick} />

        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={createIcon("map-marker", markerColors[marker.type])}
            eventHandlers={{ click: () => handleMarkerClick(marker.id) }}>
            <Popup>{marker.name} - {marker.location || "Ukjent sted"}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapAdminComponentNoSSR;
