"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { leaveClub } from "@/app/actions/leave-club";

// Server Action import
  // Sørg for at du har importert riktig

interface Club {
  id: string;
  name: string;
  location: string;
  isPrimary: boolean;
}

const UserClubsList = ({ onEditClub }: { onEditClub: (club: Club) => void }) => {
  const { data: session, status } = useSession();  // Destructure session and status
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // Fetch the clubs the user is a member of
      fetch(`/api/user-clubs?userId=${session.user.id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else {
            setUserClubs(data.clubs);
          }
        })
        .catch((error) => {
          toast.error("Noe gikk galt med å hente klubber.");
          console.error("Feil:", error);
        })
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      toast.error("Du er ikke autentisert!");
      setLoading(false);  // Stop loading if unauthenticated
    }
  }, [session?.user?.id, status]);  // Run the effect when session data changes

  const handleSetPrimaryClub = async (clubId: string) => {
    if (!session?.user?.id) {
      toast.error("Du er ikke autentisert!");
      return;
    }
    try {
      const response = await fetch(`/api/user-clubs?userId=${session.user.id}&clubId=${clubId}&action=setPrimary`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.success);
        setUserClubs((prevClubs) =>
          prevClubs.map((club) =>
            club.id === clubId ? { ...club, isPrimary: true } : { ...club, isPrimary: false }
          )
        );
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt, prøv igjen senere.");
      console.error("Feil:", error);
    }
  };

  const handleRemovePrimaryClub = async (clubId: string) => {
    if (!session?.user?.id) {
      toast.error("Du er ikke autentisert!");
      return;
    }
    try {
      const response = await fetch(`/api/user-clubs?userId=${session.user.id}&clubId=${clubId}&action=removePrimary`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.success);
        setUserClubs((prevClubs) =>
          prevClubs.map((club) => (club.id === clubId ? { ...club, isPrimary: false } : club))
        );
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt, prøv igjen senere.");
      console.error("Feil:", error);
    }
  };

  const handleLeaveClub = async (clubId: string) => {
    if (!session?.user?.id) {
      toast.error("Du er ikke autentisert!");
      return;
    }
    try {
      const data = await leaveClub({
        userId: session.user.id,
        clubId: clubId,
      });
      if (data.success) {
        toast.success(data.success);
        setUserClubs((prevClubs) => prevClubs.filter((club) => club.id !== clubId));
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt, prøv igjen senere.");
      console.error("Feil:", error);
    }
  };

  const handleEditClub = (club: Club) => {
    onEditClub(club); // Send selected club to ClubSettingsPage for editing
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Klubbene du er medlem av:</h3>
      {userClubs.length === 0 ? (
        <p>Du er ikke medlem av noen klubb ennå.</p>
      ) : (
        <ul className="space-y-4">
          {userClubs.map((club) => (
            <li key={club.id} className="border-b p-2 flex justify-between items-center">
              <div>
                <strong>{club.name}</strong> - {club.location}
              </div>
              <div className="space-x-4">
                {club.isPrimary ? (
                  <>
                    <span className="text-green-500">Primærklubb</span>
                    <Button size="sm" onClick={() => handleRemovePrimaryClub(club.id)}>
                      Fjern som primærklubb
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => handleSetPrimaryClub(club.id)}>
                    Velg som primærklubb
                  </Button>
                )}
                <Button size="sm" onClick={() => handleEditClub(club)}>
                  Rediger
                </Button>
                <Button size="sm" onClick={() => handleLeaveClub(club.id)} className="bg-red-500">
                  Forlat klubb
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserClubsList;
