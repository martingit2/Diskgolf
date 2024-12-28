"use client";

import SignInForm from "@/components/testSignInForm";
import { Suspense } from "react";


export const dynamic = "force-dynamic";

function SignInPage() {
  return (
    <Suspense fallback={<div>Laster inn...</div>}>
      <SignInForm />
    </Suspense>
  );
}

export default SignInPage;
