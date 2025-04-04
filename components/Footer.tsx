/**
 * Filnavn: Footer.tsx
 * Beskrivelse: Footer-komponent for DiskGolf-applikasjonen. Inneholder kontaktinformasjon, sosiale medier og nyttige lenker.
 * Utviklere:  Martin Pettersen, Said Hussain Khawajazada
 */

"use client";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function Footer() {
  // Definerer rekkefølgen på lenkene basert på beste praksis: Kjernefunksjoner -> Ressurser -> Om/Juridisk
  const footerLinks = [

    { href: "/baner", label: "Baneoversikt" },
    { href: "/medlemskap", label: "Medlemskap" },
    { href: "/guide", label: "Guide til Discgolf" },
    { href: "/faq", label: "FAQ" },
    { href: "/om-oss", label: "Om oss" },
    { href: "/kontakt", label: "Kontakt oss" },
    { href: "/personvern", label: "Personvern" },
    { href: "/vilkar", label: "Vilkår for bruk" },
  ];

  return (
    // Bruker CSS-variabel for bakgrunnsfarge
    <footer className="text-white p-4 text-center" style={{ backgroundColor: "var(--headerColor)" }}> {/* Increased padding slightly */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-4"> {/* Added more bottom margin */}
        {/* Kontaktinformasjon */}
        <div className="text-center md:text-left mb-4 md:mb-0 text-sm"> {/* Adjusted margin for mobile vs desktop */}
          <h2 className="text-base font-semibold mb-1">Kontaktinformasjon</h2> {/* Added margin bottom */}
          <p className="mt-1">
            <span className="font-medium">E-post:</span> <span className="italic">post@diskgolf.app</span>
          </p>
          <p>
            <span className="font-medium">Telefon:</span> <span className="italic">+47 123 45 678</span> {/* Placeholder */}
          </p>
          <p>
            <span className="font-medium">Adresse:</span> <span className="italic">Gullbringvegen 28, 3800 Bø</span>
          </p>
        </div>

        {/* Sosiale medier-ikoner */}
        <div className="flex space-x-5 mb-4 md:mb-0"> {/* Increased spacing between icons */}
          <a
            href="https://facebook.com" 
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Besøk vår Facebook-side"
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaFacebook size={22} /> {/* Slightly larger icons */}
          </a>
          <a
            href="https://instagram.com" 
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Besøk vår Instagram-profil"
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaInstagram size={22} />
          </a>
          <a
            href="https://x.com" 
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Besøk vår profil på X (tidligere Twitter)"
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaTwitter size={22} />
          </a>
        </div>
      </div>

      {/* Horisontal separator med den opprinnelige gradienten */}
      <Separator className="my-4 max-w-7xl mx-auto h-2 bg-gradient-to-r from-green-600 via-green-400 to-green-600" />
      {/* Eller bruk original tykkelse hvis ønskelig: */}
      {/* <Separator className="my-4 max-w-7xl mx-auto h-2 bg-gradient-to-r from-green-600 via-green-300 to-green-600" /> */}


      {/* Footer-lenker - Dynamisk generert */}
      <div className="max-w-7xl mx-auto text-center mt-4"> {/* Added margin top */}
        <ul className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-sm sm:gap-x-5"> {/* Slightly increased x-gap on larger screens */}
          {footerLinks.map((link, index) => (
            <li key={link.href} className="flex items-center">
              {/* Vertikal separator (solid farge for pålitelighet) vises *før* hvert element unntatt det første */}
              {index > 0 && (
                 <span
                   aria-hidden="true" // Skjul fra skjermlesere, er kun visuell
                   className="inline-block h-4 w-px bg-green-400 mx-2 sm:mx-3 opacity-60" // Solid grønn linje med litt redusert opacity
                 />
              )}
              <Link href={link.href} className="hover:text-green-400 transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Copyright-informasjon */}
      <p className="mt-5 text-xs text-gray-300"> {/* Increased margin top */}
         © {new Date().getFullYear()} Diskgolf.app. Alle rettigheter forbeholdt.
      </p>
    </footer>
  );
}