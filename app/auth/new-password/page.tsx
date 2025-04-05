/** 
 * Filnavn: page.tsx
 * Beskrivelse: Sidekomponent for å håndtere tilbakestilling av passord. 
 * Inkluderer et skjema for å angi et nytt passord, med fallback-lasting via Suspense.
 * Utvikler: Martin Pettersen
 */



"use client";

import WrappedNewPasswordForm from "@/components/auth/new-password-form";
import { Suspense } from "react";


export const dynamic = "force-dynamic";

const NewPasswordPage = () => {
  return (
    <Suspense fallback={<div>Laster inn...</div>}>
      <WrappedNewPasswordForm />
    </Suspense>
  );
};

export default NewPasswordPage;