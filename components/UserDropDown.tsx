/**
 * Filnavn: UserDropdown.tsx
 * Beskrivelse: Komponent for brukerens dropdown-meny i navbar. Viser avatar eller ikon.
 * Utvikler: Martin Pettersen
 */
"use client";

import { useState, useCallback, Fragment } from "react"; // Fjernet ubrukte: useRef, useEffect
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Menu, Transition } from '@headlessui/react';
import {
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon,
    UserCircleIcon, // Standard brukerikon som fallback
    // Fjernet ubrukte: ArrowLeftOnRectangleIcon, PlusCircleIcon
} from '@heroicons/react/20/solid'; // Eller bruk 'outline' hvis du foretrekker det

import { User } from "@/app/types"; // Sørg for at denne typen er korrekt definert
import { cn } from "@/app/lib/utils"; // For conditional class names
import useLoginModal from "@/app/hooks/useLoginModal"; // Hook for login modal
import useRegisterModal from "@/app/hooks/useRegisterModal"; // Hook for register modal

interface UserDropdownProps {
  isMobile: boolean; // Bestemmer om det er mobil- eller desktop-visning
  currentUser: User | null; // Brukerobjektet (eller null hvis logget ut)
  closeMobileMenu?: () => void; // Funksjon for å lukke mobilmenyen etter klikk
}

