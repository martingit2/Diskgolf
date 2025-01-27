'use client';

import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const UserStats = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Hent data (statistikkene) fra backend
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Feil ved henting av statistikkene:", error);
      }
    };

    fetchStats();
  }, []);

  // Simulerte data for å teste Recharts - kan fjernes når backend fungerer
  const data = [
    { name: "Jan", totalThrows: 120, bestRound: 38 },
    { name: "Feb", totalThrows: 140, bestRound: 36 },
    { name: "Mar", totalThrows: 160, bestRound: 39 },
    { name: "Apr", totalThrows: 180, bestRound: 37 },
    { name: "Mai", totalThrows: 150, bestRound: 38 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mine Statistikker</h1>

      {/* Graf */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalThrows"
            stroke="#82ca9d"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="bestRound"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Vis statistikkene som tekst */}
      <div className="mt-6">
        {stats ? (
          <div>
            <p><strong>Antall kast:</strong> {stats.totalThrows}</p>
            <p><strong>Gjennomsnittlig poengsum:</strong> {stats.averageScore}</p>
            <p><strong>Beste runde:</strong> {stats.bestRound}</p>
          </div>
        ) : (
          <p>Laster statistikkene...</p>
        )}
      </div>
    </div>
  );
};

export default UserStats;
