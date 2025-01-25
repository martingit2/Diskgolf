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

/**
 * Navbar-komponenten håndterer navigasjon mellom forskjellige sider.
 * Viser lenker til "Server", "Client", "Admin" og "Settings", 
 * med dynamisk styling basert på aktiv rute.
 * @component
 * @author Martin Pettersen
 */
export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-secondary flex justify-between items-center p-4 rounded-xl w-[600px] shadow-sm">
      <div className="flex gap-x-2">
        <Button 
          asChild
          variant={pathname === "/server" ? "default" : "outline"}
        >
          <Link href="/server">
            Server
          </Link>
        </Button>
        <Button 
          asChild
          variant={pathname === "/client" ? "default" : "outline"}
        >
          <Link href="/client">
            Client
          </Link>
        </Button>
        <Button 
          asChild
          variant={pathname === "/admin" ? "default" : "outline"}
        >
          <Link href="/admin">
            Admin
          </Link>
        </Button>
        <Button 
          asChild
          variant={pathname === "/settings" ? "default" : "outline"}
        >
          <Link href="/settings">
            Settings
          </Link>
        </Button>
      </div>
      <UserButton />
    </nav>
  );
};
