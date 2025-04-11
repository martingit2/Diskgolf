/**
 * Filnavn: ToasterProvider.tsx
 * Beskrivelse: Provider-komponent for å rendre Toaster-komponenten som viser varslinger.
 * Sikrer at Toaster kun rendres på klienten for å unngå hydreringsfeil.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */

"use client"; // Nødvendig for useState og useEffect

import { useEffect, useState } from "react"; // Importer hooks
import { Toaster } from "react-hot-toast"; // Importer Toaster

const ToasterProvider = () => {
  // State for å sjekke om komponenten er mounted på klienten
  const [isMounted, setIsMounted] = useState(false);

  // Effekt som kjører kun én gang etter første render på klienten
  useEffect(() => {
    setIsMounted(true); // Sett isMounted til true etter at komponenten har mountet
  }, []); // Tom dependency array sikrer at den kjører kun én gang

  // Hvis komponenten ikke er mounted ennå (f.eks. under server render), returner null
  if (!isMounted) {
    return null;
  }

  // Når komponenten er mounted på klienten, render Toaster-komponenten
  return <Toaster />;
};

export default ToasterProvider;