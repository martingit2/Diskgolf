// Fil: components/maps/EditCourseMap.tsx
// Formål: Definerer en React-komponent ('use client') for interaktiv redigering av et diskgolfbane-kart ved hjelp av Leaflet.
//         Henter banedata, lar brukere plassere/slette markører (start, kurv, mål), tegne OB-soner (polygoner),
//         beregner avstander mellom punkter, og kaller en `onUpdate`-funksjon når data endres. Inkluderer instruksjoner og tilbakestillingsfunksjon.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import L from "leaflet";
import { useState, useEffect } from "react";
import { MapContainer, Marker, TileLayer, Popup, Polygon, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";

// Definer ObZone-typen
type ObZone = {
  type: "polygon";
  points: [number, number][];
};

interface CourseData {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  par: number;
  description: string;
  difficulty: string;
  startPoints: { lat: number; lng: number }[];
  goalPoint: { lat: number; lng: number } | null;
  holes: { latitude: number; longitude: number; number: number; par: number }[];
  obZones: ObZone[];
}

interface EditCourseMapProps {
  courseId: string;
  onUpdate: (updatedData: CourseData) => void;
  selectedType: "bane" | "start" | "kurv" | "mål" | "ob" | null;
  setDistanceMeasurements: (distances: string[]) => void;
  mapCenter: [number, number]; // Ny prop for kartets senter
}

// Opprett ikon for markører
const createIcon = (iconName: string, markerColor: "blue" | "red" | "green" | "orange" | "cadetblue") => {
  return L.AwesomeMarkers.icon({
    icon: iconName,
    markerColor,
    prefix: "fa",
  });
};

// 📏 Beregn avstand mellom to punkter
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Jordens radius i kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Avstand i kilometer
};

