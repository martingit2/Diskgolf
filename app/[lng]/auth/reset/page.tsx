/** 
 * Filnavn page.tsx
 * Beskrivelse: Sidekomponent for passordtilbakestilling. Viser et skjema for å tilbakestille passordet 
 * og gir brukeren mulighet til å navigere tilbake til innloggingssiden.
 * Utvikler: Martin Pettersen
 */



"use client";

import { ResetForm } from "@/components/auth/reset-form";
import { useRouter } from "next/navigation";

const ResetPage = () => {
  const router = useRouter();

  return (
    <ResetForm
      onBackToLogin={() => {
        router.push("/auth/login");
      }}
    />
  );
};

export default ResetPage;