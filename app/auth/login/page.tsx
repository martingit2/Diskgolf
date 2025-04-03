/**
 * Filnavn: page.tsx (/app/auth/login/page.tsx)
 * Beskrivelse: Sidekomponent for brukerinnlogging (IKKE I BRUK - MODAL BRUKES).
 * Renderer innloggingsskjema og håndterer hendelser for registrering, glemt passord og vellykket innlogging.
 * Utvikler: Martin Pettersen
 */

"use client";

// Kommenterer ut import av LoginForm siden siden ikke er i bruk
// import LoginForm from "@/components/auth/login-form";

// export const dynamic = "force-dynamic"; // Kan kommenteres ut hvis siden ikke brukes

const LoginPage = () => {
  // Kommenterer ut ubrukte handlere
  /*
  const handleForgotPassword = () => {
    console.log("Naviger til glemt passord");
  };

  const handleRegister = () => {
    console.log("Naviger til registrering");
  };

  const handleLoginSuccess = () => {
    console.log("Innlogging vellykket");
  };
  */

  // Kommenterer ut rendering av LoginForm
  /*
  return (
    <div className="mt-8">
      <LoginForm
        onForgotPassword={handleForgotPassword}
        onRegister={handleRegister}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
  */

  // Returnerer en enkel melding eller null for å unngå feil
  return (
    <div className="flex h-screen items-center justify-center">
       <p>Denne siden er ikke lenger i bruk. Bruk modalen for å logge inn.</p>
    </div>
 );
};

export default LoginPage;