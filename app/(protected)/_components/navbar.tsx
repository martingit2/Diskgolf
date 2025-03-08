/**
 * Filnavn: Navbar.tsx
 * Beskrivelse: Navigasjonskomponent med lenker til ulike sider og brukerknapp.
 * Utvikler: Martin Pettersen
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";
import { useSession } from "next-auth/react";

/**
 * Navbar-komponenten håndterer navigasjon mellom forskjellige sider.
 * Viser brukerens rolle, vanlige navigasjonslenker og en egen seksjon for admin-knapper.
 * @component
 * @author Martin Pettersen
 */
export const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hent brukerrolle eller vis "Gjest" om ikke innlogget
  const userRole = session?.user?.role || "Gjest";

  // Sjekk om brukeren er ADMIN eller CLUB_LEADER
  const isAdminOrClubLeader = userRole === "ADMIN" || userRole === "CLUB_LEADER";

  return (
    <nav className="bg-secondary p-4 rounded-xl w-full max-w-3xl mx-auto shadow-sm flex flex-col relative">
      
      {/* Øverste rad: Velkomstmelding (midtstilt) + Brukerknapp (høyre) */}
      <div className="flex justify-between items-center w-full mb-3 relative">
        {/* Midtstilt tekst */}
        <p className="text-sm font-semibold text-gray-700 absolute left-1/2 transform -translate-x-1/2">
          Hei! Du er innlogget som <span className="text-green-600">{userRole}</span>
        </p>

        {/* Brukerknapp til høyre */}
        <div className="ml-auto">
          <UserButton />
        </div>
      </div>

      {/* Vanlige navigasjonsknapper */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button asChild variant={pathname === "/server" ? "default" : "outline"}>
          <Link href="/server">Server</Link>
        </Button>
        <Button asChild variant={pathname === "/client" ? "default" : "outline"}>
          <Link href="/client">Klient</Link>
        </Button>
        <Button asChild variant={pathname === "/admin" ? "default" : "outline"}>
          <Link href="/admin">Admin</Link>
        </Button>
        <Button asChild variant={pathname === "/settings" ? "default" : "outline"}>
          <Link href="/settings">Innstillinger</Link>
        </Button>
        <Button asChild variant={pathname === "/stats" ? "default" : "outline"}>
          <Link href="/stats">Statistikk</Link>
        </Button>
      </div>

      {/* Admin-seksjon: Vises kun for ADMIN eller CLUB_LEADER */}
      {isAdminOrClubLeader && (
        <div className="mt-3 w-full flex justify-center">
          <Button asChild variant={pathname === "/map" ? "default" : "outline"}>
            <Link href="/map">Bane</Link>
          </Button>
        </div>
      )}

    </nav>
  );
};
