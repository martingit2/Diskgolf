// Fil: components/AutoResizeMapMobile.tsx 
// Formål: En React Leaflet-komponent som automatisk kaller `map.invalidateSize()` etter en kort forsinkelse.
//         Dette er nyttig for å sikre at kartet rendres korrekt etter at størrelsen på containeren har endret seg,
//         spesielt i scenarioer som modaler, faner eller på mobile enheter der layout kan endres etter initial lasting.
// Utvikler: Martin Pettersen



"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function AutoResizeMapMobile() {
  const map = useMap();

  useEffect(() => {
    // Liten forsinkelse for å sikre at modalen er ferdig animert/åpnet
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
}
