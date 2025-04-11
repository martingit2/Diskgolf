
// Formål: Håndterer automatisk pålogging via NextAuth ved å lese callbackUrl fra URL-parametere.
//         Bruker useEffect til å kalle signIn-funksjonen fra next-auth/react ved lasting,
//         og redirigerer brukeren til autentiseringsleverandøren og deretter tilbake til den spesifiserte callbackUrl.
//         Komponenten rendrer ingen UI selv og er pakket inn i Suspense for å håndtere asynkron lasting av searchParams.
// Utvikler: Martin Pettersen



"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  useEffect(() => {
    if (callbackUrl) {
      signIn(undefined, { callbackUrl });
    }
  }, [callbackUrl]);

  return null;
}

export default function WrappedSignInForm() {
  return (
    <Suspense fallback={<div>Laster inn...</div>}>
      <SignInForm />
    </Suspense>
  );
}
