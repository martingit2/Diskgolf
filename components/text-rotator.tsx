/** 
 * Filnavn: RotatingText.tsx
 * Beskrivelse: Komponent som viser roterende tekster med jevne mellomrom. 
 * Brukes for å fremheve ulike funksjoner i DiskGolf-applikasjonen.
 * Utvikler: Martin Pettersen
 */




"use client";

import React, { useState, useEffect } from "react";

const RotatingText = () => {
  const messages = [
    "Oppdag de beste banene",
    "Forbedre teknikken din",
    "Hold styr på poengene dine",
    "Bli en del av fellesskapet",
    "Arranger dine egne turneringer",
    "Få kontroll over statistikken din",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Bytt tekst hver 3. sekund
    return () => clearInterval(interval);
  }, [messages.length]);

  return <span>{messages[currentIndex]}</span>;
};

export default RotatingText;
