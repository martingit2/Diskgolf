// Fil: hooks/use-reset-password-modal.ts (eller tilsvarende i store/)
// Formål: Zustand store for å håndtere tilstanden (åpen/lukket) til en modal for tilbakestilling av passord.
//         Gir metoder for å åpne (onOpen) og lukke (onClose) modalen globalt i applikasjonen.
// Utvikler: Martin Pettersen


import { create } from 'zustand';

interface ResetPasswordModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useResetPasswordModal = create<ResetPasswordModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useResetPasswordModal;