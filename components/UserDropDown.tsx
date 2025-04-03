/**
 * Filnavn: UserDropdown.tsx
 * Beskrivelse: Komponent for brukerens dropdown-meny. Håndterer visning av brukerinfo/knapper
 *              og åpning av dialogvinduer for innlogging/registrering/passordreset.
 *              Lukker mobilnavigasjon ved handling. Inkluderer lukkeknapp og visuell indikator (ring) for innlogget bruker på desktop.
 * Utvikler: Martin Pettersen
 */

"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Bruker Shadcn Dialog
import {
  PlusCircleIcon,
  ChevronDownIcon,
  ArrowRightIcon, // Brukt for Logg inn
  Cog6ToothIcon, // Brukt for Innstillinger
  ArrowLeftOnRectangleIcon, // Brukt for Logg ut
  UserCircleIcon, // Fallback-ikon for bruker uten bilde
  XMarkIcon, // Ikon for lukkeknapp
} from "@heroicons/react/20/solid";
import { cn } from "@/app/lib/utils";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { ResetForm } from "@/components/auth/reset-form";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/app/types"; // Sørg for at denne typen stemmer
import Image from "next/image";
import { signOut } from "next-auth/react";

interface UserDropdownProps {
  isMobile: boolean;
  currentUser: User | null;
  closeMobileMenu?: () => void; // Valgfri funksjon for å lukke mobilnavigasjonen
}

export default function UserDropdown({
  isMobile,
  currentUser,
  closeMobileMenu, // Motta prop'en
}: UserDropdownProps) {
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
    setIsDropdownOpen(false); // Lukk dropdown når dialog åpnes
    closeMobileMenu?.(); // Lukk også mobilmeny hvis den finnes
    setDialogState({ open: true, type });
  };

  const closeDialog = () => {
    setDialogState({ open: false, type: "login" });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Hjelpefunksjon for å lukke ALT (dropdown + evt. mobilmeny)
  const closeAllMenus = () => {
    setIsDropdownOpen(false);
    closeMobileMenu?.(); // Kall mobilmenylukking hvis funksjonen er gitt
  };

  // Effekt for å lukke dropdown ved klikk utenfor
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false); // Kun dropdown lukkes her
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Handler for utlogging
  const handleSignOut = async () => {
    closeAllMenus(); // Lukk dropdown + mobilmeny
    await signOut({ callbackUrl: "/" });
  };

  // Handler for navigering (f.eks. til innstillinger)
  const handleNavigate = (path: string) => {
    closeAllMenus(); // Lukk dropdown + mobilmeny
    router.push(path);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative ${isMobile ? "w-full" : "inline-block text-left"}`}
    >
      {/* Dropdown-knapp */}
      <button
        id="user-menu-button" // ID for aria-labelledby
        onClick={toggleDropdown}
        className={cn(
          "inline-flex justify-between items-center gap-x-2 w-full rounded-md px-3 py-2 text-sm font-semibold leading-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#000311]",
          isMobile
            ? "text-white hover:bg-green-700/50"
            : "text-white hover:text-green-400"
        )}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <span className="flex items-center gap-x-2">
          {currentUser ? (
            <>
              {currentUser.image ? (
                <Image
                  src={currentUser.image}
                  alt="Profilbilde"
                   // --- NYTT: Lagt til ring på desktop ---
                  className={cn(
                      "h-7 w-7 rounded-full object-cover",
                      !isMobile && "ring-2 ring-offset-2 ring-green-400 ring-offset-[#000311]" // Grønn ring på desktop
                  )}
                  width={28}
                  height={28}
                />
              ) : (
                // --- NYTT: Lagt til ring på fallback-ikon også ---
                <UserCircleIcon
                    className={cn(
                        "h-7 w-7 text-green-400", // Standard farge
                         !isMobile && "ring-2 ring-offset-2 ring-green-400 ring-offset-[#000311] rounded-full" // Grønn ring på desktop
                    )}
                    aria-hidden="true"
                 />
              )}
              {/* Viser navn kun på desktop for å spare plass på mobil? Eller alltid? */}
              <span className={cn(isMobile ? "text-base" : "text-sm")}>
                {currentUser.name || currentUser.email}
              </span>
            </>
          ) : (
            <span className={cn(isMobile ? "text-base" : "text-sm")}>Konto</span>
          )}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-5 w-5 text-green-400 transition-transform duration-200",
            isDropdownOpen ? "rotate-180" : ""
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Panel */}
      {isDropdownOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button" // Refererer til knappens ID
          className={cn(
            "mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50",
            isMobile ? "absolute left-0 w-full" : "absolute right-0 w-56"
          )}
        >
          {/* --- NYTT: Header i panelet med lukkeknapp --- */}
          <div className="relative px-4 py-3">
             <p className="truncate text-sm font-medium text-gray-900">
               {currentUser
                 ? `Logget inn som ${currentUser.name || currentUser.email}`
                 : "Velkommen"}
             </p>
             {!currentUser && (
                 <p className="text-sm text-gray-500">
                     Logg inn eller opprett bruker.
                 </p>
             )}
             {/* Lukkeknapp (X) */}
             <button
                type="button"
                onClick={closeAllMenus} // Bruker samme funksjon som lukker alt
                className="absolute top-1 right-1 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" // Juster fokusring etter ønske
                aria-label="Lukk meny"
             >
               <XMarkIcon className="h-5 w-5" aria-hidden="true" />
             </button>
          </div>
          {/* --------------------------------------------- */}
          <div className="py-1" role="none">
            {currentUser ? (
              <>
                <button
                  onClick={() => handleNavigate("/settings")} // Bruk din sti
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Cog6ToothIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Innstillinger
                </button>
                <button
                  onClick={handleSignOut}
                  className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  role="menuitem"
                >
                  <ArrowLeftOnRectangleIcon
                    className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600"
                    aria-hidden="true"
                  />
                  Logg ut
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openDialog("login")}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <ArrowRightIcon
                    className="mr-3 h-5 w-5 text-green-600"
                    aria-hidden="true"
                  />
                  Logg inn
                </button>
                <button
                  onClick={() => openDialog("register")}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <PlusCircleIcon
                    className="mr-3 h-5 w-5 text-green-600"
                    aria-hidden="true"
                  />
                  Opprett bruker
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dialoger (Ingen endringer nødvendig her) */}
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="p-0 w-auto bg-transparent border-none z-[60]">
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
                handleNavigate("/stats"); // Oppdatert for å lukke mobilmeny også
              }}
            />
          )}
          {dialogState.type === "register" && (
            <RegisterForm
                onRegisterSuccess={() => {
                    closeDialog();
                    openDialog("login");
                    // Eller: handleNavigate('/velkommen'); // Oppdater for å lukke mobilmeny
                }}
                onAlreadyHaveAccount={() => openDialog("login")}
            />
          )}
          {dialogState.type === "reset-password" && (
            <ResetForm onBackToLogin={() => openDialog("login")} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sørg for at denne eksporteres riktig hvis det er hovedversjonen
// export default UserDropdown;