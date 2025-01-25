/**
 * Filnavn: ClientPage.tsx
 * Beskrivelse: Sidekomponent for å vise brukerinfo ved hjelp av en klientkomponent.
 * Utvikler: Martin Pettersen
 */

'use client';

import { useCurrentUser } from '@/app/hooks/use-current-user';
import { UserInfo } from '@/components/user-info';

/**
 * ClientPage-komponenten viser informasjon om den nåværende brukeren
 * ved hjelp av en klient-side React-komponent.
 *
 * @component
 * @author Martin Pettersen
 */
const ClientPage = () => {
  // Henter informasjon om den nåværende brukeren ved hjelp av en tilpasset hook.
  const user = useCurrentUser();

  return <UserInfo label="📱 Client component" user={user} />;
};

export default ClientPage;