function UserDropdown({ isMobile, currentUser, closeMobileMenu }: UserDropdownProps) {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  // Hjelpefunksjon for å lukke mobilmeny og utføre handling
  const handleActionAndCloseMobile = useCallback((action?: () => void) => {
      if (isMobile && closeMobileMenu) {
          closeMobileMenu();
      }
      if (action) {
          action();
      }
  }, [isMobile, closeMobileMenu]);

  // Åpne login modal
  const handleOpenLoginModal = useCallback(() => {
    handleActionAndCloseMobile(() => loginModal.onOpen());
  }, [loginModal, handleActionAndCloseMobile]);

   // Åpne register modal
   const handleOpenRegisterModal = useCallback(() => {
    handleActionAndCloseMobile(() => registerModal.onOpen());
   }, [registerModal, handleActionAndCloseMobile]);

   // Logg ut bruker
   const handleLogout = useCallback(() => {
     handleActionAndCloseMobile(() => {
       // Send bruker til forsiden etter utlogging
       signOut({ callbackUrl: '/' });
     });
   }, [handleActionAndCloseMobile]);

   // Naviger til en intern side
   const handleNavigate = useCallback((path: string) => {
     handleActionAndCloseMobile(() => {
        router.push(path);
     });
   }, [router, handleActionAndCloseMobile]);

   // ---- RENDER LOGIC ----

   if (isMobile) {
       // ----- MOBILVISNING -----
      if (currentUser) {
          // Mobil - Logget inn
          return (
             <div className="border-t border-gray-700 pt-4 pb-3">
               <div className="flex items-center px-5">
                 {/* Container for avatar/ikon */}
                 <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden"> {/* overflow-hidden for sikkerhets skyld */}
                   {currentUser.image ? (
                      // Vis brukerens bilde hvis det finnes
                      <Image
                          className="h-full w-full object-cover" // Bruk object-cover for å fylle pent
                          src={currentUser.image}
                          alt="Brukeravatar"
                          width={40} // Match containerstørrelse
                          height={40}
                          onError={(e) => {
                             // Skjul bildet ved feil, ikonet under vil da vises indirekte
                             e.currentTarget.style.display = 'none';
                             console.error("Mobile Avatar Load Error:", currentUser.image);
                          }}
                          // Unoptimized kan være nyttig for eksterne bilder som endres ofte
                          // unoptimized
                      />
                   ) : (
                      // Vis standard ikon hvis bildet mangler
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                   )}
                 </div>
                 {/* Brukerinfo */}
                 <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">{currentUser.name || 'Bruker'}</div>
                    <div className="text-sm font-medium leading-none text-gray-400">{currentUser.email || ''}</div>
                 </div>
               </div>
               {/* Menyvalg */}
               <div className="mt-3 space-y-1 px-2">
                  <button onClick={() => handleNavigate('/profil')} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Min Profil</button>
                  <button onClick={() => handleNavigate('/innstillinger')} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Innstillinger</button>
                  <button onClick={handleLogout} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Logg ut</button>
               </div>
             </div>
          );
      } else {
          // Mobil - Logget ut
          return (
             <div className="space-y-1 px-2 py-6 border-t border-gray-700"> {/* La til border-top */}
                 <button onClick={handleOpenLoginModal} className="flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500">Logg inn</button>
                 <p className="mt-3 text-center text-sm text-gray-400">
                    Ny her?{' '}
                    <button onClick={handleOpenRegisterModal} className="font-medium text-green-400 hover:text-green-300 focus:outline-none focus:underline">
                       Opprett konto
                    </button>
                 </p>
            </div>
          );
      }

   } else {
     // ----- DESKTOPVISNING -----
      if (currentUser) {
         // Desktop - Logget inn -> VIS AVATAR/IKON DROPDOWN
         // console.log("UserDropdown (Desktop): Rendering logged-in state for:", currentUser.email); // Fjernet for renere logg
         return (
           <Menu as="div" className="relative inline-block text-left">
             <div>
               {/* Trigger-knapp med avatar/ikon og ønsket styling */}
               <Menu.Button className="flex items-center justify-center rounded-full bg-green-600 p-0.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-green-700 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#000311] focus:ring-white h-9 w-9 overflow-hidden"> {/* Litt mindre, justert ring-offset */}
                 <span className="sr-only">Åpne brukermeny</span>
                 {currentUser.image ? (
                    // Vis brukerens bilde
                    <Image
                       className="h-full w-full rounded-full object-cover" // Fyll knappen
                       src={currentUser.image}
                       alt="Brukeravatar"
                       width={32} // Intern størrelse, knappen styrer visuell størrelse
                       height={32}
                       onError={(e) => {
                          // Skjul bildet ved feil, ikonet under vil da vises
                          e.currentTarget.style.display = 'none';
                          console.error("Desktop Avatar Load Error:", currentUser.image);
                       }}
                       // unoptimized
                    />
                 ) : (
                   // Vis standard ikon hvis bildet mangler
                   <UserCircleIcon className="h-7 w-7 text-white" aria-hidden="true" /> // Juster størrelse etter behov
                 )}
               </Menu.Button>
             </div>

             {/* Dropdown-panelet */}
             <Transition
               as={Fragment}
               enter="transition ease-out duration-100"
               enterFrom="transform opacity-0 scale-95"
               enterTo="transform opacity-100 scale-100"
               leave="transition ease-in duration-75"
               leaveFrom="transform opacity-100 scale-100"
               leaveTo="transform opacity-0 scale-95"
             >
               <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                 {/* Brukerinfo i toppen av dropdown */}
                 <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name || 'Bruker'}</p>
                    <p className="text-sm text-gray-500 truncate">{currentUser.email || ''}</p>
                 </div>
                 {/* Menyvalg */}
                 <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (<button onClick={() => handleNavigate('/profil')} className={cn(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex w-full items-center px-4 py-2 text-sm')}><UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" /> Min Profil</button>)}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (<button onClick={() => handleNavigate('/innstillinger')} className={cn(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex w-full items-center px-4 py-2 text-sm')}><Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" /> Innstillinger</button>)}
                    </Menu.Item>
                 </div>
                 {/* Logg ut */}
                 <div className="py-1">
                   <Menu.Item>
                     {({ active }) => (<button onClick={handleLogout} className={cn(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex w-full items-center px-4 py-2 text-sm')}><ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" /> Logg ut</button>)}
                   </Menu.Item>
                 </div>
               </Menu.Items>
             </Transition>
           </Menu>
         );
       } else {
          // Desktop - Logget ut -> VIS "Logg inn" KNAPP
          // console.log("UserDropdown (Desktop): Rendering logged-out state."); // Fjernet for renere logg
          return (
            <button
              onClick={handleOpenLoginModal}
              className="text-sm font-semibold leading-6 text-white hover:text-green-400 transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#000311] focus:ring-white rounded-md px-2 py-1" // Lagt til focus styles og litt padding
            >
              Logg inn <span aria-hidden="true" className="ml-1">→</span> {/* Litt luft før pil */}
            </button>
          );
       }
   }
}

export default UserDropdown;