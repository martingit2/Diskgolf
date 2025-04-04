/**
 * Filnavn: UserDropdown.tsx
 * Beskrivelse: Komponent for brukerens dropdown-meny. Håndterer visning av brukerinfo/knapper
 *              og åpning av dialogvinduer for innlogging/registrering/passordreset.
 *              Lukker mobilnavigasjon ved handling (kun for navigering/utlogging). Inkluderer lukkeknapp og visuell indikator (ring) for innlogget bruker på desktop.
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

  // --- VIKTIG ENDRING HER ---
  const openDialog = (type: "login" | "register" | "reset-password") => {
    setIsDropdownOpen(false); // Lukk dropdown-panelet hvis det er åpent
    // closeMobileMenu?.(); // FJERN DENNE LINJEN! Mobilmenyen skal forbli åpen bak dialogen.
    setDialogState({ open: true, type }); // Åpne Shadcn-dialogen
  };
  // -------------------------

  const closeDialog = () => {
    setDialogState({ open: false, type: "login" });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Hjelpefunksjon for å lukke ALT (dropdown + evt. mobilmeny)
  // Denne brukes nå kun for handlinger som *skal* lukke mobilmeny (navigering, utlogging)
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

  // Handler for utlogging - SKAL lukke mobilmeny
  const handleSignOut = async () => {
    closeAllMenus(); // Lukk dropdown + mobilmeny
    await signOut({ callbackUrl: "/" });
  };

  // Handler for navigering - SKAL lukke mobilmeny
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
            ? "text-white hover:bg-green-700/50" // Stil for mobilmeny
            : "text-white hover:text-green-400" // Stil for desktop header
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
                  className={cn(
                    "h-7 w-7 rounded-full object-cover",
                    // Legger til ring kun på desktop
                    !isMobile && "ring-2 ring-offset-2 ring-green-400 ring-offset-[#000311]"
                  )}
                  width={28}
                  height={28}
                />
              ) : (
                <UserCircleIcon
                  className={cn(
                      "h-7 w-7 text-green-400", // Standard farge
                      // Legger til ring og avrunding kun på desktop
                       !isMobile && "ring-2 ring-offset-2 ring-green-400 ring-offset-[#000311] rounded-full"
                  )}
                  aria-hidden="true"
                />
              )}
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
            // Plassering og generelle stiler
            "mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50", // z-50 her er OK, dialogen skal ha høyere
            // Posisjonering basert på om det er mobil eller desktop
            isMobile ? "absolute left-0 w-full" : "absolute right-0 w-56"
          )}
        >
          {/* Header i panelet med lukkeknapp */}
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
             {/* Lukkeknapp (X) for Dropdown-panelet */}
             <button
                type="button"
                onClick={() => setIsDropdownOpen(false)} // Lukker kun dropdown-panelet
                className="absolute top-1 right-1 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" // Match fokusring
                aria-label="Lukk meny"
             >
               <XMarkIcon className="h-5 w-5" aria-hidden="true" />
             </button>
          </div>
          {/* Menyvalg */}
          <div className="py-1" role="none">
            {currentUser ? (
              <>
                {/* Navigering - bruker handleNavigate som lukker mobilmeny */}
                <button
                  onClick={() => handleNavigate("/settings")} // Bruk din faktiske sti
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Cog6ToothIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Innstillinger
                </button>
                {/* Utlogging - bruker handleSignOut som lukker mobilmeny */}
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
                {/* Åpne dialog - bruker openDialog som IKKE lukker mobilmeny */}
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
                {/* Åpne dialog - bruker openDialog som IKKE lukker mobilmeny */}
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

      {/* Dialoger (Auth Modals) */}
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        {/* Beholdt høy z-index for sikkerhets skyld */}
        <DialogContent className="p-0 w-auto bg-transparent border-none z-[100]">
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
                closeDialog(); // Lukk denne dialogen
                // Ikke kall handleNavigate her, siden mobilmenyen kanskje fortsatt er åpen
                // La brukeren lukke mobilmenyen manuelt eller naviger via den.
                // router.refresh(); // Kan være lurt for å oppdatere brukerstatus i header
              }}
            />
          )}
          {dialogState.type === "register" && (
            <RegisterForm
                onRegisterSuccess={() => {
                    closeDialog(); // Lukk denne dialogen
                    openDialog("login"); // Åpne login dialogen (uten å lukke mobilmeny)
                }}
                onAlreadyHaveAccount={() => openDialog("login")} // Åpne login (uten å lukke mobilmeny)
            />
          )}
          {dialogState.type === "reset-password" && (
            <ResetForm onBackToLogin={() => openDialog("login")} /> // Åpne login (uten å lukke mobilmeny)
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}