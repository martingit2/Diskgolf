// src/app/(protected)/_components/CreateClubNewsForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Antatt shadcn button
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Type for klubbdata som trengs for dropdown
interface ClubOption {
    id: string;
    name: string;
}

// Definer props komponenten mottar
interface CreateClubNewsFormProps {
  managedClubs: ClubOption[];       // Liste over klubber brukeren kan velge mellom
  initialClubId?: string | null; // ID til klubben som skal være forhåndsvalgt (f.eks. den sist valgte)
}

// Komponenten for å opprette klubbnyheter
const CreateClubNewsForm: React.FC<CreateClubNewsFormProps> = ({ managedClubs = [], initialClubId }) => {
    // State for skjema felter
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null); // State for valgt bildefil
    // State for hvilken klubb som er valgt i dropdown
    const [selectedClubId, setSelectedClubId] = useState<string>(() => {
        // Sett startverdi: initialClubId hvis den finnes, ellers første klubb, ellers tom streng
        return initialClubId || managedClubs[0]?.id || "";
    });
    // State for å vise lasteindikator
    const [loading, setLoading] = useState(false);

   // Effekt for å oppdatere valgt klubb hvis initialClubId (prop) endres utenfra
   useEffect(() => {
       if (initialClubId && initialClubId !== selectedClubId) {
           setSelectedClubId(initialClubId);
       }
       // Sørg for at en gyldig klubb er valgt hvis listen finnes og ingen initial er satt
       else if (!initialClubId && managedClubs.length > 0 && !managedClubs.some(c => c.id === selectedClubId)) {
            setSelectedClubId(managedClubs[0].id); // Velg den første som default
       }
        // Hvis listen blir tom, nullstill valget
        else if (managedClubs.length === 0) {
            setSelectedClubId("");
        }
   }, [initialClubId, managedClubs, selectedClubId]); // Kjør når disse verdiene endres

  // Håndter innsending av skjemaet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Hindre standard skjema-innsending

    // Validering av input
    if (!title.trim() || !content.trim() || !selectedClubId) {
      toast.error("Vennligst fyll ut tittel, innhold og velg en klubb.");
      return;
    }

    setLoading(true); // Start lasteindikator
    try {
      // Opprett FormData for å sende data (inkludert fil)
      const formData = new FormData();
      formData.append("clubId", selectedClubId);
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (image) {
        formData.append("image", image); // Legg til filen hvis den er valgt
      }

      // Kall riktig API-endepunkt
      const response = await fetch("/api/create-club-news", { // Korrekt sti
        method: "POST",
        body: formData,
      });

      // --- Robust respons-håndtering ---
      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
          // Hvis serveren svarte med JSON
          responseData = await response.json();
          if (!response.ok) {
               // Bruk feilmelding fra JSON hvis den finnes
              throw new Error(responseData.error || `Server svarte med status ${response.status}`);
          }
      } else {
          // Hvis serveren IKKE svarte med JSON (f.eks. HTML feilside)
          const textResponse = await response.text(); // Les responsen som tekst
          console.error("Ugyldig JSON respons mottatt:", response.status, textResponse);
          throw new Error(`Uventet svar fra server (Status: ${response.status}). Sjekk serverloggen.`);
      }
      // -----------------------------------

      // Håndter suksess
      toast.success("Nyhet opprettet!");
      // Nullstill skjemaet
      setTitle("");
      setContent("");
      setImage(null);
      // Nullstill filinput-feltet
       const fileInput = document.getElementById('news-image-input') as HTMLInputElement | null; // Bruk unik ID
       if (fileInput) {
           fileInput.value = '';
       }
      // Behold valgt klubb, slik at brukeren enkelt kan legge til flere nyheter for samme klubb

    } catch (error: any) {
      // Håndter feil
      console.error("Feil ved oppretting av nyhet:", error);
      toast.error(`Kunne ikke opprette nyheten: ${error.message}`);
    } finally {
      // Stopp lasteindikator uansett resultat
      setLoading(false);
    }
  };

  // Render komponenten
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Skriv Nyhet</h2>
      {/* Skjema for nyhet */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Klubbvalg (Dropdown) */}
        <div>
          <label htmlFor="club-select" className="block text-sm font-medium text-gray-700 mb-1">
            Velg Klubb *
          </label>
          {/* Vis dropdown kun hvis det finnes klubber å velge mellom */}
          {managedClubs.length > 0 ? (
              <select
                id="club-select" // Endret ID for å unngå konflikt
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="mt-1 p-3 block w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 shadow-sm bg-white"
                required // Sørger for at et valg må gjøres
                disabled={loading} // Deaktiver under lasting
              >
                {/* Legg til et standard "Velg..." alternativ hvis ingen er forhåndsvalgt */}
                {!selectedClubId && <option value="" disabled>-- Velg en klubb --</option>}
                {/* Map gjennom tilgjengelige klubber */}
                {managedClubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
          ) : (
              // Vis melding hvis brukeren ikke administrerer noen klubber
              <p className="text-sm text-gray-500 mt-1 italic">Du administrerer ingen klubber.</p>
          )}
        </div>

        {/* Tittelfelt */}
        <div>
          <label htmlFor="news-title" className="block text-sm font-medium text-gray-700 mb-1">
            Tittel *
          </label>
          <Input
            id="news-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tittel på nyheten"
            required
            disabled={loading}
            className="mt-1" // Klasse for Input fra shadcn/ui
          />
        </div>

        {/* Innholdsfelt */}
        <div>
          <label htmlFor="news-content" className="block text-sm font-medium text-gray-700 mb-1">
            Innhold *
          </label>
          <Textarea // Bruker Textarea fra shadcn/ui
            id="news-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Skriv innholdet til nyheten her..."
            rows={6}
            required
            disabled={loading}
            className="mt-1" // Klasse for Textarea
          />
        </div>

        {/* Bildefelt */}
        <div>
          <label htmlFor="news-image-input" className="block text-sm font-medium text-gray-700 mb-1">
            Bilde (valgfritt)
          </label>
          <Input // Bruker Input fra shadcn/ui for fil
            id="news-image-input" // Unik ID
            type="file"
            accept="image/png, image/jpeg, image/webp" // Spesifiser aksepterte filtyper
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            disabled={loading}
            className="mt-1 file:text-green-700 file:bg-green-50 hover:file:bg-green-100 file:rounded-md file:border-0 file:font-semibold"
          />
          {/* Vis navnet på valgt fil */}
          {image && <p className="text-xs text-muted-foreground mt-1">Valgt: {image.name}</p>}
        </div>

        {/* Submit-knapp */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
            // Deaktiver hvis lasting pågår eller ingen klubb er valgt/tilgjengelig
            disabled={loading || managedClubs.length === 0 || !selectedClubId}
          >
            {loading ? "Publiserer..." : "Publiser Nyhet"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateClubNewsForm;