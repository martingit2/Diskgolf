/**
 * Filnavn: page.tsx (/app/auth/reset/page.tsx)
 * Beskrivelse: Sidekomponent for passordtilbakestilling (IKKE I BRUK - MODAL BRUKES).
 * Viser et skjema for å tilbakestille passordet
 * og gir brukeren mulighet til å navigere tilbake til innloggingssiden.
 * Utvikler: Martin Pettersen
 */

"use client";

// Importerer komponenter som ikke finnes eller ikke brukes i denne flyten lenger
// import { ResetForm } from "@/components/auth/reset-form";
// import { useRouter } from "next/navigation";

const ResetPage = () => {
  // const router = useRouter(); // Ikke nødvendig når innholdet er kommentert ut

  // --- Hele innholdet kommentert ut siden ResetPasswordModal brukes ---
  /*
  return (
    <ResetForm
      onBackToLogin={() => {
        router.push("/auth/login");
      }}
    />
  );
  */

  // Returnerer null eller en enkel melding for å unngå feil hvis siden likevel lastes
  return (
     <div className="flex h-screen items-center justify-center">
        <p>Denne siden er ikke lenger i bruk. Bruk modalen for å tilbakestille passord.</p>
     </div>
  );

};

export default ResetPage;