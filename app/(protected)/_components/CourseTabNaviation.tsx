"use client";

import { FC } from "react";

interface CourseTabNavigationProps {
  selectedTab: "opprettBane" | "redigerBane"; // Oppdatert type
  setSelectedTab: (tab: "opprettBane" | "redigerBane") => void; // Oppdatert type
}

const CourseTabNavigation: FC<CourseTabNavigationProps> = ({ selectedTab, setSelectedTab }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center space-x-6 mt-4">
        {/* Opprett Bane */}
        <button
          onClick={() => setSelectedTab("opprettBane")}
          className={`py-2 px-4 text-sm font-semibold ${selectedTab === "opprettBane" ? "text-green-700" : "text-gray-600 hover:text-blue-950"}`}
        >
          Opprett Bane
        </button>
        <span className="text-gray-400">|</span>

        {/* Rediger Bane */}
        <button
          onClick={() => setSelectedTab("redigerBane")}
          className={`py-2 px-4 text-sm font-semibold ${selectedTab === "redigerBane" ? "text-green-700" : "text-gray-600 hover:text-blue-950"}`}
        >
          Rediger Bane
        </button>
      </div>

      {/* Horisontal linje under tabbene */}
      <hr className="mt-4 border-t-2 border-green-700 w-full" />
    </div>
  );
};

export default CourseTabNavigation;