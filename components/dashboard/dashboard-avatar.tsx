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
