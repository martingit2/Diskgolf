/**
 * Egendefinert hook for å håndtere visningstilstanden til innloggingsmodalen.
 * - Bruker Zustand for å administrere global tilstand.
 * - Tilstand `isOpen` kontrollerer om modalen er åpen eller lukket.
 * - Metodene `onOpen` og `onClose` brukes for å oppdatere tilstanden.
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
