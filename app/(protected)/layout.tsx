/** 
 * 
 * Filnavn: ProtectedLayout.tsx
 * Beskrivelse: Layout-komponent som brukes til beskyttede sider, 
 * med navigasjonslinje og sentrert innhold.
 * Utvikler: Martin Pettersen
 */


import { Navbar } from "./_components/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * ProtectedLayout-komponenten gir en grunnstruktur for beskyttede sider i applikasjonen.
 * Inkluderer navigasjonsmeny (Navbar) og plasserer innholdet sentrert på skjermen.
 * 
 * @component
 * @param {ProtectedLayoutProps} children - Innholdet som skal vises innenfor layouten.
 * @author Martin Pettersen
 */
const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gray-100">
      <Navbar />
      <main className="w-full flex flex-col items-center mt-4 lg:mt-2">
        {children}
      </main>
    </div>
  );
};

export default ProtectedLayout;
