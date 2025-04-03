/**
 * Filnavn: page.tsx (/app/auth/new-password/page.tsx)
 * Beskrivelse: Sidekomponent for å sette nytt passord (MULIGENS NØDVENDIG FOR RESET-FLYT).
 * Inkluderer et skjema for å angi et nytt passord, med fallback-lasting via Suspense.
 * Utvikler: Martin Pettersen
 */

"use client";

// Importerer komponenten, men renderingen kommenteres ut
// import WrappedNewPasswordForm from "@/components/auth/new-password-form"; // Juster stien
// import { Suspense } from "react";

// export const dynamic = "force-dynamic"; // Kan kommenteres ut

const NewPasswordPage = () => {
  // Kommenterer ut renderingen
  /*
  return (
    <Suspense fallback={<div>Laster inn...</div>}>
      <WrappedNewPasswordForm />
    </Suspense>
  );
  */

  // Returnerer en melding - VURDER OM DENNE SIDEN SKAL VÆRE AKTIV!
  return (
    <div className="flex h-screen items-center justify-center">
       <p>Side for å sette nytt passord.</p> {/* Bør vise skjemaet hvis den er aktiv */}
    </div>
 );
};

export default NewPasswordPage;