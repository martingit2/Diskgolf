"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href: string;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export const BackButton = ({ href, label, onClick }: BackButtonProps) => {
  return (
    <Button
      variant="link"
      className="font-normal w-full"
      size="sm"
      asChild
    >
      <Link
        href={href}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault(); // Hindrer standard navigasjon hvis onClick er definert
            onClick(e);
          }
        }}
      >
        {label}
      </Link>
    </Button>
  );
};
