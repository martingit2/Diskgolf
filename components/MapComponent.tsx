"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";

// Importer Leaflet-ikoner
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Sett opp Leaflet-ikoner
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const usnCenter: [number, number] = [59.4125, 9.0658];
const courses = [
  { id: 1, name: "Bane 1 - Oslo", coords: [59.9139, 10.7522] },
  { id: 2, name: "Bane 2 - Bergen", coords: [60.3913, 5.3221] },
  { id: 3, name: "Bane 3 - Stavanger", coords: [58.969, 5.7331] },
  { id: 4, name: "Bane 4 - Trondheim", coords: [63.4305, 10.3951] },
];

const MapComponent = () => (
  <MapContainer
    center={usnCenter}
    zoom={6}
    scrollWheelZoom={true}
    style={{ height: "100%", width: "100%", borderRadius: "12px" }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    <Marker position={usnCenter}>
      <Popup>
        <h2 className="font-bold">USN Sør-Øst Norge</h2>
        <p>Bø, Telemark</p>
      </Popup>
    </Marker>
    {courses.map((course) => (
      <Marker
        key={course.id}
        position={course.coords as L.LatLngExpression}
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
