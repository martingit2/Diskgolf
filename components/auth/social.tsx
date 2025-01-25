/** 
 * Filnavn: social.tsx
 * Beskrivelse: Komponent for sosiale innloggingsknapper via Google og GitHub. 
 * Håndterer innlogging med NextAuth og støtter tilpasset callback-URL.
 * Utvikler: Martin Pettersen
 */


"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || DEFAULT_LOGIN_REDIRECT; // Fallback hvis searchParams er null

  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl,
    });
  };

  return (
    <div className="flex items-center w-full gap-x-2">
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="h-5 w-5" />
      </Button>
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick("github")}
      >
        <FaGithub className="h-5 w-5" />
      </Button>
    </div>
  );
};
