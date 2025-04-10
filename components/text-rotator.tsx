// Fil: components/RotatingText.tsx (eller tilsvarende sti)
// Formål: Komponent som viser roterende tekster med jevne mellomrom, hentet fra i18n.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet og feilsøking.

"use client"; // Kreves for hooks (useState, useEffect).

import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next'; // Importer i18n hook.

/**
 * Viser en serie tekster som bytter med et fast intervall.
 * Tekstene hentes fra i18n JSON basert på gjeldende språk.
 */
const RotatingText = () => {
  // Henter oversettelsesfunksjon.
  const { t } = useTranslation('translation');

  // Henter arrayet med tekster fra JSON. `returnObjects: true` er essensielt.
  const messages = t('home.rotating_texts', { returnObjects: true, defaultValue: [] }) as string[];

  // State for å holde styr på hvilken tekst som vises.
  const [currentIndex, setCurrentIndex] = useState(0);

  // Effekt for å bytte tekst med et fast intervall.
  useEffect(() => {
    // Sikrer at vi har tekster før intervallet startes.
    if (!messages || messages.length === 0) return;

    const interval = setInterval(() => {
      // Går til neste indeks, eller tilbake til 0 ved slutten av arrayet.
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Bytter tekst hvert 3. sekund.

    // Rengjør intervallet når komponenten fjernes eller tekstene endres (språkbytte).
    return () => clearInterval(interval);
  }, [messages]); // Avhengig av messages-arrayet for å reagere på språkbytte.

  // Returnerer ingenting hvis tekstene ikke er lastet eller arrayet er tomt.
  if (!messages || messages.length === 0) {
    return null;
  }

  // Renderer den gjeldende teksten inne i en enkel span, lik original koden.
  return <span>{messages[currentIndex]}</span>;
};

export default RotatingText;