/** 
 * Filnavn: test-login.tsx
 * Beskrivelse: Enkel test-login-komponent for manuell innlogging med e-post og passord.
 * Bruker NextAuth for autentisering og håndterer feil ved innlogging.
 * Utvikler: Martin Pettersen
 */


"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const TestLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      window.location.href = "/"; // Rediriger til startsiden ved suksess
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-xl font-semibold mb-4">Test Login</h1>
      <input
        type="email"
        placeholder="E-post"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Passord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Logg inn
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default TestLogin;
