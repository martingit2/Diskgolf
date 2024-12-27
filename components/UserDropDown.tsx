"use client";
/**  Burde sikkert fikse denne bedre, var vanskelig å få til å funke er sikkert en enklere måte
* Vi bruker feks ikke dashboard akkurat nå men vettafan om vi skal bruke det senere.
* Lar det bare stå per nå, så ser vi senere hva vi gjør med dette.
*/

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusCircleIcon,
  UserIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/20/solid";
import { cn } from "@/app/lib/utils";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type User = {
  name: string;
  email: string;
};

function UserDropdown({
  isMobile,
  currentUser,
}: {
  isMobile: boolean;
  currentUser: User | null;
}) {
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dialogState, setDialogState] = useState<{
    login: boolean;
    register: boolean;
  }>({
    login: false,
    register: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openDialog = (dialog: "login" | "register") => {
    setDialogState((prev) => ({
      ...prev,
      [dialog]: true,
    }));
  };

  const closeDialog = (dialog: "login" | "register") => {
    setDialogState((prev) => ({
      ...prev,
      [dialog]: false,
    }));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`relative ${isMobile ? "w-full" : "inline-block text-left"}`}
    >
      <button
        onClick={toggleDropdown}
        className={cn(
          "inline-flex justify-center items-center gap-2 w-full rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
          isMobile
            ? "bg-green-700 text-white hover:bg-green-600"
            : "bg-green-700 hover:bg-green-600"
        )}
      >
        <UserIcon className="h-5 w-5" />
        {currentUser ? currentUser.name : "Konto"}
        <ChevronDownIcon
          className="ml-2 -mr-1 h-5 w-5 text-white"
          aria-hidden="true"
        />
      </button>
      {isDropdownOpen && (
        <div
          className={cn(
            "mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            isMobile ? "absolute left-0 w-full" : "absolute right-0 w-56"
          )}
        >
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700">
              {currentUser ? `Hei, ${currentUser.name}` : "Velg handling"}
            </p>
          </div>
          <div className="py-1">
            {currentUser ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="group flex w-full items-center px-4 py-2 text-sm text-gray-900 hover:bg-blue-100 hover:text-blue-700"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => openDialog("login")}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-900 hover:bg-blue-100 hover:text-blue-700"
                >
                  <ArrowRightIcon
                    className="mr-3 h-5 w-5"
                    aria-hidden="true"
                  />
                  Logg inn
                </button>
                <button
                  onClick={() => openDialog("register")}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-900 hover:bg-green-100 hover:text-green-700"
                >
                  <PlusCircleIcon
                    className="mr-3 h-5 w-5"
                    aria-hidden="true"
                  />
                  Opprett bruker
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Login Dialog */}
      <Dialog
        open={dialogState.login}
        onOpenChange={(open) => {
          if (!open) closeDialog("login");
        }}
      >
        <DialogContent className="p-0 w-auto bg-transparent border-none">
          <DialogTitle className="sr-only">Logg inn</DialogTitle>
          <LoginForm />
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog
        open={dialogState.register}
        onOpenChange={(open) => {
          if (!open) closeDialog("register");
        }}
      >
        <DialogContent className="p-0 w-auto bg-transparent border-none">
          <DialogTitle className="sr-only">Opprett bruker</DialogTitle>
          <RegisterForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserDropdown;
