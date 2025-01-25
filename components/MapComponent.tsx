/** 
 * Filnavn: MapComponent.tsx
 * Beskrivelse: Interaktiv kartkomponent for å vise diskgolfbaner med Leaflet-biblioteket.
 * Inneholder dynamiske markører med popup-informasjon og bruker "Leaflet Awesome Markers" for tilpassede ikoner.
 * Utvikler: Martin Pettersen
 */



"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.awesome-markers/dist/leaflet.awesome-markers.css";
import "leaflet.awesome-markers";

// Sett opp Leaflet Awesome Markers
const createIcon = (
  iconName: string,
  markerColor:
    | "red"
    | "darkred"
    | "orange"
    | "green"
    | "darkgreen"
    | "blue"
    | "purple"
    | "darkpurple"
    | "cadetblue"
) => {
  return L.AwesomeMarkers.icon({
    icon: iconName,
    markerColor: markerColor,
    prefix: "fa",
  });
};

// Startposisjon for USN Bø
const usnCenter: [number, number] = [59.4125, 9.0658];

// Bilde for USN Bø
const usnImage = "/dummybaner/dummy_bane_9.webp";

// Baner med navn, koordinater, bilder og stjerner
const courses = [
  {
    id: 1,
    name: "Dummy Bane 1 - Oslo",
    coords: [59.9139, 10.7522],
    color: "blue" as const,
    image: "/dummybaner/dummy_bane_1.webp",
    stars: 5,
  },
  {
    id: 2,
    name: "Dummy Bane 2 - Bergen",
    coords: [60.3913, 5.3221],
    color: "red" as const,
    image: "/dummybaner/dummy_bane_2.webp",
    stars: 4,
  },
  {
    id: 3,
    name: "Dummy Bane 3 - Stavanger",
    coords: [58.969, 5.7331],
    color: "green" as const,
    image: "/dummybaner/dummy_bane_3.webp",
    stars: 3,
  },
  {
    id: 4,
    name: "Dummy Bane 4 - Trondheim",
    coords: [63.4305, 10.3951],
    color: "purple" as const,
    image: "/dummybaner/dummy_bane_4.webp",
    stars: 5,
  },
  {
    id: 5,
    name: "Dummy Bane 5 - Kristiansand",
    coords: [58.1467, 7.9956],
    color: "orange" as const,
    image: "/dummybaner/dummy_bane_5.webp",
    stars: 4,
  },
  {
    id: 6,
    name: "Dummy Bane 6 - Ålesund",
    coords: [62.4722, 6.1549],
    color: "cadetblue" as const,
    image: "/dummybaner/dummy_bane_6.webp",
    stars: 3,
  },
  {
    id: 7,
    name: "Dummy Bane 7 - Tromsø",
    coords: [69.6496, 18.956],
    color: "darkpurple" as const,
    image: "/dummybaner/dummy_bane_7.webp",
    stars: 5,
  },
  {
    id: 8,
    name: "Dummy Bane 8 - Bodø",
    coords: [67.2804, 14.4049],
    color: "darkgreen" as const,
    image: "/dummybaner/dummy_bane_8.webp",
    stars: 4,
  },
];

const MapComponent = () => (
  <MapContainer
    center={usnCenter}
    zoom={5}
    scrollWheelZoom
    style={{ height: "100%", width: "100%", borderRadius: "12px" }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />

    {/* Markør for hovedposisjon */}
    <Marker
      position={usnCenter}
      icon={createIcon("university", "orange")}
    >
      <Popup>
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            USN Sør-Øst Norge
          </h2>
          <img
            src={usnImage}
            alt="USN Bø"
            style={{
              width: "100%",
              height: "120px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                fill="#FFD700"
                viewBox="0 0 24 24"
                className="h-5 w-5"
              >
                <path d="M12 .587l3.668 7.431 8.215 1.192-5.938 5.778 1.404 8.182L12 18.896l-7.349 3.864 1.404-8.182L.117 9.21l8.215-1.192z" />
              </svg>
            ))}
          </div>
          <p style={{ fontSize: "14px", color: "#555" }}>
            Koordinater: {usnCenter.join(", ")}
          </p>
        </div>
      </Popup>
    </Marker>

    {/* Dynamisk genererte markører for baner */}
    {courses.map((course) => (
      <Marker
        key={course.id}
        position={course.coords as L.LatLngExpression}
        icon={createIcon("golf-ball", course.color)}
      >
        <Popup>
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              {course.name}
            </h2>
            <img
              src={course.image}
              alt={course.name}
              style={{
                width: "100%",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              {Array.from({ length: course.stars }, (_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#FFD700"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  <path d="M12 .587l3.668 7.431 8.215 1.192-5.938 5.778 1.404 8.182L12 18.896l-7.349 3.864 1.404-8.182L.117 9.21l8.215-1.192z" />
                </svg>
              ))}
            </div>
            <p style={{ fontSize: "14px", color: "#555" }}>
              Koordinater: {course.coords.join(", ")}
            </p>
          </div>
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);

export default MapComponent;
