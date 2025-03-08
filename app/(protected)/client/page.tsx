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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-1"> {/* Vertikal padding */}
      <div className="w-full max-w-4xl p-4 flex justify-center"> {/* Flex og justify-center for å midtstille */}
        <div className="w-full max-w-2xl"> {/* Justering for å gjøre kortet mindre */}
          <UserInfo label="📱 Client component" user={user} />
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
