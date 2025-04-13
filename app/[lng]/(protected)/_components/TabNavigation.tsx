// Fil: /app/(protected)/_components/TabNavigation.tsx
// Formål: Komponent som rendrer navigeringsfaner for ulike klubbadministrasjonsseksjoner. Viser faner basert på brukerrolle og oppdaterer valgt fane ved klikk.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.

"use client";

import { FC } from "react";
import { UserRole } from "@prisma/client";

// Props for TabNavigation
interface TabNavigationProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  userRole: UserRole | string; // Kan være Enum eller string fra session
}

const TabNavigation: FC<TabNavigationProps> = ({ selectedTab, setSelectedTab, userRole }) => {


  return (
    // Bruk w-full for å la containeren bestemme bredden
    <div className="flex flex-col items-center w-full">
       {/* Sentrer knappene horisontalt */}
      <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 mt-4 px-4">
        {/* Min Klubb */}
        <button onClick={() => setSelectedTab("minKlubb")} className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${selectedTab === "minKlubb" ? "text-green-700 border-b-2 border-green-700" : "text-gray-700 hover:text-green-700"}`}>
          Min Klubb
        </button>

        {/* Klubbinnstillinger */}
        <button onClick={() => setSelectedTab("klubbInnstillinger")} className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${selectedTab === "klubbInnstillinger" ? "text-green-700 border-b-2 border-green-700" : "text-gray-700 hover:text-green-700"}`}>
          Innstillinger
        </button>

        {/* Klubbmedlemmer */}
        <button onClick={() => setSelectedTab("klubbMedlemmer")} className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${selectedTab === "klubbMedlemmer" ? "text-green-700 border-b-2 border-green-700" : "text-gray-700 hover:text-green-700"}`}>
          Medlemmer
        </button>

        {/* Klubbnyheter (kun knapp, innhold vises i parent) */}
        {(userRole === UserRole.ADMIN || userRole === UserRole.CLUB_LEADER) && ( 
          <button
            onClick={() => setSelectedTab("klubbNyheter")}
            className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${
             
              selectedTab === "klubbNyheter" ? "text-green-700 border-b-2 border-green-700" : "text-gray-700 hover:text-green-700"
            }`}
          >
            Nyheter
          </button>
        )}

        {/* Opprett Klubb */}
        <button onClick={() => setSelectedTab("opprettKlubb")} className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${selectedTab === "opprettKlubb" ? "text-green-700 border-b-2 border-green-700" : "text-gray-700 hover:text-green-700"}`}>
          Opprett Klubb
        </button>
      </div>

      {/* Horisontal linje */}
      <hr className="mt-2 border-t border-gray-200 w-full" />

    </div>
  );
};

export default TabNavigation;