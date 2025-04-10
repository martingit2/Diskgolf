/**
 * Filnavn: layout.tsx (app/(undersider)/layout.tsx)
 * Beskrivelse: Layout for hovedinnholdsseksjoner. Skaper den hvite, sentrerte
 *              innholdsboksen ved bruk av mx-auto og max-w-*.
 * Utvikler: Martin Pettersen
 */
import React from 'react';

export default function MainContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-screen-xl bg-white text-gray-900 rounded-lg shadow-xl">
      {children} {/* Sidene fra (mainContent)-mappen rendres her */}
    </div>
  );
}