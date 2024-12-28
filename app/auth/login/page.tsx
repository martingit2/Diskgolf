"use client";

import LoginForm from "@/components/auth/login-form";

const LoginPage = () => {
  const handleForgotPassword = () => {
    console.log("Naviger til glemt passord");
    // Legg til logikk for navigasjon til glemt passord-side
  };

  const handleRegister = () => {
    console.log("Naviger til registrering");
    // Legg til logikk for navigasjon til registreringsside
  };

  const handleLoginSuccess = () => {
    console.log("Innlogging vellykket");
    // Legg til logikk for navigasjon til dashboard eller annen side
  };

  return (
    <div className="mt-8">
      <LoginForm
        onForgotPassword={handleForgotPassword}
        onRegister={handleRegister}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default LoginPage;
