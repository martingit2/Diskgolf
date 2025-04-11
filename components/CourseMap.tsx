// Fil: components/CourseMap.tsx
// Formål: Definerer en React-komponent ('use client') som viser et interaktivt Leaflet-kart for en spesifikk bane.
//         Komponenten henter banedata (startpunkter, kurver, mål, OB-soner) fra et API-endepunkt basert på `courseId`,
//         og rendrer disse elementene på kartet med tilpassede ikoner (AwesomeMarkers).
//         Inkluderer også `AutoResizeMapMobile` for bedre visning på mobile enheter.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";

import AutoResizeMapMobile from "./AutoResizeMapMobile"; // <--- Importer komponenten

// Funksjon for å lage ikon
const createIcon = (iconName: string, markerColor: "blue" | "green" | "red" | "orange") => {
  return L.AwesomeMarkers.icon({
    icon: iconName,
    markerColor,
    prefix: "fa",
  });
};

const CourseMap = ({ courseId }: { courseId: string }) => {
  const [courseData, setCourseData] = useState<any | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) throw new Error("Kunne ikke hente baneinformasjon");
        const data = await response.json();
        setCourseData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (!courseData) {
    return <p className="text-center">Laster inn baneinformasjon...</p>;
  }

  return (
    <MapContainer
      center={[courseData.latitude, courseData.longitude]}
      zoom={15}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      {/* Kaller AutoResizeMapMobile for å sørge for at Leaflet tegner kartet riktig på mobil */}
      <AutoResizeMapMobile />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Start/Tee punkter */}
      {courseData.start?.map((startPoint: any, index: number) => (
        <Marker
          key={index}
          position={[startPoint.latitude, startPoint.longitude]}
          icon={createIcon("flag", "green")}
        >
          <Popup>Tee {index + 1}</Popup>
        </Marker>
      ))}

      {/* Kurver */}
      {courseData.baskets?.map((basket: any, index: number) => (
        <Marker
          key={index}
          position={[basket.latitude, basket.longitude]}
          icon={createIcon("circle", "orange")}
        >
          <Popup>Kurv {index + 1}</Popup>
        </Marker>
      ))}

      {/* Mål */}
      {courseData.goal && (
        <Marker
          position={[courseData.goal.latitude, courseData.goal.longitude]}
          icon={createIcon("flag-checkered", "red")}
        >
          <Popup>Sluttkurv</Popup>
        </Marker>
      )}

      {/* OB-områder som polygoner */}
      {courseData.obZones?.map((obZone: any, index: number) =>
        obZone.points && obZone.points.length > 2 ? (
          <Polygon
            key={index}
            positions={obZone.points}
            color="red"
            fillOpacity={0.3}
          >
            <Popup>OB-område</Popup>
          </Polygon>
        ) : null
      )}
    </MapContainer>
  );
};

export default CourseMap;
