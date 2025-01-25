/** 
 * Filnavn: utils.ts
 * Beskrivelse: Hjelpefunksjon for å kombinere og optimalisere CSS-klasser ved hjelp av `clsx` og `tailwind-merge`.
 * Brukes for å håndtere betingede og dynamiske Tailwind CSS-klasser på en effektiv måte.
 * Utvikler: Martin Pettersen
 */


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
