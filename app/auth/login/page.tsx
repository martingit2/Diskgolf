"use client";

import LoginForm from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

const LoginPage = () => {
  const handleForgotPassword = () => {
    console.log("Naviger til glemt passord");
  };

  const handleRegister = () => {
    console.log("Naviger til registrering");
  };

  const handleLoginSuccess = () => {
    console.log("Innlogging vellykket");
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
