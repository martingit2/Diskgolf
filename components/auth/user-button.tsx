"use client";

import { FaSignOutAlt, FaUser } from "react-icons/fa";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { LogoutButton } from "./logout-button";
import { useCurrentUser } from "@/app/hooks/use-current-user";

export const UserButton = () => {
  const user = useCurrentUser();

  return (
    <DropdownMenu.Root>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-sky-500">
            <FaUser className="text-white" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <LogoutButton>
          <DropdownMenuItem>
            <FaSignOutAlt className="h-4 w-4 mr-2" />
            Logg ut
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu.Root>
  );
};
