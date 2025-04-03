/**
 * Filnavn: page.tsx (/app/auth/new-verification/page.tsx)
 * Beskrivelse: Sidekomponent for e-postverifisering (MULIGENS NØDVENDIG ETTER REGISTRERING).
 * Viser et skjema der brukeren kan bekrefte sin e-postadresse via en verifikasjonslenke.
 * Utvikler: Martin Pettersen
 */

"use client";

// Importerer komponent/Suspense, men rendering kommenteres ut
// import { Suspense } from "react";
// import { NewVerificationForm } from "@/components/auth/new-verification-form"; // Juster stien

// export const dynamic = "force-dynamic"; // Kan kommenteres ut

const NewVerificationPage = () => {
  // Kommenterer ut rendering
  /*
  return (
    <Suspense fallback={<div>Laster inn...</div>}>
      <NewVerificationForm />
    </Suspense>
  );
  */

   // Returnerer en melding - VURDER OM DENNE SIDEN SKAL VÆRE AKTIV!
   return (
    <div className="flex h-screen items-center justify-center">
       <p>Side for å verifisere e-post.</p> {/* Bør vise bekreftelsesskjema hvis aktiv */}
    </div>
 );
};

export default NewVerificationPage;