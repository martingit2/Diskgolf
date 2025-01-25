/** 
 * Filnavn: Logo.tsx
 * Beskrivelse: Gjenbrukbar komponent for visning av applikasjonens logo med merkevaretekst.
 * Forenkler vedlikehold av header-komponenten ved å isolere logo-relatert kode.
 * Utvikler: Martin Pettersen
 */



/* Denne må oppdateres for å fungere alt står nå bare i Header.tsx
 * Vi ønsker å bruke disse pga de er gjenbrukbare komponenter og gjør det mer oversiktlig å lese kode
 * om vi ser i Header.tsx er det veldig langt derfor bruker vi mindre komponenter for å gjøre ting lettere å forstå og utvikle
 * men disse er ikke oppdatert per nå, så de ligger her. Men dette må fikses senere. 
 */


import Image from "next/image";
import Link from "next/link";

function Logo() {
  return (
    <div className="flex lg:flex-1 gap-x-8">
      <span className="font-sans text-3xl font-bold bg-gradient-to-r from-green-600 via-green-300 to-green-600 text-transparent bg-clip-text">
        DiskGolf
      </span>
      <Link href="/" className="-m-1.5 p-1.5">
        <Image src="/lightgreen.png" alt="Logo" width={48} height={48} />
      </Link>
    </div>
  );
}

export default Logo;
