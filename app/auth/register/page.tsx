/**
 * Filnavn: page.tsx (/app/auth/register/page.tsx)
 * Beskrivelse: Sidekomponent for brukerregistrering (IKKE I BRUK - MODAL BRUKES).
 * Viser en placeholder for registreringsskjema
 * og en knapp for å navigere til innloggingssiden.
 * Utvikler: Martin Pettersen
 */

"use client";

// Importerer ikke useRouter når innholdet er kommentert ut
// import { useRouter } from "next/navigation";

const RegisterPage = () => {
  // const router = useRouter(); // Kommentert ut

  // Kommenterer ut placeholder-innholdet
  /*
  return (
    <div className="mt-8">
      <div>
        Placeholder for RegisterForm
        <button onClick={() => router.push("/auth/login")}>Login</button>
      </div>
    </div>
  );
  */

  // Returnerer en enkel melding
  return (
    <div className="flex h-screen items-center justify-center">
       <p>Denne siden er ikke lenger i bruk. Bruk modalen for å registrere bruker.</p>
    </div>
 );
};

export default RegisterPage;