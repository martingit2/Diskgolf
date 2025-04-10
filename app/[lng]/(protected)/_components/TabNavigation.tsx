// src/app/(protected)/_components/TabNavigation.tsx
"use client";

import { FC } from "react";
// Fjern import av CreateClubNewsForm herfra
// import CreateClubNewsForm from "./CreateClubNewsForm";

// Props for TabNavigation (trenger ikke clubId for dette formålet lenger)
interface TabNavigationProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  userRole: string;
  // clubId: string; // Fjernet - håndteres av parent
}

const TabNavigation: FC<TabNavigationProps> = ({ selectedTab, setSelectedTab, userRole }) => {
  // console.log("TabNavigation rendered. Selected tab:", selectedTab);

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
        {(userRole === "ADMIN" || userRole === "CLUB_LEADER") && (
          <button onClick={() => setSelectedTab("redigerKlubb")} className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${selectedTab === "redigerKlubb" ? "text-green-700 border-b-2 border-green-700" : "text-gray-700 hover:text-green-700"}`}>
            Nyheter
          </button>
        )}

        {/* Opprett Klubb */}
        {/* Vurder om denne skal være her eller et annet sted */}
        <button onClick={() => setSelectedTab("opprettKlubb")} className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap ${selectedTab === "opprettKlubb" ? "text-green-700 border-b-2 border-green-700" : "text-gray-700 hover:text-green-700"}`}>
          Opprett Klubb
        </button>
      </div>

      {/* Horisontal linje */}
      <hr className="mt-2 border-t border-gray-200 w-full" />

      {/* --- FJERN FORM HERFRA --- */}
      {/* Skjemaet rendres nå i ClubSettingsPage basert på selectedTab */}
      {/* ------------------------- */}
    </div>
  );
};

export default TabNavigation;