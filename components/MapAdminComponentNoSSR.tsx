"use client";

import L from "leaflet";
import { useState, useEffect } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMapEvent, Circle, Polygon } from "react-leaflet";
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
type MarkerType = "bane" | "start" | "kurv" | "mål" | "ob"; // Legg til "ob"

interface CourseMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: MarkerType;
  number?: number;
  location?: string;
  par: number;
  polygon?: [number, number][]; // Legg til polygon for OB-områder
}

// ✅ Fargemapping for markører
const markerColors: Record<MarkerType, "blue" | "red" | "green" | "orange" | "cadetblue"> = {
  bane: "blue",
  start: "green",
  kurv: "orange",
  mål: "red",
  ob: "red", // Farge for OB-områder
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
  setStartPoints, // Legg til denne
  setGoalPoint,  // Legg til denne
  setObZones,    // Legg til denne
}: {
  selectedType: MarkerType | null;
  setDistanceMeasurements: (distances: string[]) => void;
  setHoles: (holes: { latitude: number; longitude: number; number: number; par: number }[]) => void;
  setKurvLabel: (label: string) => void;
  setStartPoints: (startPoints: { lat: number; lng: number }[]) => void; // Legg til denne
  setGoalPoint: (goalPoint: { lat: number; lng: number } | null) => void; // Legg til denne
  setObZones: (obZones: { lat: number; lng: number }[]) => void; // Legg til denne
}) => {
  const [markers, setMarkers] = useState<CourseMarker[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]); // Tilstand for polygonpunkter
  const [editingPolygonId, setEditingPolygonId] = useState<string | null>(null); // Tilstand for redigering av polygon

  // 🔄 Oppdater startpunkter, målpunkt og OB-soner når markører endres
  useEffect(() => {
    if (typeof setStartPoints !== "function") {
      console.error("setStartPoints er ikke en funksjon");
      return;
    }
  
    const startPoints = markers
      .filter(marker => marker.type === "start")
      .map(marker => ({ lat: marker.latitude, lng: marker.longitude }));

    const goalPoint = markers.find(marker => marker.type === "mål");
    const obZones = markers
      .filter(marker => marker.type === "ob")
      .map(marker => ({ lat: marker.latitude, lng: marker.longitude }));

    setStartPoints(startPoints);
    setGoalPoint(goalPoint ? { lat: goalPoint.latitude, lng: goalPoint.longitude } : null);
    setObZones(obZones);
  }, [markers]);

  // 🔍 Oppdater avstander mellom markører (inkludert OB-områder)
  const updateDistances = (updatedMarkers: CourseMarker[]) => {
    const distances: string[] = [];

    // Sorter markører basert på type for å få en logisk rekkefølge
    const sortedMarkers = updatedMarkers.sort((a, b) => {
      const order = ["bane", "start", "kurv", "mål", "ob"];
      return order.indexOf(a.type) - order.indexOf(b.type);
    });

    for (let i = 0; i < sortedMarkers.length - 1; i++) {
      const fromMarker = sortedMarkers[i];
      const toMarker = sortedMarkers[i + 1];

      const distance = calculateDistance(
        fromMarker.latitude,
        fromMarker.longitude,
        toMarker.latitude,
        toMarker.longitude
      );

      distances.push(`Fra ${fromMarker.name} til ${toMarker.name}: ${distance.toFixed(2)} km`);
    }

    setDistanceMeasurements(distances);
  };

  // 📌 Legg til en ny markør eller polygonpunkt ved klikk på kartet
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (!selectedType) {
      alert("Velg en markørtype først!");
      return;
    }

    const { lat, lng } = e.latlng;

    if (selectedType === "ob") {
      // Legg til punkt i polygon
      setPolygonPoints([...polygonPoints, [lat, lng]]);
    } else {
      // Resten av logikken for andre markørtyper
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
            number: index + 1,
            par: kurv.par || 3,
          }))
      );
    }
  };

  // 🟢 Fullfør polygon og legg til som en markør
  const completePolygon = () => {
    if (polygonPoints.length < 3) {
      alert("Et polygon må ha minst 3 punkter!");
      return;
    }

    const newMarker: CourseMarker = {
      id: editingPolygonId || Math.random().toString(), // Bruk eksisterende ID hvis redigering
      name: "OB-område",
      latitude: polygonPoints[0][0], // Bruk første punkt som "hovedposisjon"
      longitude: polygonPoints[0][1],
      type: "ob",
      polygon: polygonPoints, // Lagre polygonpunktene
      par: 0, // OB har ingen par
    };

    // Oppdater eller legg til nytt OB-område
    if (editingPolygonId) {
      const updatedMarkers = markers.map(marker =>
        marker.id === editingPolygonId ? newMarker : marker
      );
      setMarkers(updatedMarkers);
      setEditingPolygonId(null); // Avslutt redigeringsmodus
    } else {
      setMarkers([...markers, newMarker]);
    }

    setPolygonPoints([]); // Tilbakestill polygonpunkter
    updateDistances([...markers, newMarker]); // Oppdater avstander
  };

  // 🔴 Slett polygon
  const deletePolygon = (id: string) => {
    if (window.confirm("Er du sikker på at du vil slette dette OB-området?")) {
      const updatedMarkers = markers.filter(marker => marker.id !== id);
      setMarkers(updatedMarkers);
      updateDistances(updatedMarkers); // Oppdater avstander etter sletting
    }
  };

  // ✏️ Rediger polygon
  const editPolygon = (id: string) => {
    const polygonToEdit = markers.find(marker => marker.id === id);
    if (polygonToEdit?.polygon) {
      setPolygonPoints(polygonToEdit.polygon);
      setEditingPolygonId(id);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <MapContainer center={adminCenter} zoom={6} scrollWheelZoom style={{ height: "600px", width: "100%", borderRadius: "12px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        <MapClickHandler onMapClick={handleMapClick} />

        {markers.map(marker => {
          if (marker.type === "start") {
            return (
              <Circle
                key={marker.id}
                center={[marker.latitude, marker.longitude]}
                radius={10}
                color={markerColors[marker.type]}
                eventHandlers={{ click: () => deletePolygon(marker.id) }}
              >
                <Popup>{marker.name} (Klikk for å slette)</Popup>
              </Circle>
            );
          } else if (marker.type === "kurv") {
            return (
              <Circle
                key={marker.id}
                center={[marker.latitude, marker.longitude]}
                radius={10}
                color={markerColors[marker.type]}
                eventHandlers={{ click: () => deletePolygon(marker.id) }}
              >
                <Popup>{marker.name} (Klikk for å slette)</Popup>
              </Circle>
            );
          } else if (marker.type === "ob" && marker.polygon) {
            return (
              <Polygon
                key={marker.id}
                positions={marker.polygon}
                color={markerColors[marker.type]}
                eventHandlers={{ click: () => editPolygon(marker.id) }}
              >
                <Popup>
                  OB-område
                  <button onClick={() => deletePolygon(marker.id)}>Slett</button>
                  <button onClick={() => editPolygon(marker.id)}>Rediger</button>
                </Popup>
              </Polygon>
            );
          } else {
            return (
              <Marker
                key={marker.id}
                position={[marker.latitude, marker.longitude]}
                icon={createIcon("map-marker", markerColors[marker.type])}
                eventHandlers={{ click: () => deletePolygon(marker.id) }}
              >
                <Popup>{marker.name} (Klikk for å slette)</Popup>
              </Marker>
            );
          }
        })}

        {/* Tegn polygonlinjer mens brukeren velger punkter */}
        {polygonPoints.length > 0 && (
          <Polygon
            positions={polygonPoints}
            color={markerColors["ob"]}
            fillOpacity={0.2}
          />
        )}
      </MapContainer>

      {selectedType === "ob" && (
        <div className="mt-4 space-x-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
            onClick={completePolygon}
          >
            {editingPolygonId ? "Oppdater OB-område" : "Fullfør OB-område"}
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
            onClick={() => setPolygonPoints([])}
          >
            Tilbakestill polygon
          </button>
        </div>
      )}

      {/* 📌 Info-tekst og reset-knapp */}
      <p className="mt-4 text-gray-600 text-sm">Dobbeltklikk på markører for å slette dem.</p>
      <button
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
        onClick={() => {
          setMarkers([]);
          setHoles([]);
          setKurvLabel("Kurv 1");
          setPolygonPoints([]);
          setEditingPolygonId(null);
        }}
      >
        Reset bane
      </button>
    </div>
  );
};

export default MapAdminComponentNoSSR;