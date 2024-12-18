"use client";

import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { navLinks, cta } from "@/components/NavLinks";

function DesktopNav() {
  return (
    <Popover.Group className="hidden lg:flex lg:gap-x-12">
      <Popover className="relative">
        <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-white">
          Baner
          <ChevronDownIcon className="h-5 w-5 flex-none text-white" aria-hidden="true" />
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute bg-white -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl shadow-lg ring-1 ring-gray-900/5">
            <div className="p-4">
              {navLinks.map((item) => (
                <div key={item.name} className="group relative flex items-center gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-gray-200">
                    <item.icon className="h-6 w-6 text-[#013B94] group-hover:text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="flex-auto">
                    <a href={item.href} className="block font-semibold text-[#013B94]">
                      {item.name}
                    </a>
                    <p className="mt-1 text-[#013B94]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
              {cta.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-[#013B94] hover:bg-gray-100"
                >
                  <item.icon className="h-5 w-5 text-[#013B94]" aria-hidden="true" />
                  {item.name}
                </a>
              ))}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
      <a href="#" className="text-sm font-semibold leading-6 text-white">
        Nyheter
      </a>
      <a href="#" className="text-sm font-semibold leading-6 text-white">
        Klubber
      </a>
      <a href="#" className="text-sm font-semibold leading-6 text-white">
        Turneringer
      </a>
      <a href="#" className="text-sm font-semibold leading-6 text-white">
        Kontakt oss
      </a>
    </Popover.Group>
  );
}

export default DesktopNav;
