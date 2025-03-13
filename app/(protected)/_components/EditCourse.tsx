"use client";

import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";

const createIcon = (iconName: string, markerColor: "blue" | "green" | "red" | "orange") => {
  return L.AwesomeMarkers.icon({
    icon: iconName,
    markerColor,
    prefix: "fa",
  });
};

const EditCourseMap = ({
  startPoints,
  goalPoint,
  holes,
  obZones,
  latitude,
  longitude,
}: {
  startPoints: { lat: number; lng: number }[];
  goalPoint: { lat: number; lng: number } | null;
  holes: { latitude: number; longitude: number }[];
  obZones: { type: "circle" | "polygon"; lat?: number; lng?: number; points?: [number, number][] }[];
  latitude: number;
  longitude: number;
}) => {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Start/Tee punkter */}
      {startPoints.map((startPoint, index) => (
        <Marker
          key={index}
          position={[startPoint.lat, startPoint.lng]}
          icon={createIcon("flag", "green")}
        >
          <Popup>Tee {index + 1}</Popup>
        </Marker>
      ))}

      {/* Kurver */}
      {holes.map((hole, index) => (
        <Marker
          key={index}
          position={[hole.latitude, hole.longitude]}
          icon={createIcon("circle", "orange")}
        >
          <Popup>Kurv {index + 1}</Popup>
        </Marker>
      ))}

      {/* Mål */}
      {goalPoint && (
        <Marker
          position={[goalPoint.lat, goalPoint.lng]}
          icon={createIcon("flag-checkered", "red")}
        >
          <Popup>Sluttkurv</Popup>
        </Marker>
      )}

      {/* OB-områder som polygoner */}
      {obZones.map((obZone, index) =>
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

export default EditCourseMap;