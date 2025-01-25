/** 
 * Filnavn: useLoginModal.ts
 * -------------------------
 * Dette er en Zustand-basert butikk som håndterer visningen av innloggingsmodalen.
 * 
 * Hva er Zustand?
 * Zustand er et verktøy for tilstandshåndtering i React som gjør det mulig å dele 
 * tilstand (data) mellom flere komponenter uten å bruke props-drilling (å sende 
 * data gjennom mange komponenter).
 * 
 * Hvorfor bruker vi Zustand her?
 * Tilstanden for innloggingsmodalen (`isOpen`) må kunne brukes av ulike deler av applikasjonen, 
 * som for eksempel en knapp for å åpne modal og selve modalen. Ved å bruke Zustand kan vi
 * holde denne tilstanden på ett sted og enkelt oppdatere den fra hvor som helst i koden.
 * 
 * Hvordan fungerer det?
 * 1. `isOpen`: Et flagg (true/false) som sier om modal er åpen.
 * 2. `onOpen`: En funksjon som åpner modal ved å sette `isOpen` til `true`.
 * 3. `onClose`: En funksjon som lukker modal ved å sette `isOpen` til `false`.
 * 
 * Utvikler: Martin Pettersen
 */

import { create } from "zustand"; // Zustand er et lettvektstilstandsverktøy.

interface LoginModalStore {
  isOpen: boolean; // Angir om innloggingsmodalen er åpen eller lukket.
  onOpen: () => void; // Funksjon for å åpne modal.
  onClose: () => void; // Funksjon for å lukke modal.
}

// Oppretter Zustand-butikken for innloggingsmodalen.
const useLoginModal = create<LoginModalStore>((set) => ({
  // Initial tilstand: Modal er lukket.
  isOpen: false,

  /**
   * Åpner modalen.
   * - Oppdaterer tilstanden `isOpen` til `true`.
   */
  onOpen: () => set({ isOpen: true }),

  /**
   * Lukker modalen.
   * - Oppdaterer tilstanden `isOpen` til `false`.
   */
  onClose: () => set({ isOpen: false }),
}));

export default useLoginModal;