const EditCourseMap = ({ courseId, onUpdate, selectedType, setDistanceMeasurements, mapCenter }: EditCourseMapProps) => {
  const [courseData, setCourseData] = useState<CourseData>({
    id: "",
    name: "",
    location: "",
    latitude: 59.9127,
    longitude: 10.7461,
    par: 3,
    description: "",
    difficulty: "Middels",
    startPoints: [],
    goalPoint: null,
    holes: [],
    obZones: [],
  });

  const [loading, setLoading] = useState(true);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);

  // Hent banedata når komponenten lastes
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) throw new Error("Kunne ikke hente banedata");
        const data = await response.json();

        // Mapper API-data til CourseData-formatet
        const mappedData: CourseData = {
          id: data.id || "",
          name: data.name || "",
          location: data.location || "",
          latitude: data.latitude || 59.9127,
          longitude: data.longitude || 10.7461,
          par: data.par || 3,
          description: data.description || "",
          difficulty: data.difficulty || "Middels",
          startPoints: data.start?.map((start: { latitude: number; longitude: number }) => ({
            lat: start.latitude,
            lng: start.longitude,
          })) || [],
          goalPoint: data.goal
            ? { lat: data.goal.latitude, lng: data.goal.longitude }
            : null,
          holes: data.holes?.map((hole: { latitude: number; longitude: number; number: number; par: number }) => ({
            latitude: hole.latitude,
            longitude: hole.longitude,
            number: hole.number || 1, // Standardverdi for kurvnummer
            par: hole.par || 3, // Standardverdi for par
          })) || [],
          obZones: data.obZones?.map((obZone: { points: [number, number][] }) => ({
            type: "polygon",
            points: obZone.points || [],
          })) || [],
        };

        setCourseData(mappedData);
      } catch (error) {
        console.error("Feil ved henting av banedata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Oppdater avstandsmålinger når banedata endres
  useEffect(() => {
    const updateDistances = () => {
      const distances: string[] = [];

      // Sorter startpunkter og kurver i rekkefølge
      const sortedMarkers = [
        ...courseData.startPoints.map((point, index) => ({
          type: "start",
          name: `Tee ${index + 1}`,
          lat: point.lat,
          lng: point.lng,
        })),
        ...courseData.holes.map((hole) => ({
          type: "kurv",
          name: `Kurv ${hole.number}`,
          lat: hole.latitude,
          lng: hole.longitude,
        })),
      ].sort((a, b) => {
        if (a.type === "start" && b.type === "kurv") return -1;
        if (a.type === "kurv" && b.type === "start") return 1;
        return 0;
      });

      // Beregn avstander mellom hvert punkt
      for (let i = 0; i < sortedMarkers.length - 1; i++) {
        const from = sortedMarkers[i];
        const to = sortedMarkers[i + 1];

        const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
        distances.push(`Fra ${from.name} til ${to.name}: ${distance.toFixed(2)} km`);
      }

      setDistanceMeasurements(distances);
    };

    if (courseData.startPoints.length > 0 && courseData.holes.length > 0) {
      updateDistances();
    }
  }, [courseData.startPoints, courseData.holes, setDistanceMeasurements]);

  // Håndter klikk på kartet for å legge til nye markører
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!selectedType || !courseData) return;

    const { lat, lng } = e.latlng;
    const updatedData = { ...courseData };

    switch (selectedType) {
      case "bane":
        updatedData.latitude = lat;
        updatedData.longitude = lng;
        break;
      case "start":
        updatedData.startPoints = [...updatedData.startPoints, { lat, lng }];
        break;
      case "kurv":
        updatedData.holes = [
          ...updatedData.holes,
          { latitude: lat, longitude: lng, number: updatedData.holes.length + 1, par: 3 },
        ];
        break;
      case "mål":
        updatedData.goalPoint = { lat, lng };
        break;
      case "ob":
        setPolygonPoints([...polygonPoints, [lat, lng]]);
        break;
      default:
        break;
    }

    setCourseData(updatedData);
    onUpdate(updatedData); // Oppdater forelderkomponenten
  };

  // Fullfør polygon for OB-område
  const completePolygon = () => {
    if (polygonPoints.length < 3) {
      alert("Et polygon må ha minst 3 punkter!");
      return;
    }

    const updatedData = { ...courseData };
    updatedData.obZones = [
      ...updatedData.obZones,
      { type: "polygon", points: polygonPoints },
    ];

    setCourseData(updatedData);
    onUpdate(updatedData);
    setPolygonPoints([]); // Tilbakestill polygonpunkter
  };

  // Slett markører basert på type og indeks
  const handleDeleteMarker = (type: string, index: number) => {
    if (!courseData) return;

    const updatedData = { ...courseData };

    switch (type) {
      case "start":
        updatedData.startPoints.splice(index, 1);
        break;
      case "kurv":
        updatedData.holes.splice(index, 1);
        break;
      case "mål":
        updatedData.goalPoint = null;
        break;
      case "ob":
        updatedData.obZones.splice(index, 1);
        break;
      default:
        break;
    }

    setCourseData(updatedData);
    onUpdate(updatedData); // Oppdater forelderkomponenten
  };

  // Tilbakestill banen
  const resetCourse = () => {
    setCourseData({
      id: courseData.id,
      name: courseData.name,
      location: courseData.location,
      latitude: courseData.latitude,
      longitude: courseData.longitude,
      par: courseData.par,
      description: courseData.description,
      difficulty: courseData.difficulty,
      startPoints: [],
      goalPoint: null,
      holes: [],
      obZones: [],
    });
    setPolygonPoints([]);
    onUpdate({
      ...courseData,
      startPoints: [],
      goalPoint: null,
      holes: [],
      obZones: [],
    });
  };

  if (loading) return <p>Laster banedata...</p>;

  return (
    <div className="flex flex-col items-center">
      <MapContainer
        center={mapCenter} // Bruk kartets senter fra props
        zoom={15}
        maxZoom={18}
        scrollWheelZoom
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Håndter klikk på kartet */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Vis startpunkter */}
        {courseData.startPoints.map((point, index) => (
          <Marker
            key={`start-${index}`}
            position={[point.lat, point.lng]}
            icon={createIcon("flag", "green")}
            eventHandlers={{
              click: () => handleDeleteMarker("start", index),
            }}
          >
            <Popup>Tee {index + 1} (Klikk for å slette)</Popup>
          </Marker>
        ))}

        {/* Vis kurver */}
        {courseData.holes.map((hole, index) => (
          <Marker
            key={`kurv-${index}`}
            position={[hole.latitude, hole.longitude]}
            icon={createIcon("circle", "orange")}
            eventHandlers={{
              click: () => handleDeleteMarker("kurv", index),
            }}
          >
            <Popup>Kurv {hole.number} (Klikk for å slette)</Popup>
          </Marker>
        ))}

        {/* Vis mål */}
        {courseData.goalPoint && (
          <Marker
            position={[courseData.goalPoint.lat, courseData.goalPoint.lng]}
            icon={createIcon("flag-checkered", "red")}
            eventHandlers={{
              click: () => handleDeleteMarker("mål", 0),
            }}
          >
            <Popup>Mål (Klikk for å slette)</Popup>
          </Marker>
        )}

        {/* Vis OB-områder */}
        {courseData.obZones.map((zone, index) => (
          <Polygon
            key={`ob-${index}`}
            positions={zone.points}
            color="red"
            fillOpacity={0.3}
            eventHandlers={{
              click: () => handleDeleteMarker("ob", index),
            }}
          >
            <Popup>OB-område (Klikk for å slette)</Popup>
          </Polygon>
        ))}

        {/* Tegn polygonlinjer mens brukeren velger punkter */}
        {polygonPoints.length > 0 && (
          <Polygon
            positions={polygonPoints}
            color="red"
            fillOpacity={0.2}
          />
        )}
      </MapContainer>

      {/* Informasjonstekst og knapper */}
      <div className="mt-4 w-full max-w-7xl">
        <h2 className="text-md font-semibold text-gray-900 mb-3">Hvordan redigere banen</h2>
        <div className="text-xs text-gray-600 space-y-1">
          <p>Dobbelklikk markører for å <strong>slette</strong> dem.</p>
          <p>Plasser et <strong>tee-punkt</strong> for å angi starten på hullet.</p>
          <p>Deretter plasserer du en <strong>kurv</strong> for å angi målet.</p>
          <p>Gjenta dette for <strong>tee og kurver til</strong> du er på siste kurv.</p>
          <p>For siste tee setter du en <strong>tee og avslutter med mål som</strong> siste kurv.</p>
          <p>Om nødvendig, marker <strong>OB-områder</strong> for å definere out-of-bounds-soner.</p>
          <p>For å sette <strong>OB-områder</strong> klikk ob og plasser 3 punkter på kartet og deretter klikk fullfør ob-område.</p>
          
        </div>

        {/* Knapper for OB-område og tilbakestilling */}
        {selectedType === "ob" && (
          <div className="mt-4 space-x-2">
            <button
              onClick={completePolygon}
              className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Fullfør OB-område
            </button>
            <button
              onClick={() => setPolygonPoints([])}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Tilbakestill polygon
            </button>
          </div>
        )}

        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
          onClick={resetCourse}
        >
          Tilbakestill bane
        </button>
      </div>
    </div>
  );
};

// Hjelpekomponent for å håndtere kartklikk
const MapClickHandler = ({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) => {
  useMapEvent("click", onMapClick);
  return null;
};

export default EditCourseMap;