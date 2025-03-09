"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";

interface ClubSettingsFormProps {
  clubSettings: any;
  onSaveChanges: (settings: any, logoFile: File | null) => void;
}

const ClubSettingsForm: FC<ClubSettingsFormProps> = ({ clubSettings, onSaveChanges }) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [updatedSettings, setUpdatedSettings] = useState(clubSettings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedSettings({ ...updatedSettings, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setLogoFile(file);
      setUpdatedSettings({ ...updatedSettings, logoUrl: file.name }); // Filnavn for logoen
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveChanges(updatedSettings, logoFile); // Send begge: innstillinger og fil til serveren
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Rediger {clubSettings?.name}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block">Klubbens navn</label>
          <input
            type="text"
            id="name"
            name="name"
            value={updatedSettings?.name || ""}
            onChange={handleChange}
            placeholder="Klubbens navn"
            className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="address" className="block">Adresse</label>
          <input
            type="text"
            id="address"
            name="address"
            value={updatedSettings?.address || ""}
            onChange={handleChange}
            placeholder="Klubbens adresse"
            className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="phone" className="block">Telefonnummer</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={updatedSettings?.phone || ""}
            onChange={handleChange}
            placeholder="Telefonnummer"
            className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="postalCode" className="block">Postnummer</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={updatedSettings?.postalCode || ""}
            onChange={handleChange}
            placeholder="Postnummer"
            className="input w-full mt-2 p-2 rounded-lg border border-gray-300"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="logoUrl" className="block">Logo (valgfritt)</label>
          <input
            type="file"
            id="logoUrl"
            name="logoUrl"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2 p-2 rounded-lg border border-gray-300"
          />
          {logoFile && (
            <div className="mt-2">
              <strong>Lastet opp fil:</strong> {logoFile.name}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button type="submit">Lagre endringer</Button>
        </div>
      </form>
    </div>
  );
};

export default ClubSettingsForm;
