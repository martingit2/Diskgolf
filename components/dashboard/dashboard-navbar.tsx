// Fil: components/dashboard/dashboard-navbar.tsx
// Formål: Definerer en React-komponent for hovednavigasjonsbaren i brukerens dashbord.
//         Viser brukerens avatar, rollebaserte navigasjonslenker (admin, klubbleder, bruker),
//         og en logg ut-knapp. Bruker Next.js Link for navigasjon.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


'use client';

import Link from "next/link";
import Avatar from "./dashboard-avatar";

const DashboardNavbar = ({ userRole }: { userRole: "admin" | "klubbleder" | "bruker" }) => {
  // Rollebaserte linker
  const roleLinks: Record<
    "admin" | "klubbleder" | "bruker",
    { href: string; label: string }[]
  > = {
    admin: [
      { href: "/admin/dashboard", label: "Admin Panel" },
      { href: "/admin/settings", label: "Admin Innstillinger" },
    ],
    klubbleder: [
      { href: "/club/overview", label: "Klubb Oversikt" },
      { href: "/club/members", label: "Medlemsadministrasjon" },
    ],
    bruker: [
      { href: "/my-club", label: "Min Klubb" },
      { href: "/stats", label: "Mine Statistikker" },
      { href: "/scorecards", label: "Mine Poengkort" },
      { href: "/favorites", label: "Mine Favorittbaner" },
      { href: "/notifications", label: "Varsler" },
      { href: "/reviews", label: "Anmeldelser" },
      { href: "/tournaments/my-participation", label: "Turneringsdeltakelse" },
      { href: "/settings", label: "Innstillinger" },
      { href: "/privacy", label: "Personvern og GDPR" },
      { href: "/payments", label: "Betalinger" },
    ],
  };

  const links = roleLinks[userRole] || roleLinks.bruker;

  return (
    <div className="flex flex-col bg-gradient-to-r from-gray-800 via-gray-950 to-gray-800 shadow-2xl text-white  p-4 h-full min-h-screen  hover:text-green-300 ">

      {/* Avatar på toppen */}
      <div className="mr-2 p-2">
        <Avatar />
      </div>

      {/* Rollebaserte linker */}
      <nav className="space-y-8 p-6 flex-grow">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="block font-bold hover:text-green-300  text-white hover:underline mb-4"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Logg ut-knapp nederst */}
      <div className=" flex-grow p-4 mt-auto">
        <button
          className="block w-full text-left font-semibold bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 ease-in-out"
          onClick={() => console.log("Logg ut funksjonalitet her")}
        >
          Logg Ut
        </button>
      </div>
    </div>
  );
};

export default DashboardNavbar;
