// Fil: types/obZone.ts
// Formål: Definerer en TypeScript-type 'ObZone' for å representere Out-of-Bounds (OB) soner på en diskgolfbane.
//         Støtter både sirkulære soner (definert ved sentrum) og polygon-soner (definert ved en liste av punkter).
// Utvikler: Martin Pettersen



export type ObZone =
  | { type: "circle"; lat: number; lng: number }
  | { type: "polygon"; points: [number, number][] };