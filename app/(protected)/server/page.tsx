/**
 * Filnavn: ServerPage.tsx
 * Beskrivelse: Sidekomponent for å vise brukerinfo ved hjelp av en serverkomponent.
 * Utvikler: Martin Pettersen
 */

import { currentUser } from '@/app/lib/auth';
import { UserInfo } from '@/components/user-info';

/**
 * ServerPage-komponenten henter brukerdata på serversiden
 * og viser informasjon via UserInfo-komponenten.
 *
 * @async
 * @component
 * @author Martin Pettersen
 */
const ServerPage = async () => {
  // Henter nåværende brukerdata asynkront fra autentiseringsbiblioteket.
  const user = await currentUser();

  return <UserInfo label="💻 Server component" user={user} />;
};

export default ServerPage;
