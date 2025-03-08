"use client";

import L from "leaflet";
import { useState, useEffect } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";

// ✅ Oppretter ikon for markører
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
  number?: number;
  location?: string;
  par: number;
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
const MapAdminComponentNoSSR = ({
  selectedType,
  setDistanceMeasurements,
  setHoles,
  setKurvLabel,
}: {
  selectedType: MarkerType | null;
  setDistanceMeasurements: (distances: string[]) => void;
  setHoles: (holes: { latitude: number; longitude: number; number: number; par: number }[]) => void;
  setKurvLabel: (label: string) => void;
}) => {
  const [markers, setMarkers] = useState<CourseMarker[]>([]);

  // 📌 Legg til en ny markør ved klikk på kartet
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (!selectedType) {
      alert("Velg en markørtype først!");
      return;
    }

    const { lat, lng } = e.latlng;
    let newMarker: CourseMarker;

    if (selectedType === "kurv") {
      const existingKurver = markers.filter(m => m.type === "kurv");
      const kurvNumber = existingKurver.length + 1;

      newMarker = {
        id: Math.random().toString(),
        name: `Kurv ${kurvNumber}`,
        latitude: lat,
        longitude: lng,
        type: "kurv",
        number: kurvNumber,
        par: 3,
      };

      setKurvLabel(`Kurv ${kurvNumber + 1}`);
    } else if (selectedType === "mål") {
      newMarker = {
        id: Math.random().toString(),
        name: "Mål",
        latitude: lat,
        longitude: lng,
        type: "mål",
        par: 3,
      };
    } else if (selectedType === "bane") {
      const locationData = await fetchLocationData(lat, lng);
      const location = `${locationData.city}, ${locationData.county}`;

      const locationField = document.getElementById("courseLocation") as HTMLInputElement;
      const latField = document.getElementById("courseLat") as HTMLInputElement;
      const lngField = document.getElementById("courseLng") as HTMLInputElement;

      if (locationField) locationField.value = location;
      if (latField) latField.value = lat.toFixed(6);
      if (lngField) lngField.value = lng.toFixed(6);

      newMarker = {
        id: Math.random().toString(),
        name: "Bane",
        latitude: lat,
        longitude: lng,
        type: "bane",
        location,
        par: 3,
      };
    } else {
      newMarker = {
        id: Math.random().toString(),
        name: selectedType.charAt(0).toUpperCase() + selectedType.slice(1),
        latitude: lat,
        longitude: lng,
        type: selectedType,
        par: 3,
      };
    }

    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);
    updateDistances(updatedMarkers);

    setHoles(
      updatedMarkers
        .filter(m => m.type === "kurv")
        .map((kurv, index) => ({
          latitude: kurv.latitude,
          longitude: kurv.longitude,
          number: index + 1,  // 🔥 Sikrer at number ALDRI er undefined
          par: kurv.par || 3,  // 🔥 Sikrer at par ALDRI er undefined
        }))
    );
    
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

    setDistanceMeasurements(distances);
  };

  return (
    <MapContainer center={adminCenter} zoom={6} scrollWheelZoom style={{ height: "600px", width: "100%", borderRadius: "12px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
      <MapClickHandler onMapClick={handleMapClick} />

      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={createIcon("map-marker", markerColors[marker.type])}
        >
          <Popup>{marker.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapAdminComponentNoSSR;
