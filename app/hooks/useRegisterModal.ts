/**
 * useRegisterModal.ts
 * --------------------
 * Dette er en Zustand-basert butikk som håndterer visningen av registreringsmodalen.
 * 
 * Hva gjør denne filen?
 * - Denne butikken holder styr på om registreringsmodalen er åpen eller lukket.
 * - Gir funksjoner (`onOpen` og `onClose`) for å kontrollere visningen av modal.
 * 
 * Hvorfor bruker vi Zustand?
 * - Zustand gjør det enkelt å dele tilstand (data) mellom ulike deler av applikasjonen.
 * - I stedet for å sende data og funksjoner gjennom props (kalt "prop-drilling"), kan vi 
 *   lagre tilstanden på ett sted og bruke den hvor som helst.
 * 
 * Hvordan fungerer det?
 * - `isOpen`: En boolean som sier om modal er åpen (`true`) eller lukket (`false`).
 * - `onOpen`: En funksjon som åpner modal ved å sette `isOpen` til `true`.
 * - `onClose`: En funksjon som lukker modal ved å sette `isOpen` til `false`.
 */

import { create } from "zustand"; // Zustand brukes for å lage en lett tilstandsbutikk.

interface RegisterModalStore {
  isOpen: boolean; // Tilstand for om modal er åpen eller lukket.
  onOpen: () => void; // Funksjon for å åpne modal.
  onClose: () => void; // Funksjon for å lukke modal.
}

// Oppretter en Zustand-butikk for registreringsmodalen
const useRegisterModal = create<RegisterModalStore>((set) => ({
  isOpen: false, // Standard: Modal er lukket.

  /**
   * Funksjon for å åpne modalen.
   * - Setter `isOpen` til `true`.
   */
  onOpen: () => set({ isOpen: true }),

  /**
   * Funksjon for å lukke modalen.
   * - Setter `isOpen` til `false`.
   */
  onClose: () => set({ isOpen: false }),
}));

export default useRegisterModal;
