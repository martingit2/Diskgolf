/**
 * Filnavn: Header.tsx (Hoved-navbar)
 * Beskrivelse: Navigasjonskomponent for DiskGolf-applikasjonen. Viser logo, navigasjonslenker,
 *              språkvelger og bruker-dropdown. Støtter både desktop og mobil visning.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, feilsøking og oppdateringer.
 */
'use client';

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useState, Fragment, SVGProps, RefAttributes, ForwardRefExoticComponent } from 'react'; // Importer nødvendige typer
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import {
  ChevronDownIcon, SunIcon, EnvelopeIcon, StarIcon, ExclamationTriangleIcon, MagnifyingGlassCircleIcon,
} from '@heroicons/react/20/solid';
import { cn } from '@/app/lib/utils';
import UserDropdown from './UserDropDown';
import { useSession } from "next-auth/react";
import { User } from '@/app/types';
import { useTranslation } from 'react-i18next'; // <<< Importer hook

// Importer språkvelger-komponent
import { LanguageSwitcher } from './LanguageSwitcher';

// Type for ikoner (gjenbrukt fra Heroicons)
type HeroIcon = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>;

// Definisjoner for navigasjonslenker og CTA i popover
// Merk: href er nå baseHref (uten språk)
interface NavItemBase {
  key: string;
  name: string; // Fallback-navn
  description?: string; // Gjør description valgfri
  baseHref: string; // Sti uten språkprefiks
  icon: HeroIcon;
}

// Definer base-hrefs her
const navLinksBase: NavItemBase[] = [
    { key: 'finn_bane', name: 'Finn bane', description: 'Søk etter tilgjengelige baner.', baseHref: '/baner', icon: MagnifyingGlassCircleIcon },
    { key: 'mest_populære', name: 'Mest populære', description: 'De mest populære banene.', baseHref: '/baner?sortBy=popular', icon: StarIcon },
    { key: 'rapporter_feil', name: 'Rapporter feil', description: 'Gi beskjed om feil.', baseHref: '/rapporter-feil', icon: ExclamationTriangleIcon },
];

// CTA har ikke 'description'
const ctaBase: NavItemBase[] = [
    { key: 'vis_vær', name: 'Vis vær', baseHref: '/weather', icon: SunIcon },
    { key: 'kontakt_oss', name: 'Kontakt oss', baseHref: '/kontakt', icon: EnvelopeIcon },
];

// Andre hovedlenker (base-stier)
const mainLinksBase = [
    { baseHref: '/nyheter', labelKey: 'header.news', fallbackName: 'Nyheter' },
    { baseHref: '/spill', labelKey: 'header.coursePlay', fallbackName: 'Banespill' },
    { baseHref: '/turneringer', labelKey: 'header.tournaments', fallbackName: 'Turneringer' },
    { baseHref: '/klubber', labelKey: 'header.clubs', fallbackName: 'Klubber' },
]


