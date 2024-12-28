"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  useEffect(() => {
    if (callbackUrl) {
      signIn(undefined, { callbackUrl });
    }
  }, [callbackUrl]);

  return null;
}

export default SignInForm;
