
/* Må fikses er bare copy/pasta ab-clone  */


import { create } from "zustand";

interface RegisterModalStore {
   isOpen?: boolean;
   onOpen: () => void;
   onClose: () => void;
}

const useRegisterModal = create<RegisterModalStore>((set) => ({
   isOpen: false,
   onOpen: () => set({ isOpen: true }),
   onClose: () => set({ isOpen: false }),
}));

export default useRegisterModal;