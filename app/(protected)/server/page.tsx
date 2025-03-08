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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-1"> {/* Justering av vertikal padding */}
      <div className="w-full max-w-4xl p-4 flex justify-center"> {/* Flex og justify-center for å midtstille */}
        <div className="w-full max-w-2xl"> {/* Justering for å gjøre kortet mindre */}
          <UserInfo label="💻 Server component" user={user} />
        </div>
      </div>
    </div>
  );
};

export default ServerPage;
