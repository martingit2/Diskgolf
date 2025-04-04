/**
 * Filnavn: Header.tsx (Hoved-navbar)
 * Beskrivelse: Navigasjonskomponent for DiskGolf-applikasjonen. Bruker useSession for brukerdata.
 *              Inkluderer lukkeknapp for desktop Popover.
 * Utvikler: Martin Pettersen
 */
'use client';

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useState, Fragment } from 'react';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  SunIcon,
  EnvelopeIcon,
  StarIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassCircleIcon,
} from '@heroicons/react/20/solid';
import { cn } from '@/app/lib/utils';
import UserDropdown from './UserDropDown'; // Sjekk filnavn
import { useSession } from "next-auth/react";
import { User } from '@/app/types';

// Definer navLinks og cta
const navLinks = [
    { name: 'Finn bane', description: 'Søk etter tilgjengelige baner.', href: '/baner', icon: MagnifyingGlassCircleIcon },
    { name: 'Mest populære', description: 'De mest populære banene.', href: '/baner?sortBy=popular', icon: StarIcon },
    { name: 'Rapporter feil', description: 'Gi beskjed om feil.', href: '/rapporter-feil', icon: ExclamationTriangleIcon },
];
const cta = [
    { name: 'Vis vær', href: '/weather', icon: SunIcon },
    { name: 'Kontakt oss', href: '/kontakt', icon: EnvelopeIcon },
];

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const currentUser = session?.user as User | null ?? null;

  if (status === 'loading') {
     return <header className="bg-[#000311] shadow-md sticky top-0 z-40 h-[72px] animate-pulse"></header>;
  }

  return (
    <header className="bg-[#000311] shadow-md sticky top-0 z-40">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1 items-center">
           <Link href="/" className="flex items-center gap-x-2 -m-1.5 p-1.5" onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}>
             <span className="sr-only">DiskGolf</span>
             {/* Teksten kommer FØRST */}
             <span className="font-sans text-2xl font-bold bg-gradient-to-r from-green-600 via-green-300 to-green-600 text-transparent bg-clip-text hidden sm:inline">DiskGolf</span>
             {/* Bildet kommer ETTER */}
             <Image src="/lightgreen.png" alt="DiskGolf Logo" width={35} height={35} priority style={{height: 'auto'}}/>
           </Link>
        </div>

        {/* Mobilmeny-knapp */}
        <div className="flex lg:hidden">
          <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-green-400 hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500" onClick={() => setMobileMenuOpen(true)}>
            <span className="sr-only">Åpne meny</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop-navigasjon */}
        <Popover.Group className="hidden lg:flex lg:gap-x-8">
          {/* Baner Popover */}
          <Popover className="relative">
             {({ open, close }) => (
                <>
                 <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-white hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#000311] rounded">
                   Baner
                   <ChevronDownIcon className={cn("h-5 w-5 flex-none text-green-400 transition-transform duration-200", open ? 'rotate-180' : '')} aria-hidden="true" />
                 </Popover.Button>
                 <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                    <Popover.Panel className="absolute -left-1/2 transform translate-x-1/4 lg:translate-x-0 lg:left-auto lg:right-0 top-full z-20 mt-3 w-screen max-w-md overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5">
                       <button
                          type="button"
                          onClick={close}
                          className="absolute top-2 right-2 z-10 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                          aria-label="Lukk meny"
                       >
                         <span className="sr-only">Lukk meny</span>
                         <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                       </button>
                       <div className="p-4 pt-8">
                          {navLinks.map((item) => (
                             <div key={item.name} className="group relative flex items-center gap-x-4 rounded-lg p-3 text-sm leading-6 hover:bg-gray-50">
                               <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-green-100">
                                 <item.icon className="h-5 w-5 text-green-600 group-hover:text-green-700" aria-hidden="true"/>
                               </div>
                               <div className="flex-auto">
                                 <Link href={item.href} className="block font-semibold text-emerald-800" onClick={close}>
                                    {item.name}
                                    <span className="absolute inset-0" /> {/* Forbedrer klikkområde */}
                                 </Link>
                                 <p className="mt-1 text-emerald-800">{item.description}</p>
                               </div>
                             </div>
                           ))}
                       </div>
                       <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                          {cta.map((item) => (
                            <Link key={item.name} href={item.href} className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100" onClick={close}>
                              <item.icon className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
                              {item.name}
                            </Link>
                          ))}
                       </div>
                    </Popover.Panel>
                 </Transition>
                </>
             )}
          </Popover>
          {/* Andre Desktop-linker */}
          <Link href="/nyheter" className="text-sm font-semibold leading-6 text-white hover:text-green-400">Nyheter</Link>
          <Link href="/spill" className="text-sm font-semibold leading-6 text-white hover:text-green-400">Banespill</Link>
          <Link href="/turneringer" className="text-sm font-semibold leading-6 text-white hover:text-green-400">Turneringer</Link>
          <Link href="/klubber" className="text-sm font-semibold leading-6 text-white hover:text-green-400">Klubber</Link>
        </Popover.Group>

        {/* Bruker-dropdown (Desktop) */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center">
          <UserDropdown isMobile={false} currentUser={currentUser} />
        </div>
      </nav>

      {/* Mobilmeny Dialog */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
         <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
           <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#000311] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
             <div className="flex items-center justify-between">
                {/* Mobil logo - holder rekkefølge (ofte bare ikon) */}
                <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">DiscGolf</span>
                  <Image className="h-8 w-auto" src="/lightgreen.png" alt="DiskGolf Logo" width={32} height={32} style={{height: 'auto'}} />
                </Link>
                <button type="button" className="-m-2.5 rounded-md p-2.5 text-green-400 hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">Lukk meny</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
             </div>
             <div className="mt-6 flow-root">
               <div className="-my-6 divide-y divide-gray-500/20">
                  <div className="space-y-2 py-6">
                    <Disclosure as="div" className="-mx-3">
                      {({ open, close: disclosureClose }) => (
                         <>
                           <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-white hover:bg-green-700/50">
                             Baner
                             <ChevronDownIcon className={cn(open ? 'rotate-180' : '', 'h-5 w-5 flex-none text-green-400 transition-transform duration-200')} aria-hidden="true" />
                           </Disclosure.Button>
                           <Disclosure.Panel className="mt-2 space-y-1">
                              {[...navLinks, ...cta].map((item) => (
                                <Disclosure.Button
                                  key={item.name}
                                  as={Link}
                                  href={item.href}
                                  className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-300 hover:bg-green-700/50 hover:text-green-300"
                                  onClick={() => {
                                      disclosureClose();
                                      setMobileMenuOpen(false);
                                  }}
                                >
                                  {item.name}
                                </Disclosure.Button>
                              ))}
                           </Disclosure.Panel>
                         </>
                      )}
                    </Disclosure>
                     <Link href="/nyheter" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-green-700/50 hover:text-green-300" onClick={() => setMobileMenuOpen(false)}>Nyheter</Link>
                     <Link href="/spill" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-green-700/50 hover:text-green-300" onClick={() => setMobileMenuOpen(false)}>Banespill</Link>
                     <Link href="/turneringer" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-green-700/50 hover:text-green-300" onClick={() => setMobileMenuOpen(false)}>Turneringer</Link>
                     <Link href="/klubber" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-green-700/50 hover:text-green-300" onClick={() => setMobileMenuOpen(false)}>Klubber</Link>
                  </div>
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