/**
 * Filnavn: page.tsx (/app/auth/error/page.tsx)
 * Beskrivelse: Sidekomponent for visning av autentiseringsfeil (IKKE AKTIVT BRUKT - feil håndteres i modal/komponent).
 * Denne siden renderer en feilkomponent som informerer brukeren om autentiseringsproblemer.
 * Utvikler: Martin Pettersen
 */

// Importerer ErrorCard, men selve renderingen kommenteres ut
// import { ErrorCard } from "@/components/auth/error-card"; // Juster stien om nødvendig

const AuthErrorPage = () => {
  // Kommenterer ut rendering av ErrorCard
  /*
  return <ErrorCard />;
  */

  // Returnerer en enkel melding
  return (
    <div className="flex h-screen items-center justify-center">
       <p>En autentiseringsfeil oppstod.</p> {/* Eller en mer generell feilmelding */}
    </div>
 );
};

export default AuthErrorPage;