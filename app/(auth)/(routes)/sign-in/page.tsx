"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/"; // Fallback hvis searchParams er null

  useEffect(() => {
    if (callbackUrl) {
      // Direkte videresending til NextAuth
      signIn(undefined, { callbackUrl });
    }
  }, [callbackUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Logger inn...</h1>
        <p className="text-gray-600">Du blir videresendt, vennligst vent.</p>
      </div>
    </div>
  );
}

export default SignInPage;
