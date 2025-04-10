// Fil: components/layout/Footer.tsx (Eksempelvis sti)
// Formål: Footer-komponent for applikasjonen. Viser kontaktinfo, sosiale medier og nyttige lenker.
// Utvikler: Martin Pettersen


"use client"; 

import { useTranslation } from 'react-i18next'; // Importer hook for oversettelser
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

/**
 * Footer-komponenten som vises nederst på sidene.
 */
export default function Footer() {
  // Henter oversettelsesfunksjonen for 'translation' namespace.
  const { t } = useTranslation('translation');

  // Definerer lenkestruktur. Labels hentes nå via t().
  const footerLinks = [
  
    { href: "/courses", labelKey: "footer.links.courses" }, // Bruker nøkkel for label
    { href: "/membership", labelKey: "footer.links.membership" },
    { href: "/guide", labelKey: "footer.links.guide" },
    { href: "/faq", labelKey: "footer.links.faq" },
    { href: "/about", labelKey: "footer.links.about" },
    { href: "/contact", labelKey: "footer.links.contact" },
    { href: "/privacy", labelKey: "footer.links.privacy" },
    { href: "/terms", labelKey: "footer.links.terms" },
  ];

  // Henter gjeldende år for copyright-teksten.
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white p-4 text-center" style={{ backgroundColor: "var(--headerColor)" }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-4">
        {/* Kontaktinformasjon */}
        <div className="text-center md:text-left mb-4 md:mb-0 text-sm">
          {/* Oversatt tittel */}
          <h2 className="text-base font-semibold mb-1">{t('footer.contact_info.title')}</h2>
          <p className="mt-1">
            {/* Oversatt label */}
            <span className="font-medium">{t('footer.contact_info.email_label')}</span> <span className="italic">post@diskgolf.app</span>
          </p>
          <p>
            {/* Oversatt label */}
            <span className="font-medium">{t('footer.contact_info.phone_label')}</span> <span className="italic">+47 123 45 678</span>
          </p>
          <p>
             {/* Oversatt label */}
            <span className="font-medium">{t('footer.contact_info.address_label')}</span> <span className="italic">Gullbringvegen 28, 3800 Bø</span>
          </p>
        </div>

        {/* Sosiale medier-ikoner */}
        <div className="flex space-x-5 mb-4 md:mb-0">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            // Oversatt aria-label
            aria-label={t('footer.social.facebook_aria')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaFacebook size={22} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
             // Oversatt aria-label
            aria-label={t('footer.social.instagram_aria')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaInstagram size={22} />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
             // Oversatt aria-label
            aria-label={t('footer.social.twitter_aria')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaTwitter size={22} />
          </a>
        </div>
      </div>

      {/* Separator */}
      <Separator className="my-4 max-w-7xl mx-auto h-2 bg-gradient-to-r from-green-600 via-green-400 to-green-600" />

      {/* Footer-lenker */}
      <div className="max-w-7xl mx-auto text-center mt-4">
        <ul className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-sm sm:gap-x-5">
          {footerLinks.map((link, index) => (
            <li key={link.href} className="flex items-center">
              {index > 0 && (
                 <span
                   aria-hidden="true"
                   className="inline-block h-4 w-px bg-green-400 mx-2 sm:mx-3 opacity-60"
                 />
              )}
              <Link href={link.href} className="hover:text-green-400 transition-colors">
                 {/* Henter oversatt label basert på nøkkel */}
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Copyright-informasjon */}
      <p className="mt-5 text-xs text-gray-300">
        {/* Bruker t() med variabel for årstall */}
        {t('footer.copyright', { year: currentYear })}
      </p>
    </footer>
  );
}