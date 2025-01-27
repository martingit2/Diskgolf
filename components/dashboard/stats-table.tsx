'use client';

import React from "react";

interface Stat {
  label: string;
  value: string | number;
}

const stats: Stat[] = [
  { label: "Antall kast", value: 150 },
  { label: "Gjennomsnittlig poengsum", value: 45.7 },
  { label: "Beste runde", value: 38 },
  { label: "Turneringer spilt", value: 10 },
  { label: "Favorittbane", value: "Oslo Disc Golf Park" },
];

const StatsTable: React.FC = () => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mine Statistikker</h2>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="py-3 px-4 bg-gray-100 text-left text-gray-600">Statistikk</th>
            <th className="py-3 px-4 bg-gray-100 text-left text-gray-600">Verdi</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              <td className="py-2 px-4 text-gray-700">{stat.label}</td>
              <td className="py-2 px-4 text-gray-900 font-medium">{stat.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
