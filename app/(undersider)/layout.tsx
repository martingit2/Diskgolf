/**
 * Filnavn: layout.tsx (app/(mainContent)/layout.tsx)
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
  // FJERN 'container'-klassen.
  // Bruker mx-auto for sentrering og max-w-screen-xl for bredde.
  // Siden den ikke har w-full, vil mørk bakgrunn vises på sidene.
  return (
    <div className="mx-auto max-w-screen-xl bg-white text-gray-900 rounded-lg shadow-xl">
      {children} {/* Sidene fra (mainContent)-mappen rendres her */}
    </div>
  );
}