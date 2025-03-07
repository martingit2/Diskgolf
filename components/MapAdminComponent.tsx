"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, CSSProperties } from "react";

// Dynamisk import av kart for å unngå SSR-problemer
const DynamicMap = dynamic(() => import("./MapAdminComponentNoSSR"), { ssr: false });

const MapAdminWrapper = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <p style={{ textAlign: "center" }}>Laster inn...</p>;
  }

  return (
    <div style={pageContainer}>
      {/* 📌 Midtstilt tittel */}
      <div style={headerStyle}>
        <h1>Admin Dashboard</h1>
        <p>Klikk på kartet for å legge til en ny bane.</p>
      </div>

      {/* 📌 Kart og Skjema side om side */}
      <div style={contentContainer}>
        {/* 🗺️ Kart til venstre */}
        <div style={mapContainerStyle}>
          <DynamicMap />
        </div>

        {/* 📋 Skjema til høyre */}
        <div style={formContainerStyle}>
          <h3>Legg til en ny bane</h3>
          <input type="text" placeholder="Navn på bane" id="courseName" style={inputStyle} />
          <input type="text" placeholder="Sted" id="courseLocation" style={inputStyle} />
          <textarea placeholder="Beskrivelse" id="courseDescription" style={{ ...inputStyle, height: "80px" }} />
          <input type="number" placeholder="Latitude" id="courseLat" style={inputStyle} />
          <input type="number" placeholder="Longitude" id="courseLng" style={inputStyle} />
          <input type="text" placeholder="Bilde URL (valgfritt)" id="courseImage" style={inputStyle} />
          <button id="addCourseBtn" style={buttonStyle}>Legg til bane</button>
        </div>
      </div>
    </div>
  );
};

/* ✅ Bruk `CSSProperties` for å fjerne TypeScript-feil */
const pageContainer: CSSProperties = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
};

const headerStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: "20px",
};

const contentContainer: CSSProperties = {
  display: "flex",
  flexWrap: "wrap", // ✅ Gjør layout responsiv
  gap: "20px",
  justifyContent: "center",
  alignItems: "flex-start",
  width: "100%",
};

const formContainerStyle: CSSProperties = {
  width: "350px",
  padding: "20px",
  background: "#f9f9f9",
  borderRadius: "10px",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
};

const mapContainerStyle: CSSProperties = {
  flex: "1",
  minWidth: "600px",
  height: "600px",
  border: "1px solid #ddd",
  borderRadius: "10px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  background: "#4CAF50",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
};

export default MapAdminWrapper;
