"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";
import { useSession } from "next-auth/react"; // Bruk useSession for å få tilgang til sesjonsdataene

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hent brukerrolle eller vis "Gjest" om ikke innlogget
  const userRole = session?.user?.role || "Gjest";  // Hvis ikke logget inn, sett til "Gjest"
  const userName = session?.user?.name || "Bruker";  // Hvis ikke logget inn, sett til "Bruker"

  // Sjekk om brukeren er ADMIN eller CLUB_LEADER
  const isAdminOrClubLeader = userRole === "ADMIN" || userRole === "CLUB_LEADER";

  return (
    <nav className="bg-secondary p-4 rounded-xl w-full max-w-3xl mx-auto shadow-sm flex flex-col relative">
      {/* Øverste rad: Velkomstmelding (midtstilt) + Brukerknapp (høyre) */}
      <div className="flex justify-between items-center w-full mb-3 relative">
        <p className="text-sm font-semibold text-gray-700 absolute left-1/2 transform -translate-x-1/2">
          Hei <span className="text-blue-700">{userName}</span>! Du er logget inn som <span className="text-green-600">{userRole}.</span>
        </p>
        <div className="ml-auto">
          <UserButton />
        </div>
      </div>

      {/* Vis advarsel hvis brukeren er "Gjest" */}
      {userRole === "Gjest" && (
        <div className="p-4 bg-blue-100 text-blue-800 text-center rounded-md border border-blue-300">
          På grunn av en teknisk feil er sesjonen ikke oppdatert. Vennligst oppdater siden ved å trykke F5 for å få tilgang til den riktige informasjonen.
        </div>
      )}

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
        {/* Klubbinnstillinger-knapp vises alltid */}
        <Button asChild variant={pathname === "/club-settings" ? "default" : "outline"}>
          <Link href="/club-settings">Klubbinnstillinger</Link>
        </Button>
      </div>

      {isAdminOrClubLeader && (
        <div className="mt-3 w-full flex justify-center gap-2">
          {/* Bane-knapp */}
          <Button asChild variant={pathname === "/map" ? "default" : "outline"}>
            <Link href="/map">Bane</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};
