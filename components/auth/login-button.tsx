/** 
 * Filnavn: login-button.tsx
 * Beskrivelse: En fleksibel påloggingsknapp som kan fungere enten som en modaldialog eller en redirect til innloggingssiden.
 * Utvikler: Martin Pettersen
 */


"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "../ui/dialog";
import LoginForm from "./login-form";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

export const LoginButton = ({
  children,
  mode = "redirect",
  asChild,
}: LoginButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push("/auth/login");
  };

  const handleForgotPassword = () => {
    console.log("Navigerer til glemt passord");
    router.push("/auth/reset");
  };

  const handleRegister = () => {
    console.log("Navigerer til registrering");
    router.push("/auth/register");
  };

  if (mode === "modal") {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>
          {children}
        </DialogTrigger>
        <DialogContent className="p-0 w-auto bg-transparent border-none">
          <DialogTitle className="sr-only">Logg inn</DialogTitle>
          <LoginForm
            onForgotPassword={handleForgotPassword}
            onRegister={handleRegister}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
