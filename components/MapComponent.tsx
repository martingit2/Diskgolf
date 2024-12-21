"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";


// Sett opp Leaflet Awesome Markers
const createIcon = (
  iconName: string,
  markerColor: "red" | "darkred" | "orange" | "green" | "darkgreen" | "blue" | "purple" | "darkpurple" | "cadetblue"
) => {
  return L.AwesomeMarkers.icon({
    icon: iconName,
    markerColor: markerColor, // Farge for markøren
    prefix: "fa", // Bruker FontAwesome som ikonbibliotek
  });
};

// Startposisjon for USN Bø
const usnCenter: [number, number] = [59.4125, 9.0658];

// Baner med navn, koordinater og farger
const courses = [
  { id: 1, name: "Bane 1 - Oslo", coords: [59.9139, 10.7522], color: "blue" as const },
  { id: 2, name: "Bane 2 - Bergen", coords: [60.3913, 5.3221], color: "red" as const },
  { id: 3, name: "Bane 3 - Stavanger", coords: [58.969, 5.7331], color: "green" as const },
  { id: 4, name: "Bane 4 - Trondheim", coords: [63.4305, 10.3951], color: "purple" as const },
];

const MapComponent = () => (
  <MapContainer
    center={usnCenter}
    zoom={6}
    scrollWheelZoom
    style={{ height: "100%", width: "100%", borderRadius: "12px" }}
  >
    {/* Kartlag fra OpenStreetMap */}
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />

    {/* Markør for hovedposisjon */}
    <Marker
      position={usnCenter}
      icon={createIcon("university", "orange")} // Bruker "university"-ikon
    >
      <Popup>
        <h2 className="font-bold">USN Sør-Øst Norge</h2>
        <p>Bø, Telemark</p>
      </Popup>
    </Marker>

    {/* Dynamisk genererte markører for baner */}
    {courses.map((course) => (
      <Marker
        key={course.id}
        position={course.coords as L.LatLngExpression}
        icon={createIcon("golf-ball", course.color)} // Bruker golf-ball som ikon med spesifisert farge
      >
        <Popup>
          <h2 className="font-bold">{course.name}</h2>
          <p>Koordinater: {course.coords.join(", ")}</p>
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);

export default MapComponent;
