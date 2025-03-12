"use client";

import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";

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
          <Popup>Startpunkt {index + 1}</Popup>
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
          <Popup>Mål</Popup>
        </Marker>
      )}

      {/* OB-områder som polygoner */}
      {courseData.obZones?.map((obZone: any, index: number) => (
        obZone.coordinates && obZone.coordinates.length > 2 ? (
          <Polygon
            key={index}
            positions={obZone.coordinates.map((coord: any) => [coord.latitude, coord.longitude])}
            color="red"
            fillOpacity={0.3}
          >
            <Popup>OB-område</Popup>
          </Polygon>
        ) : null
      ))}
    </MapContainer>
  );
};

export default CourseMap;
