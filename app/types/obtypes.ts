export type ObZone =
  | { type: "circle"; lat: number; lng: number }
  | { type: "polygon"; points: [number, number][] };