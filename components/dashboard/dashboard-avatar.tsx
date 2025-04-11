// Fil: components/dashboard/dashboard-avatar.tsx
// Formål: Definerer en enkel React-komponent for å vise en placeholder-avatar og grunnleggende brukerinformasjon (brukernavn, rolle) i et dashbord-kontekst.
//         Komponenten er statisk og viser foreløpig faste verdier.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

const Avatar = () => {
  return (
    <div className="flex items-center space-x-3">
      {/* Profilbilde */}
      <div className="w-10 h-10 rounded-full bg-gray-300"></div>
      {/* Brukernavn */}
      <div>
        <p className="font-bold text-sm">Brukernavn</p>
        <p className="text-xs text-gray-400">Rolle: Bruker</p>
      </div>
    </div>
  );
};

export default Avatar;
