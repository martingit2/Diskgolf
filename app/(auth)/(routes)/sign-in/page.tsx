/**
 * Filnavn: SignInPage.tsx
 * Beskrivelse: Sidekomponent for innlogging med en fallback for lasting.
 * Utvikler: Martin Pettersen
 */

"use client";

import SignInForm from "@/components/testSignInForm";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

/**
 * SignInPage-komponenten renderer en innloggingsside med Suspense for lazy loading.
 * @component
 * @author Martin Pettersen
 */
function SignInPage() {
  return (
    <Suspense fallback={<div>Laster inn...</div>}>
      <SignInForm />
    </Suspense>
  );
}

export default SignInPage;
