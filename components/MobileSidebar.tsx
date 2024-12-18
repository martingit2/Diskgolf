

/* Denne må oppdateres for å fungere alt står nå bare i Header.tsx
 * Vi ønsker å bruke disse pga de er gjenbrukbare komponenter og gjør det mer oversiktlig å lese kode
 * om vi ser i Header.tsx er det veldig langt derfor bruker vi mindre komponenter for å gjøre ting lettere å forstå og utvikle
 * men disse er ikke oppdatert per nå, så ligger her. Men dette må fikses.
 */




import { Dialog, Disclosure } from "@headlessui/react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { navLinks, cta } from "@/components/NavLinks";

// Definer typene for props
interface MobileSidebarProps {
  open: boolean; // State for å indikere om menyen er åpen
  onClose: () => void; // Funksjon for å lukke menyen
}

function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <Dialog as="div" className="lg:hidden" open={open} onClose={onClose}>
      <div className="fixed inset-0 z-10 bg-black bg-opacity-25" />
      <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-[#000311] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        <div className="flex items-center justify-between">
          <a href="#" className="-m-1.5 p-1.5">
            <img className="h-8 w-auto" src="/logogreen.png" alt="DiscGolf" />
          </a>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-white"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <Disclosure as="div">
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-white hover:bg-blue-800">
                  Baner
                  <ChevronDownIcon className={`h-5 w-5 flex-none ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                </Disclosure.Button>
                <Disclosure.Panel>
                  {[...navLinks, ...cta].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block rounded-lg py-2 pl-6 text-sm font-semibold leading-7 text-white hover:bg-blue-800"
                    >
                      {item.name}
                    </a>
                  ))}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

export default MobileSidebar;
