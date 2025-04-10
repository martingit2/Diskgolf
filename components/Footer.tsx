// Fil: components/layout/Footer.tsx
// Formål: Footer-komponent for applikasjonen. Viser kontaktinfo, sosiale medier og nyttige lenker.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, feilsøking og oppdateringer.

"use client"; // Nødvendig for hooks og klientinteraksjon.

import { useTranslation } from 'react-i18next'; // Importer hook for oversettelser
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

/**
 * Footer-komponenten som vises nederst på sidene.
 */
export default function Footer() {
  // Henter oversettelsesfunksjonen (t) og i18n-instansen (for språkinfo).
  const { t, i18n } = useTranslation('translation');
  // Henter gjeldende språk for å bygge korrekte URLer.
  const currentLang = i18n.language;

  // Definerer lenkestruktur med korrekte ruter og oversettelsesnøkler.
  // Href bygges dynamisk med språkprefiks.
  const footerLinks = [
    { baseHref: "/baner", labelKey: "footer.links.courses" }, 
    { baseHref: "/medlemskap", labelKey: "footer.links.membership" }, 
    { baseHref: "/guide", labelKey: "footer.links.guide" }, 
    { baseHref: "/faq", labelKey: "footer.links.faq" }, 
    { baseHref: "/om-oss", labelKey: "footer.links.about" }, 
    { baseHref: "/kontakt", labelKey: "footer.links.contact" }, 
    { baseHref: "/personvern", labelKey: "footer.links.privacy" }, 
    { baseHref: "/vilkar", labelKey: "footer.links.terms" }, 
  ];

  // Henter gjeldende år for copyright-teksten.
  const currentYear = new Date().getFullYear();

  // TODO: Vurder å hente kontaktinfo (epost, tlf, adr) fra config/API istedenfor hardkoding.
  const contactEmail = "post@diskgolf.app";
  const contactPhone = "+47 123 45 678";
  const contactAddress = "Gullbringvegen 28, 3800 Bø";


  return (
    // Bruker CSS-variabel for bakgrunnsfarge for konsistens.
    <footer className="text-white p-4 text-center" style={{ backgroundColor: "var(--headerColor)" }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-4">
        {/* Kontaktinformasjon */}
        <div className="text-center md:text-left mb-4 md:mb-0 text-sm">
          <h2 className="text-base font-semibold mb-1">{t('footer.contact_info.title')}</h2>
          <p className="mt-1">
            <span className="font-medium">{t('footer.contact_info.email_label')}</span> <span className="italic">{contactEmail}</span>
          </p>
          <p>
            <span className="font-medium">{t('footer.contact_info.phone_label')}</span> <span className="italic">{contactPhone}</span>
          </p>
          <p>
            <span className="font-medium">{t('footer.contact_info.address_label')}</span> <span className="italic">{contactAddress}</span>
          </p>
        </div>

        {/* Sosiale medier-ikoner */}
        <div className="flex space-x-5 mb-4 md:mb-0">
          <a
            href="https://facebook.com" // Beholder eksterne lenker som de er
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('footer.social.facebook_aria')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaFacebook size={22} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('footer.social.instagram_aria')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FaInstagram size={22} />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
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
            <li key={link.baseHref} className="flex items-center">
              {/* Viser skillelinje før alle unntatt den første lenken */}
              {index > 0 && (
                 <span
                   aria-hidden="true"
                   className="inline-block h-4 w-px bg-green-400 mx-2 sm:mx-3 opacity-60"
                 />
              )}
              {/* Bygger href med språkprefiks */}
              <Link href={`/${currentLang}${link.baseHref}`} className="hover:text-green-400 transition-colors">
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