// app/auth/login/page.tsx
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