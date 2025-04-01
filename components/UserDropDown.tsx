/** 
 * Filnavn: UserDropdown.tsx
 * Beskrivelse: Komponent for brukerens dropdown-meny. Inkluderer alternativer for innlogging, registrering, tilbakestilling av passord, og utlogging.
 * Tilbyr en responsiv og tilgjengelig meny for både desktop- og mobilvisning.
 * Utvikler: Martin Pettersen
 */



"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusCircleIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/20/solid";
import { cn } from "@/app/lib/utils";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { ResetForm } from "@/components/auth/reset-form";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/app/types";
import Image from "next/image";
import { signOut } from "next-auth/react";

function UserDropdown({
  isMobile,
  currentUser,
}: {
  isMobile: boolean;
  currentUser: User | null;
}) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: "login" | "register" | "reset-password";
  }>({
    open: false,
    type: "login",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openDialog = (type: "login" | "register" | "reset-password") => {
    setDialogState({ open: true, type });
  };

  const closeDialog = () => {
    setDialogState({ open: false, type: "login" });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`relative ${isMobile ? "w-full" : "inline-block text-left"}`}
    >
      <button
        onClick={toggleDropdown}
        className={cn(
          "inline-flex justify-center items-center gap-2 w-full rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
          isMobile
            ? "bg-green-700 text-white hover:bg-green-600"
            : "bg-green-700 hover:bg-green-600"
        )}
      >
        {currentUser ? (
          <>
            {currentUser.image ? (
              <Image
                src={currentUser.image}
                alt="Avatar"
                className="h-8 w-8 rounded-full"
                width={32}
                height={32}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
            )}
            {currentUser.name}
          </>
        ) : (
          <>
            Konto
          </>
        )}
        <ChevronDownIcon
          className="ml-2 -mr-1 h-5 w-5 text-white"
          aria-hidden="true"
        />
      </button>
      {isDropdownOpen && (
        <div
          className={cn(
            "mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            isMobile ? "absolute left-0 w-full" : "absolute right-0 w-56"
          )}
        >
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700">
              {currentUser ? `Hei, ${currentUser.name}` : "Velg handling"}
            </p>
          </div>
          <div className="py-1">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    closeDropdown();
                    router.push("/settings");
                  }}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                >
                  Innstillinger
                </button>
                <button
    onClick={async () => { // Gjør gjerne onClick async hvis du vil 'await' signOut
        closeDropdown();
        // Kall signOut() - den tar seg av navigering og API-kall
        // Du kan spesifisere en callbackUrl for å sende brukeren et sted etterpå
        await signOut({ callbackUrl: '/' }); // Sender brukeren til forsiden etter utlogging
        // Alternativt, uten spesifikk callbackUrl, vil den bruke standard (ofte forsiden):
        // await signOut();
    }}
    className="group flex w-full items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
>
    Logg ut
</button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openDialog("login")}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-900 hover:bg-blue-100 hover:text-blue-700"
                >
                  <ArrowRightIcon
                    className="mr-3 h-5 w-5"
                    aria-hidden="true"
                  />
                  Logg inn
                </button>
                <button
                  onClick={() => openDialog("register")}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-900 hover:bg-green-100 hover:text-green-700"
                >
                  <PlusCircleIcon
                    className="mr-3 h-5 w-5"
                    aria-hidden="true"
                  />
                  Opprett bruker
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dialoger */}
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="p-0 w-auto bg-transparent border-none">
          <DialogTitle className="sr-only">
            {dialogState.type === "login" && "Logg inn"}
            {dialogState.type === "register" && "Opprett bruker"}
            {dialogState.type === "reset-password" && "Tilbakestill passord"}
          </DialogTitle>
          {dialogState.type === "login" && (
            <LoginForm
              onForgotPassword={() => openDialog("reset-password")}
              onRegister={() => openDialog("register")}
              onLoginSuccess={() => {
                closeDialog();
                router.push("/settings");
              }}
            />
          )}
          {dialogState.type === "register" && (
            <RegisterForm onAlreadyHaveAccount={() => openDialog("login")} />
          )}
          {dialogState.type === "reset-password" && (
            <ResetForm onBackToLogin={() => openDialog("login")} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserDropdown;
