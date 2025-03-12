"use client";

import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useState } from "react";

interface ProfileAvatarProps {
  imageUrl: string;
  onChange: (url: string) => void;
  onDelete: () => void;
  userId: string; // Legg til bruker-ID for å slette i databasen
}

export default function ProfileAvatar({
  imageUrl,
  onChange,
  onDelete,
  userId,
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);

  // Funksjon for opplasting av bilde til API-ruten /api/upload
  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Kunne ikke laste opp bildet.");
      }
      const data = await res.json();
      return data.secure_url;
    } catch (err: any) {
      console.error("Feil ved bildeopplasting:", err);
      toast.error(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Håndter når en fil er valgt
  const onSelectImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    const uploadedUrl = await handleImageUpload(file);
    if (uploadedUrl) {
      onChange(uploadedUrl);
      toast.success("Profilbilde lastet opp!");
    }
  };

  // Funksjon for å slette bildet
  const onDeleteImage = async () => {
    if (!imageUrl) return;
    try {
      // Utled public_id fra URL-en
      const parts = imageUrl.split("/");
      const fileWithExt = parts[parts.length - 1]; // f.eks. "file_grkjth.jpg"
      const publicId = `discgolf/courses/${fileWithExt.split(".")[0]}`;
  
      // Sjekk at public_id er riktig
      console.log("Public ID:", publicId);
  
      // Slett bilde fra Cloudinary
      const resCloudinary = await fetch("/api/delete-picture", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      });
      if (!resCloudinary.ok) {
        const errorData = await resCloudinary.json();
        throw new Error(errorData.error || "Kunne ikke slette bildet fra Cloudinary");
      }
  
      // Slett bilde fra databasen
      const resDB = await fetch("/api/delete-profile-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!resDB.ok) {
        const errorData = await resDB.json();
        throw new Error(errorData.error || "Kunne ikke slette bildet fra databasen");
      }
  
      toast.success("Profilbilde slettet!");
      onDelete(); // Oppdater state slik at bildet fjernes fra skjermen
    } catch (err: any) {
      console.error("Feil ved sletting av bilde:", err);
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {imageUrl && imageUrl.trim() !== "" ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Profilbilde"
            className="w-32 h-32 object-cover rounded-full border shadow-md"
          />
          <button
            type="button"
            onClick={onDeleteImage}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          Ingen bilde
        </div>
      )}
      <div className="mt-2">
        <Input
          type="file"
          accept="image/*"
          onChange={onSelectImageFile}
          className="cursor-pointer"
          disabled={uploading}
        />
      </div>
    </div>
  );
}
