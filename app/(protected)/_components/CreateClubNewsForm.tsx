"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

// Legg til clubId som prop for CreateClubNewsForm
interface CreateClubNewsFormProps {
  clubId: string; // clubId skal være en prop
}

const CreateClubNewsForm: React.FC<CreateClubNewsFormProps> = ({ clubId }) => {
  const { data: session, status } = useSession(); // Get session data for user
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]); // For storing the clubs the user belongs to
  const [selectedClubId, setSelectedClubId] = useState<string>(clubId || ""); // Set default to clubId passed as prop
  const [image, setImage] = useState<File | null>(null); // Declare image state

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;  // Get the user ID from session

      const fetchClubs = async () => {
        try {
          const response = await fetch(`/api/user-clubs?userId=${userId}`);
          const data = await response.json();
          if (response.ok) {
            setClubs(data.clubs);  // Store the clubs data
            // If a primary club exists, set it as selected
            const primaryClub = data.clubs.find((club: any) => club.isPrimary);
            if (primaryClub) {
              setSelectedClubId(primaryClub.id); // Automatically select the primary club
            }
          } else {
            toast.error(data.error || "Kunne ikke hente klubber.");
          }
        } catch (error) {
          console.error("Feil ved henting av klubber:", error);
          toast.error("Noe gikk galt med å hente klubbene.");
        }
      };

      fetchClubs();
    } else if (status === "unauthenticated") {
      toast.error("Du er ikke autentisert!");
    }
  }, [status, session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !selectedClubId) {
      toast.error("Vennligst fyll ut tittel, innhold og velg en klubb.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("clubId", selectedClubId);  // Send the selected clubId
      formData.append("title", title);
      formData.append("content", content);

      if (image) {
        formData.append("image", image);  // Append image if selected
      }

      const response = await fetch("/api/create-club-news", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Noe gikk galt med å opprette nyheten.");
      }

      toast.success("Nyhet opprettet!");
      setTitle("");
      setContent("");
      setSelectedClubId(""); // Reset club selection after successful submission
    } catch (error) {
      console.error(error);
      toast.error("Kunne ikke opprette nyheten. Vennligst prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Skriv Nyhet for din klubb</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="club" className="block text-sm font-medium text-gray-700">Velg Klubb</label>
          <select
            id="club"
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Velg en klubb</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tittel</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            placeholder="Tittel på nyheten"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Innhold</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            placeholder="Innholdet til nyheten"
            rows={6}
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Last opp bilde</label>
          <input
            id="image"
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImage(e.target.files[0]); // Set the selected image
              }
            }}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-green-600 text-white p-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Laster..." : "Legg til nyhet"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateClubNewsForm;
