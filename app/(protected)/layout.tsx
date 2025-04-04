/**
 * Filnavn: ProtectedLayout.tsx
 * Beskrivelse: Layout-komponent som brukes til beskyttede sider, 
 * med navigasjonslinje og et bredere innholdsområde.
 * Utvikler: Martin Pettersen
 */

import { Navbar } from "./_components/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * ProtectedLayout-komponenten gir en grunnstruktur for beskyttede sider i applikasjonen.
 * Inkluderer navigasjonsmeny (Navbar) og gir innholdet mer plass i bredden.
 * 
 * @component
 * @param {ProtectedLayoutProps} children - Innholdet som skal vises innenfor layouten.
 * @author Martin Pettersen
 */
const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 text-gray-900">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 mt-4 lg:mt-2">
        {children}
      </main>
    </div>
  );
};

export default ProtectedLayout;
