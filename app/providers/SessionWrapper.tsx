/** 
 * Filnavn: SessionWrapper.tsx
 * Beskrivelse: Wrapper-komponent for å levere NextAuth-sesjon til applikasjonen.
 * Sørger for at sesjonsdata er tilgjengelig i hele React-applikasjonen via Context API.
 * Utvikler: Martin Pettersen
 */

"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";


export default function SessionWrapper({
    children,
    session,
  }: {
    children: React.ReactNode;
    session: Session | null;
  }) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
  }
  
