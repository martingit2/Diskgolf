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
