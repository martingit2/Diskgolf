/** 
 * Filnavn: ToasterProvider.tsx
 * Beskrivelse: Provider-komponent for å håndtere visning av toast-notifikasjoner i applikasjonen.
 * Bruker `react-hot-toast` for å vise brukerfeedback i form av visuelle varsler.
 * Utvikler: Martin Pettersen
 */


"use client";
import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
   return <Toaster />;
};
export default ToasterProvider;