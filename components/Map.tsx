"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Import av Leaflet-ikoner
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-expect-error Ignorerer TypeScript-feil fordi _getIconUrl er en intern egenskap
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// Startposisjon for USN Bø
const usnCenter: [number, number] = [59.4125, 9.0658];

// Liste over baner med koordinater
const courses = [
  { id: 1, name: "Bane 1 - Oslo", coords: [59.9139, 10.7522] },
  { id: 2, name: "Bane 2 - Bergen", coords: [60.3913, 5.3221] },
  { id: 3, name: "Bane 3 - Stavanger", coords: [58.969, 5.7331] },
  { id: 4, name: "Bane 4 - Trondheim", coords: [63.4305, 10.3951] },
];

const Map = () => {
  return (
    <div
      style={{
        height: "520px",
        width: "100%",
        padding: "12px", // Responsiv padding
        backgroundColor: "#292C3D", // HeaderColor på innvendig bakgrunn
       
        borderRadius: "20px", // Mykere avrundede kanter
        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)", // Mer fremtredende skygge
        overflow: "hidden",
        margin: "20px auto", // Sentrer kartet med luft rundt
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "#292C3D", // Dynamisk gradient
         
          borderRadius: "15px", // Innvendige avrundede kanter
          padding: "8px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={usnCenter}
          zoom={6}
          scrollWheelZoom={true}
          style={{
            height: "100%",
            width: "100%",
            borderRadius: "12px", // Mykere hjørner for kartet
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Markør for senterposisjon */}
          <Marker position={usnCenter}>
            <Popup>
              <h2 className="font-bold">USN Sør-Øst Norge</h2>
              <p>Bø, Telemark</p>
            </Popup>
          </Marker>

          {/* Dynamisk genererte markører */}
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
      </div>
    </div>
  );
};

export default Map;