// Hovedkomponent for Header/Navbar
function Header() {
  // State for mobilmenyens synlighet
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Henter sesjonsdata og status
  const { data: session, status } = useSession();
  const currentUser = session?.user as User | null ?? null;
  // Henter oversettelsesfunksjonen 't' OG i18n-instansen
  const { t, i18n } = useTranslation('translation');
  // Henter det aktive språket ('en', 'no', etc.)
  const currentLang = i18n.language;

  // Viser en enkel loading-state for headeren
  if (status === 'loading') {
     return <header className="bg-[#000311] shadow-md sticky top-0 z-40 h-[72px] animate-pulse"></header>;
  }

  // Funksjon for å bygge full href med språk
  const buildHref = (baseHref: string) => `/${currentLang}${baseHref}`;

  // Lukk både popover og mobilmeny
  const closeAllMenus = (popoverClose?: () => void) => {
      popoverClose?.(); // Lukk popover hvis funksjon finnes
      setMobileMenuOpen(false); // Lukk alltid mobilmeny
  };


  // Rendrer header-elementet
  return (
    <header className="bg-[#000311] shadow-md sticky top-0 z-40">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        {/* Logo-seksjon */}
        <div className="flex lg:flex-1 items-center">
           {/* <<< HJEM-LENKE MED SPRÅK */}
           <Link href={buildHref('/')} className="flex items-center gap-x-4 -m-1.5 p-1.5" onClick={() => closeAllMenus()}>
             <span className="sr-only">{t('header.appName', 'DiskGolf')}</span>
             <span className="font-sans text-2xl font-bold bg-gradient-to-r from-green-600 via-green-300 to-green-600 text-transparent bg-clip-text hidden sm:inline">
                {t('header.appName', 'DiskGolf')}
             </span>
             <Image src="/lightgreen.png" alt={t('header.appNameLogoAlt', 'DiskGolf Logo')} width={32} height={32} priority style={{height: 'auto'}}/>
           </Link>
        </div>

        {/* Knappen for å åpne mobilmenyen */}
        <div className="flex lg:hidden">
          <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500" onClick={() => setMobileMenuOpen(true)}>
            <span className="sr-only">{t('header.openMenu', 'Åpne meny')}</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop-navigasjonslenker */}
        <Popover.Group className="hidden lg:flex lg:gap-x-8">
          {/* Popover for "Baner"-menyen */}
          <Popover className="relative">
             {({ open, close: popoverClose }) => ( // Får tak i popoverClose
                <>
                 {/* Knappen som åpner popover */}
                 <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-white hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#000311] rounded">
                    {t('header.courses', 'Baner')}
                   <ChevronDownIcon className={cn("h-5 w-5 flex-none text-green-400 transition-transform duration-200", open ? 'rotate-180' : '')} aria-hidden="true" />
                 </Popover.Button>
                 {/* Animasjon og innhold i popover */}
                 <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                    <Popover.Panel className="absolute -left-1/2 transform translate-x-1/4 lg:translate-x-0 lg:left-auto lg:right-0 top-full z-20 mt-3 w-screen max-w-md overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5">
                       {/* Lukkeknapp inne i popover */}
                       <button
                          type="button"
                          onClick={popoverClose} // Bruker popoverClose
                          className="absolute top-2 right-2 z-10 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                          aria-label={t('header.closeMenu', 'Lukk meny')}
                       >
                         <span className="sr-only">{t('header.closeMenu', 'Lukk meny')}</span>
                         <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                       </button>
                       {/* Innhold i "Baner"-popover */}
                       <div className="p-4 pt-8">
                          {/* Mapper KUN navLinksBase her */}
                          {navLinksBase.map((item) => (
                             <div key={item.key} className="group relative flex items-center gap-x-4 rounded-lg p-3 text-sm leading-6 hover:bg-gray-50">
                               <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-green-100">
                                 <item.icon className="h-5 w-5 text-green-500 group-hover:text-green-700" aria-hidden="true"/>
                               </div>
                               <div className="flex-auto">
                                 {/* <<< LENKE MED SPRÅK */}
                                 <Link href={buildHref(item.baseHref)} className="block font-semibold text-emerald-700" onClick={() => closeAllMenus(popoverClose)}>
                                    {t(`header.nav.${item.key}.title`, item.name)}
                                    <span className="absolute inset-0" />
                                 </Link>
                                 {/* Viser description KUN hvis den finnes */}
                                 {item.description && (
                                    <p className="mt-1 text-gray-900">{t(`header.nav.${item.key}.desc`, item.description)}</p>
                                 )}
                               </div>
                             </div>
                           ))}
                       </div>
                       {/* CTA-lenker i bunnen av popover */}
                       <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                          {/* Mapper KUN ctaBase her */}
                          {ctaBase.map((item) => (
                            /* <<< LENKE MED SPRÅK */
                            <Link key={item.key} href={buildHref(item.baseHref)} className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100" onClick={() => closeAllMenus(popoverClose)}>
                              <item.icon className="h-5 w-5 flex-none text-green-500" aria-hidden="true" />
                              {t(`header.cta.${item.key}.title`, item.name)}
                            </Link>
                          ))}
                       </div>
                    </Popover.Panel>
                 </Transition>
                </>
             )}
          </Popover>
          {/* Andre hovedlenker for desktop */}
          {/* <<< LENKER MED SPRÅK */}
          {mainLinksBase.map(link => (
            <Link key={link.baseHref} href={buildHref(link.baseHref)} className="text-sm font-semibold leading-6 text-white hover:text-green-400">
              {t(link.labelKey, link.fallbackName)}
            </Link>
          ))}
        </Popover.Group>

        {/* Seksjon for språkvelger og bruker-dropdown på desktop */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center lg:gap-x-4">
          <LanguageSwitcher />
          <UserDropdown isMobile={false} currentUser={currentUser} />
        </div>
      </nav>

      {/* Mobilmeny (Dialog/Sidebar) */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
         <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
           <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#000311] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
             {/* Topplinje i mobilmeny */}
             <div className="flex items-center justify-between">
                {/* <<< HJEM-LENKE MED SPRÅK */}
                <Link href={buildHref('/')} className="-m-1.5 p-1.5" onClick={() => closeAllMenus()}>
                  <span className="sr-only">{t('header.appName', 'DiskGolf')}</span>
                  <Image className="h-8 w-auto" src="/lightgreen.png" alt={t('header.appNameLogoAlt', 'DiskGolf Logo')} width={32} height={32} style={{height: 'auto'}} />
                </Link>
                <LanguageSwitcher />
                <button type="button" className="-m-2.5 rounded-md p-2.5 text-white hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">{t('header.closeMenu', 'Lukk meny')}</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
             </div>
             {/* Hovedinnhold i mobilmeny */}
             <div className="mt-6 flow-root">
               <div className="-my-6 divide-y divide-gray-500/20">
                  {/* Navigasjonslenker */}
                  <div className="space-y-2 py-6">
                    {/* Disclosure for "Baner"-undermeny */}
                    <Disclosure as="div" className="-mx-3">
                      {({ open, close: disclosureClose }) => (
                         <>
                           <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-white hover:bg-green-700/50">
                             {t('header.courses', 'Baner')}
                             <ChevronDownIcon className={cn(open ? 'rotate-180' : '', 'h-5 w-5 flex-none text-green-400 transition-transform duration-200')} aria-hidden="true" />
                           </Disclosure.Button>
                           <Disclosure.Panel className="mt-2 space-y-1">
                              {/* Mapper gjennom BÅDE navLinksBase og ctaBase */}
                              {[...navLinksBase, ...ctaBase].map((item) => (
                                <Disclosure.Button // Disclosure.Button kan være en Link
                                  key={item.key}
                                  as={Link}
                                  // <<< LENKE MED SPRÅK
                                  href={buildHref(item.baseHref)}
                                  className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-300 hover:bg-green-700/50 hover:text-green-300"
                                  // Bruker closeAllMenus her for å lukke alt
                                  onClick={() => closeAllMenus(disclosureClose)}
                                >
                                  {/* Bruker riktig nøkkel for tittelen */}
                                  {item.description ? t(`header.nav.${item.key}.title`, item.name) : t(`header.cta.${item.key}.title`, item.name)}
                                </Disclosure.Button>
                              ))}
                           </Disclosure.Panel>
                         </>
                      )}
                    </Disclosure>
                    {/* Hovedlenker i mobilmenyen */}
                     {/* <<< LENKER MED SPRÅK */}
                     {mainLinksBase.map(link => (
                        <Link
                            key={link.baseHref}
                            href={buildHref(link.baseHref)}
                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-green-700/50 hover:text-green-300"
                            onClick={() => closeAllMenus()}
                        >
                            {t(link.labelKey, link.fallbackName)}
                        </Link>
                     ))}
                  </div>
                  {/* Bruker-seksjon i mobilmenyen */}
                  <div className="py-6">
                    <UserDropdown isMobile={true} currentUser={currentUser} closeMobileMenu={() => setMobileMenuOpen(false)} />
                  </div>
                </div>
              </div>
           </Dialog.Panel>
      </Dialog>
    </header>
  );
}

export default Header;