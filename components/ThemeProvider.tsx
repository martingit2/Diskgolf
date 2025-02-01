/** 
 * Filnavn: ThemeProvider.tsx
 * Beskrivelse: En tematilpasset provider-komponent som muliggjør mørk/lys modus ved hjelp av next-themes.
 *              Konfigurerer standardtema og støtter systemets foretrukne tema.
 * Utvikler: Said Hussain Khawajazada
 */


"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
}: {
  children: ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: string;
  enableSystem?: boolean;
}) {
  return (
    <NextThemesProvider
      attribute={attribute} // This ensures the type matches
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
