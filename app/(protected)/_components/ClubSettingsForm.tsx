// components/ClubSettingsForm.tsx
import { FC } from "react";

interface ClubSettingsFormProps {
  clubSettings: any;
  onSaveChanges: (settings: any) => void;
}

const ClubSettingsForm: FC<ClubSettingsFormProps> = ({ clubSettings, onSaveChanges }) => {
  return (
    <div>
      <h3>Klubbens innstillinger</h3>
      <form onSubmit={(e) => {
        e.preventDefault();
        onSaveChanges(clubSettings);
      }}>
        {/* Klubbinnstillinger feltene her */}
        <input
          value={clubSettings?.name || ""}
          onChange={(e) => onSaveChanges({ ...clubSettings, name: e.target.value })}
          placeholder="Klubbens navn"
        />
        {/* Flere input-felt for andre innstillinger */}
      </form>
    </div>
  );
};

export default ClubSettingsForm;
