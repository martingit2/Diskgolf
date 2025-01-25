/** 
 * Filnavn: logout-button.tsx
 * Beskrivelse: Komponent for å håndtere brukerens utlogging fra applikasjonen. 
 * Utfører utlogging via NextAuth og en tilpasset server-handling.
 * Utvikler: Martin Pettersen
 */


"use client";

import { signOut } from "next-auth/react";
import { logout } from "@/app/actions/logout";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onClick = async () => {
    try {
      await logout(); // Kall server-handling hvis nødvendig
      await signOut({ callbackUrl: "/" }); // Logg ut og redirect
    } catch (error) {
      console.error("Feil ved utlogging:", error);
    }
  };

  return (
    <span
      onClick={onClick}
      className="cursor-pointer text-red-600"
      style={{ cursor: "pointer" }} // Sørger for at pekehånden vises
    >
      {children || "Logg ut"}
    </span>
  );
};
