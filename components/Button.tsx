/** 
 * Filnavn: Button.tsx
 * Beskrivelse: Gjenbrukbar knapp-komponent med støtte for tilpasset stil, ikoner og interaksjoner.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */


"use client"; // Indikerer at denne komponenten skal rendres på klientsiden.

import { IconType } from "react-icons"; // Typing for ikonkomponenten.

interface ButtonProps {
  label: string; // Teksten som vises på knappen.
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; // Funksjon som kjøres når knappen klikkes.
  disabled?: boolean; // Om knappen skal være deaktivert (f.eks. under lasting).
  outline?: boolean; // Hvis true, gir knappen en "outline"-stil (kantlinje).
  small?: boolean; // Hvis true, gir knappen en mindre størrelse.
  icon?: IconType; // Valgfritt ikon som kan vises på knappen.
}

/**
 * Gjenbrukbar Button-komponent:
 * - Brukes til å lage ulike typer knapper med støtte for ikoner, små størrelser og outline-stil.
 * - Kan tilpasses med props for spesifikke behov.
 */
const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon: Icon, // Navngir det valgfri ikonet som "Icon".
}) => {
  return (
    <button
      onClick={onClick} // Håndterer klikkhendelsen.
      disabled={disabled} // Deaktiverer knappen hvis `disabled` er true.
      className={`
        relative
        disabled:opacity-70 // Reduserer synligheten hvis knappen er deaktivert.
        disabled:cursor-not-allowed // Hindrer at musepekeren endres til en "klikkbar" hånd.
        rounded-lg // Gir knappen avrundede hjørner.
        w-full // Gjør knappen full bredde i containeren.
        transition duration-300 // Legger til jevne animasjoner, som fargeendring.
        hover:bg-green-700 // Endrer bakgrunnsfargen til grønn ved hover.
        ${outline ? "bg-white border-black text-black" : "bg-greyblue border-greyblue text-white"} // Stil basert på outline-propen.
        ${small ? "py-1 text-sm font-light border-[1px]" : "py-3 text-md font-semibold border-2"} // Bruker liten eller standard stil basert på small-propen.
      `}
    >
      {/* Viser teksten som ble sendt inn via label-propen */}
      {label}

      {/* Viser ikonet hvis det er spesifisert */}
      {Icon && <Icon size={24} className="absolute right-4 top-3" />}
    </button>
  );
};

export default Button;
