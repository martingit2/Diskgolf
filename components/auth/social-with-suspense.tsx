/** 
 * Filnavn: social-with-suspense.tsx
 * Beskrivelse: Wrapper-komponent for å vise sosiale innloggingsknapper med en fallback-løsning ved innlasting.
 * Bruker React's Suspense for å forbedre brukeropplevelsen ved å vise en lastemelding mens innholdet lastes inn.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */



"use client";

import { Suspense } from "react";
import { Social } from "./social";

const SocialWithSuspense = () => {
  return (
    <Suspense fallback={<div>Laster inn sosiale knapper...</div>}>
      <Social />
    </Suspense>
  );
};

export default SocialWithSuspense;
