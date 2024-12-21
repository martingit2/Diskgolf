"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  UserIcon,
  ArrowRightIcon,
  PlusCircleIcon,
} from "@heroicons/react/20/solid";
import { cn } from "@/app/lib/utils";
import useRegisterModal from "@/app/hooks/useRegisterModal"; // Hook for RegisterModal
import useLoginModal from "@/app/hooks/useLoginModal"; // Hook for LoginModal

function UserDropdown({ isMobile }: { isMobile: boolean }) {
  const registerModal = useRegisterModal(); // Hook for å åpne RegisterModal
  const loginModal = useLoginModal(); // Hook for å åpne LoginModal

  return (
    <Menu
      as="div"
      className={`relative ${isMobile ? "w-full" : "inline-block text-left"}`}
    >
      <Menu.Button
        className={cn(
          "inline-flex justify-center items-center gap-2 w-full rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
          isMobile
            ? "bg-green-700 text-white hover:bg-green-600"
            : "bg-green-700 hover:bg-green-600"
        )}
      >
        <UserIcon className="h-5 w-5" />
        Konto
        <ChevronDownIcon
          className="ml-2 -mr-1 h-5 w-5 text-white"
          aria-hidden="true"
        />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            "mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            isMobile ? "absolute left-0 w-full" : "absolute right-0 w-56"
          )}
        >
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700">Velg handling</p>
          </div>
          <div className="py-1">
            {/* Logg inn-knappen */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={loginModal.onOpen} // Åpner LoginModal
                  className={cn(
                    active ? "bg-blue-100 text-blue-700" : "text-gray-900",
                    "group flex w-full items-center px-4 py-2 text-sm"
                  )}
                >
                  <ArrowRightIcon
                    className="mr-3 h-5 w-5"
                    aria-hidden="true"
                  />
                  Logg inn
                </button>
              )}
            </Menu.Item>
            {/* Opprett bruker-knappen */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={registerModal.onOpen} // Åpner RegisterModal
                  className={cn(
                    active ? "bg-green-100 text-green-700" : "text-gray-900",
                    "group flex w-full items-center px-4 py-2 text-sm"
                  )}
                >
                  <PlusCircleIcon
                    className="mr-3 h-5 w-5"
                    aria-hidden="true"
                  />
                  Opprett bruker
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default UserDropdown;
