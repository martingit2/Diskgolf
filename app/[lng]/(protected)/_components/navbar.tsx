// Fil: /_components/navbar.tsx
// Formål: Hovednavigasjonskomponent for applikasjonen. Viser relevante lenker og brukerinformasjon basert på autentiseringsstatus og brukerrolle. Inkluderer også varsling for nye feilrapporter for administratorer og klubbledere.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { Bell, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();

  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(false);

  const userRole = session?.user?.role as UserRole | "Gjest";
  const userName = session?.user?.name || "Bruker";
  const isAdminOrClubLeader = userRole === UserRole.ADMIN || userRole === UserRole.CLUB_LEADER;

  // Effekt for å hente antall notifikasjoner
  useEffect(() => {
    if (sessionStatus === 'authenticated' && isAdminOrClubLeader) {
      setIsLoadingCount(true);
      fetch('/api/error-reports/count')
        .then(res => {
          if (!res.ok) {
            // Kast en feil hvis responsen ikke er OK, slik at .catch håndterer det
            return res.json().then(err => { throw new Error(err.error || 'Failed to fetch count')});
          }
          return res.json();
        })
        .then(data => {
          setNotificationCount(data.count || 0);
        })
        .catch(error => {
          console.error("Feil ved henting av notifikasjonstall:", error);
          setNotificationCount(0);
        })
        .finally(() => {
          setIsLoadingCount(false);
        });
    } else if (sessionStatus !== 'loading') {
      setNotificationCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, isAdminOrClubLeader]); // La isAdminOrClubLeader være med i dependency array

  // Bestem hvor notifikasjonsikonet skal lenke
  const dashboardLink = "/notifications"; // <--- Endre til den nye varsel-siden

  return (
    <nav className="bg-secondary p-4 rounded-xl w-full max-w-4xl mx-auto shadow-sm flex flex-col relative">
      {/* Øverste rad: Velkomstmelding (midtstilt) + Ikoner (høyre) */}
      <div className="flex justify-between items-center w-full mb-3 relative">
        {/* Velkomstmelding */}
        <div className="flex-grow text-center">
          {sessionStatus === 'authenticated' && (
            <p className="text-sm font-semibold text-gray-700">
              Hei <span className="text-blue-700">{userName}</span>! Du er logget inn som <span className="text-green-600">{userRole}.</span>
            </p>
          )}
          {sessionStatus === 'unauthenticated' && (
            <p className="text-sm font-semibold text-gray-500">Velkommen, Gjest!</p>
          )}
          {sessionStatus === 'loading' && (
            <p className="text-sm font-semibold text-gray-500 animate-pulse">Laster bruker...</p>
          )}
        </div>

        {/* Høyre side: Notifikasjoner og Brukerknapp */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifikasjonsikon (kun for admin/leder) - KORRIGERT STRUKTUR */}
          {isAdminOrClubLeader && (
             <Button asChild variant="ghost" size="icon" className="relative rounded-full">
               <Link href={dashboardLink}>
                 {isLoadingCount ? (
                   <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                 ) : (
                   <Bell className="h-5 w-5" />
                 )}
                 {notificationCount > 0 && !isLoadingCount && (
                   <Badge
                     variant="destructive"
                     className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full pointer-events-none" // Lagt til pointer-events-none
                   >
                     {notificationCount > 9 ? '9+' : notificationCount}
                   </Badge>
                 )}
               </Link>
             </Button>
          )}

          {/* Brukerknapp / Logg inn knapp */}
          {sessionStatus === 'authenticated' ? (
            <UserButton />
          ) : sessionStatus === 'unauthenticated' ? (
            <Button asChild variant="outline">
              <Link href="/auth/login">Logg inn</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Advarsel for "Gjest" */}
      {userRole === "Gjest" && sessionStatus === 'authenticated' && (
        <div className="p-2 mt-2 bg-blue-100 text-blue-800 text-center text-xs rounded-md border border-blue-300">
          Økten er kanskje ikke fullt oppdatert. Prøv å laste siden på nytt (F5) hvis du mangler tilganger.
        </div>
      )}

      {/* Vanlige navigasjonsknapper (kun hvis innlogget) */}
      {sessionStatus === 'authenticated' && (
        <>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {/* Dine eksisterende knapper */}
            <Button asChild variant={pathname === "/server" ? "default" : "outline"}>
              <Link href="/server">Server</Link>
            </Button>
            <Button asChild variant={pathname === "/client" ? "default" : "outline"}>
              <Link href="/client">Klient</Link>
            </Button>
            {userRole === UserRole.ADMIN && (
              <Button asChild variant={pathname === "/admin" ? "default" : "outline"}>
                <Link href="/admin">Admin</Link>
              </Button>
            )}
            {userRole === UserRole.CLUB_LEADER && (
              <Button asChild variant={pathname === dashboardLink ? "default" : "outline"}>
                 {/* Bruk samme link som notifikasjonen for konsistens */}
                <Link href={dashboardLink}>Dashboard</Link>
              </Button>
            )}
            <Button asChild variant={pathname === "/settings" ? "default" : "outline"}>
              <Link href="/settings">Innstillinger</Link>
            </Button>
            <Button asChild variant={pathname === "/stats" ? "default" : "outline"}>
              <Link href="/stats">Statistikk</Link>
            </Button>
            <Button asChild variant={pathname === "/club-settings" ? "default" : "outline"}>
              <Link href="/club-settings">Klubbinnstillinger</Link>
            </Button>
          </div>

          {/* Knapper kun for Admin/Klubbleder */}
          {isAdminOrClubLeader && (
            <div className="mt-3 w-full flex flex-wrap justify-center gap-2">
              <Button asChild variant={pathname === "/map" ? "default" : "outline"}>
                <Link href="/map">Opprett Bane</Link>
              </Button>
              <Button asChild variant={pathname === "/edit-map" ? "default" : "outline"}>
                <Link href="/edit-map">Rediger Bane</Link>
              </Button>
              <Button asChild variant={pathname === "/create-tournament" ? "default" : "outline"}>
                <Link href="/create-tournament">Opprett Turnering</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </nav>
  );
};