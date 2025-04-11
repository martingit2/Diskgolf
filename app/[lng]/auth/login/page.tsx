// Fil: app/auth/login/page.tsx
// Formål: Definerer innloggingssiden for applikasjonen. Bruker LoginForm-komponenten for selve skjemaet
//         og inkluderer Suspense for å håndtere asynkron lasting eller bruk av searchParams i underliggende komponenter.
// Utvikler: Martin Pettersen



"use client";

import React, { Suspense } from 'react'; // Importer Suspense
import LoginForm from "@/components/auth/login-form";
import LoadingSpinner from '@/components/ui/loading-spinner';


const LoginPage = () => {
  const handleForgotPassword = () => { /* ... */ };
  const handleRegister = () => { /* ... */ };
  const handleLoginSuccess = () => { /* ... */ };

  return (
    <div className="mt-8">
      {/* Wrap LoginForm (eller komponenten inni som bruker useSearchParams) */}
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm
          onForgotPassword={handleForgotPassword}
          onRegister={handleRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      </Suspense>
    </div>
  );
};

export default LoginPage;