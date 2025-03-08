// components/TabNavigation.tsx
import { FC } from "react";

interface TabNavigationProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  userRole: string;
}

const TabNavigation: FC<TabNavigationProps> = ({ selectedTab, setSelectedTab, userRole }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center space-x-6 mt-4">
        {/* Min Klubb */}
        <button
          onClick={() => setSelectedTab("minKlubb")}
          className={`py-2 px-4 text-sm font-semibold ${selectedTab === "minKlubb" ? "text-green-700" : "text-gray-600 hover:text-blue-950"}`}
        >
          Min Klubb
        </button>
        <span className="text-gray-400">|</span>

        {/* Klubbinnstillinger */}
        <button
          onClick={() => setSelectedTab("klubbInnstillinger")}
          className={`py-2 px-4 text-sm font-semibold ${selectedTab === "klubbInnstillinger" ? "text-green-700" : "text-gray-600 hover:text-blue-950"}`}
        >
          Klubbinnstillinger
        </button>
        <span className="text-gray-400">|</span>

        {/* Klubbmedlemmer */}
        <button
          onClick={() => setSelectedTab("klubbMedlemmer")}
          className={`py-2 px-4 text-sm font-semibold ${selectedTab === "klubbMedlemmer" ? "text-green-700" : "text-gray-600 hover:text-blue-950"}`}
        >
          Klubbmedlemmer
        </button>
        <span className="text-gray-400">|</span>

        {/* Rediger Klubb - kun for ADMIN eller CLUB_LEADER */}
        {userRole === "ADMIN" || userRole === "CLUB_LEADER" ? (
          <>
            <button
              onClick={() => setSelectedTab("redigerKlubb")}
              className={`py-2 px-4 text-sm font-semibold ${selectedTab === "redigerKlubb" ? "text-green-700" : "text-gray-600 hover:text-blue-950"}`}
            >
              Rediger Klubb
            </button>
            <span className="text-gray-400">|</span>
          </>
        ) : null}

        {/* Opprett Klubb */}
        <button
          onClick={() => setSelectedTab("opprettKlubb")}
          className={`py-2 px-4 text-sm font-semibold ${selectedTab === "opprettKlubb" ? "text-green-700" : "text-gray-600 hover:text-blue-950"}`}
        >
          Opprett Klubb
        </button>
      </div>

      {/* Horisontal linje under tabbene (hele bredden) */}
      <hr className="mt-4 border-t-2 border-green-700 w-full" />
    </div>
  );
};

export default TabNavigation;
