/**
 * Filnavn: Heading.tsx
 * Beskrivelse: Gjenbrukbar overskriftskomponent for å vise tittel og undertekst med fleksibel justering.
 * Utvikler: Martin Pettersen
 */

'use client';

import React from 'react'; // Importer React

interface HeadingProps {
  title: string; // Tittelen som skal vises
  subtitle?: string; // Valgfri undertekst
  center?: boolean; // Valgfri prop for å sentrere teksten
}

const Heading: React.FC<HeadingProps> = ({
  title,
  subtitle,
  center // Mottar props
}) => {
  return (
    // Bruker className for å styre justering basert på 'center'-prop
    <div className={center ? 'text-center' : 'text-start'}>
      {/* Viser tittelen */}
      <div className="text-2xl font-bold">
        {title}
      </div>
      {/* Viser undertekst hvis den finnes */}
      {subtitle && (
        <div className="font-light text-neutral-500 mt-1 md:mt-2"> {/* Justert margin */}
          {subtitle}
        </div>
      )}
    </div>
   );
}

export default Heading; // Eksporterer komponenten