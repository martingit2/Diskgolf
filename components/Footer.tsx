/** 
 * Filnavn: Footer.tsx
 * Beskrivelse: Footer-komponent for DiskGolf-applikasjonen. Inneholder kontaktinformasjon, sosiale medier og nyttige lenker.
 * Utviklere: Said Hussain Khawajazada, Martin Pettersen
 */



"use client";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-white p-3 text-center" style={{ backgroundColor: "var(--headerColor)" }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-2">
        <div className="text-center md:text-left mb-2 text-sm">
          <h2 className="text-base font-semibold">Kontaktinformasjon</h2>
          <p className="mt-1">
            <span className="font-medium">E-post:</span> <span className="italic">post@diskgolf.app</span>
          </p>
          <p>
            <span className="font-medium">Telefon:</span> <span className="italic">+47 123 456 789</span>
          </p>
          <p>
            <span className="font-medium">Adresse:</span> <span className="italic">Gullbringvegen 28, 3800 Bø, Midt-Telemark</span>
          </p>
        </div>

        <div className="flex space-x-3 mb-3">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-400"
          >
            <FaFacebook size={18} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-400"
          >
            <FaInstagram size={18} />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-400"
          >
            <FaTwitter size={18} title="X" />
          </a>
        </div>
      </div>

      {/* Oppdatert separator med gradient */}
      <Separator className="my-4 max-w-7xl mx-auto h-2 bg-gradient-to-r from-green-600 via-green-300 to-green-600" />

      <div className="max-w-7xl mx-auto text-center">
        <ul className="flex flex-wrap justify-center space-x-6 text-xs">
          <li>
            <Link href="/personvern" className="hover:text-gray-400">
              Personvern
            </Link>
          </li>
          <Separator orientation="vertical" className="h-4 bg-gradient-to-r from-green-600 via-green-300 to-green-600" />
          <li>
            <Link href="/faq" className="hover:text-gray-400">
              FAQ
            </Link>
          </li>
          <Separator orientation="vertical" className="h-4 bg-gradient-to-r from-green-600 via-green-300 to-green-600" />
          <li>
            <Link href="/guide" className="hover:text-gray-400">
              Guide til Discgolf
            </Link>
          </li>
          <Separator orientation="vertical" className="h-4 bg-gradient-to-r from-green-600 via-green-300 to-green-600" />
          <li>
            <Link href="/vilkar" className="hover:text-gray-400">
              Vilkår for bruk
            </Link>
          </li>
          <Separator orientation="vertical" className="h-4 bg-gradient-to-r from-green-600 via-green-300 to-green-600" />
          <li>
            <Link href="/om-oss" className="hover:text-gray-400">
              Om oss
            </Link>
          </li>
          <Separator orientation="vertical" className="h-4 bg-gradient-to-r from-green-600 via-green-300 to-green-600" />
          <li>
            <Link href="/arrangementer" className="hover:text-gray-400">
              Arrangementer
            </Link>
          </li>
          <Separator orientation="vertical" className="h-4 bg-gradient-to-r from-green-600 via-green-300 to-green-600" />
          <li>
            <Link href="/baner" className="hover:text-gray-400">
              Baneoversikt
            </Link>
          </li>
          <Separator orientation="vertical" className="h-4 bg-gradient-to-r from-green-600 via-green-300 to-green-600" />
          <li>
            <Link href="/medlemskap" className="hover:text-gray-400">
              Medlemskap
            </Link>
          </li>
        </ul>
      </div>
      <p className="mt-2 text-xs">© 2025 DiskGolf. Alle rettigheter forbeholdt.</p>
    </footer>
  );
}
