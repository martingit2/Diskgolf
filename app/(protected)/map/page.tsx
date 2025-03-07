"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast, Toaster } from "react-hot-toast";

// Dynamisk import for kart (unngår SSR-feil)
const MapAdminComponent = dynamic(() => import("@/components/MapAdminComponentNoSSR"), { ssr: false });

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const [selectedType, setSelectedType] = useState<"bane" | "start" | "kurv" | "mål" | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [courses, setCourses] = useState<{ id: string; name: string; location: string; image: string }[]>([]);

  // ✅ State for start, slutt og kurver
  const [startLatitude, setStartLatitude] = useState<number | null>(null);
  const [startLongitude, setStartLongitude] = useState<number | null>(null);
  const [goalLatitude, setGoalLatitude] = useState<number | null>(null);
  const [goalLongitude, setGoalLongitude] = useState<number | null>(null);
  const [holes, setHoles] = useState<{ latitude: number; longitude: number; number: number; par: number }[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  if (status === "loading") {
    return <p>Laster inn...</p>;
  }

  if (!session || session.user.role !== "ADMIN") {
    return <p>Du har ikke tilgang til denne siden.</p>;
  }

  // 📥 Hent alle baner fra API
  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        toast.error("Kunne ikke hente baner.");
      }
    } catch (error) {
      console.error("Feil ved henting av baner:", error);
      toast.error("Feil ved henting av baner.");
    }
  };

  // 📤 Lagre bane
  const handleSaveCourse = async () => {
    const nameField = document.getElementById("courseName") as HTMLInputElement;
    const locationField = document.getElementById("courseLocation") as HTMLInputElement;
    const latField = document.getElementById("courseLat") as HTMLInputElement;
    const lngField = document.getElementById("courseLng") as HTMLInputElement;
    const parField = document.getElementById("coursePar") as HTMLInputElement;
    const descriptionField = document.getElementById("courseDescription") as HTMLInputElement;

    if (!nameField.value || !locationField.value || !latField.value || !lngField.value) {
      toast.error("⚠️ Fyll ut alle feltene før du lagrer.");
      return;
    }

    const newCourse = {
      name: nameField.value,
      location: locationField.value,
      latitude: parseFloat(latField.value),
      longitude: parseFloat(lngField.value),
      par: parField.value ? parseInt(parField.value) : 3, // ✅ Standardverdi 3 hvis tomt
      description: descriptionField.value || null,
      image: image ? URL.createObjectURL(image) : imageUrl,
      startLatitude,
      startLongitude,
      goalLatitude,
      goalLongitude,
      holes,
    };

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      if (response.ok) {
        toast.success("✅ Banen ble lagret!");
        fetchCourses();
        nameField.value = "";
        locationField.value = "";
        latField.value = "";
        lngField.value = "";
        parField.value = "";
        descriptionField.value = "";
        setImage(null);
        setImageUrl("");
        setStartLatitude(null);
        setStartLongitude(null);
        setGoalLatitude(null);
        setGoalLongitude(null);
        setHoles([]);
      } else {
        toast.error("❌ Feil ved lagring av bane.");
      }
    } catch (error) {
      console.error("❌ Noe gikk galt. Prøv igjen.", error);
      toast.error("❌ Noe gikk galt. Prøv igjen.");
    }
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>Admin Dashboard</h1>
      <p>Klikk på kartet for å legge til en ny bane.</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* 📌 Velg markør */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4>Velg markørtype:</h4>
          {["bane", "start", "kurv", "mål"].map((type) => (
            <button
              key={type}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                backgroundColor: selectedType === type ? "#4CAF50" : "#ddd",
                color: "black",
              }}
              onClick={() => setSelectedType(type as "bane" | "start" | "kurv" | "mål")}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* 🗺️ Kart */}
        <div style={{ flex: "1", minWidth: "600px", height: "600px" }}>
          <MapAdminComponent selectedType={selectedType} />
        </div>

        {/* 📋 Skjema */}
        <div style={{
          width: "350px",
          padding: "20px",
          background: "#f9f9f9",
          borderRadius: "10px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          <h3>Legg til en ny bane</h3>
          <input type="text" placeholder="Navn på bane" id="courseName" style={inputStyle} />
          <input type="text" placeholder="Sted" id="courseLocation" style={inputStyle} />
          <input type="number" placeholder="Latitude" id="courseLat" style={inputStyle} />
          <input type="number" placeholder="Longitude" id="courseLng" style={inputStyle} />
          <input type="number" placeholder="Par (standard 3)" id="coursePar" style={inputStyle} defaultValue={3} />

          <textarea placeholder="Beskrivelse" id="courseDescription" style={inputStyle} />

          {/* 📷 Bildevalg */}
          <select onChange={(e) => setImageUrl(e.target.value)} style={inputStyle}>
            <option value="">Velg et bilde...</option>
            <option value="/images/bane1.jpg">Bane 1</option>
          </select>

          <button onClick={handleSaveCourse} style={buttonStyle}>Legg til bane</button>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

const inputStyle = { width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px" };
const buttonStyle = { width: "100%", background: "#4CAF50", color: "white", padding: "12px", borderRadius: "5px", cursor: "pointer", fontSize: "16px" };

export default AdminDashboard;
