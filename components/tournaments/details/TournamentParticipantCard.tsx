// components/tournaments/details/TournamentParticipantsCard.tsx
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TournamentStatus } from '@prisma/client'; // Importer status

// Definer nødvendige props
interface TournamentParticipantsCardProps {
    tournament: {
        id: string;
        status: TournamentStatus; // Trenger status her
        maxParticipants: number | null;
        participants: {
            id: string;
            name: string | null;
        }[];
        _count: {
            participants: number;
        };
    };
    user: { id: string; /* ... */ } | null;
    isOrganizer: boolean;
    isParticipant: boolean;
    isRegistrationOpen: boolean; // Send med ferdigberegnet verdi
    isRegistering: boolean; // For knappelasting
    onRegister: () => Promise<void>; // Callback for påmelding
}

export function TournamentParticipantsCard({
    tournament,
    user,
    isOrganizer,
    isParticipant,
    isRegistrationOpen,
    isRegistering,
    onRegister
}: TournamentParticipantsCardProps) {

    // Beregn om bruker kan melde seg på (basert på props)
     const canRegister = user && !isOrganizer && !isParticipant && isRegistrationOpen &&
         (!tournament.maxParticipants || tournament._count.participants < tournament.maxParticipants);

     // Beregn om turneringen er fulltegnet
     const isFull = !isOrganizer && !isParticipant && isRegistrationOpen &&
         tournament.maxParticipants !== null && tournament._count.participants >= tournament.maxParticipants;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-semibold text-gray-800">Påmeldte spillere</h2>
                {/* Påmeldingsknapp */}
                {canRegister && (
                    <Button onClick={onRegister} disabled={isRegistering} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : "Meld på"}
                    </Button>
                )}
                {/* Meldinger */}
                {isParticipant && !isOrganizer && (
                    <span className="text-sm text-green-600 font-medium">✓ Påmeldt</span>
                )}
                {isFull && (
                    <span className="text-sm text-red-600 font-medium">Fulltegnet</span>
                )}
                {/* Viser "Påmelding stengt" hvis registrering ikke er åpen OG bruker ikke er påmeldt OG status ikke er in progress/completed */}
                 {!isRegistrationOpen && !isParticipant &&
                  tournament.status !== TournamentStatus.IN_PROGRESS &&
                  tournament.status !== TournamentStatus.COMPLETED && (
                     <span className="text-sm text-gray-500">Påmelding stengt</span>
                 )}
            </div>

            {/* Deltakerliste */}
            {tournament.participants.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm max-h-60 overflow-y-auto pr-2"> {/* Begrenset høyde og scroll */}
                    {tournament.participants.map((player) => (
                        <li key={player.id} className="flex items-center justify-between border-b border-gray-100 pb-1 last:border-b-0">
                            <span className="text-gray-800 truncate" title={player.name || `Bruker ${player.id.substring(0, 6)}`}>
                                {player.name || `Bruker ${player.id.substring(0, 6)}`}
                            </span>
                            {/* TODO: Knapp for arrangør å fjerne deltaker? */}
                            {/* {isOrganizer && ( <Button variant="ghost" size="sm" className="h-6 px-1 text-red-500 hover:bg-red-50">Fjern</Button> )} */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-4 text-gray-500 text-sm">Ingen påmeldte ennå.</p>
            )}
        </div>
    );
}