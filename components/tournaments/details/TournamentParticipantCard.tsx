// Fil: components/tournaments/details/TournamentParticipantCard.tsx
// Formål: Definerer en React-komponent ('use client') som viser en liste over påmeldte deltakere til en turnering.
//         Inkluderer knapper for påmelding og avmelding for den innloggede brukeren, basert på turneringsstatus,
//         tilgjengelige plasser, og om brukeren allerede er påmeldt eller er arrangør.
//         Viser også antall påmeldte (med maksgrense hvis satt), og håndterer loading-tilstander for på/avmelding.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { Button } from '@/components/ui/button';
import { Loader2, LogIn, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { TournamentStatus } from '@prisma/client';

// Definer nødvendige props
interface TournamentParticipantsCardProps {
    tournament: {
        id: string;
        status: TournamentStatus;
        maxParticipants: number | null;
        participants: {
            id: string;
            name: string | null;
        }[];
        _count: {
            participants: number;
        };
        // FJERN organizerId kravet herfra
        // organizerId: string;
    };
    user: { id: string; /* ... */ } | null;
    isOrganizer: boolean; // GÅ TILBAKE til å motta denne som prop
    isParticipant: boolean;
    isRegistrationOpen: boolean;
    isRegistering: boolean;
    isUnregistering: boolean;
    onRegister: () => Promise<void>;
    onUnregister: () => Promise<void>;
}

export function TournamentParticipantsCard({
    tournament,
    user,
    isOrganizer, // Bruk denne propen
    isParticipant,
    isRegistrationOpen,
    isRegistering,
    isUnregistering,
    onRegister,
    onUnregister
}: TournamentParticipantsCardProps) {

    // isOrganizer beregnes nå i parent (TournamentPage)

    // Beregn om bruker kan melde seg på
    const spotsAvailable = !tournament.maxParticipants || tournament._count.participants < tournament.maxParticipants;
    const canRegister = user && !isParticipant && isRegistrationOpen && spotsAvailable; // Viser for alle (inkl. arrangør) hvis ikke påmeldt og mulig

    // Beregn om bruker kan melde seg AV
    const registrationPhaseActive = (tournament.status === TournamentStatus.REGISTRATION_OPEN || tournament.status === TournamentStatus.PLANNING);
    const canUnregister = user && isParticipant && registrationPhaseActive; // Viser for alle (inkl. arrangør) HVIS de er påmeldt og status tillater det

    // --- Resten av komponenten forblir uendret ---
    const isFull = !isParticipant && isRegistrationOpen &&
        tournament.maxParticipants !== null && tournament._count.participants >= tournament.maxParticipants;
    const showRegistrationClosed = !isRegistrationOpen && !canRegister && !canUnregister &&
        tournament.status !== TournamentStatus.IN_PROGRESS &&
        tournament.status !== TournamentStatus.COMPLETED;

    console.log("--- Card Debug (Using isOrganizer Prop) ---");
    console.log("Props:", { userId: user?.id, isOrganizer, isParticipant, isRegistrationOpen, status: tournament.status });
    console.log("Conditions:", { user: !!user, isOrganizer, isParticipant, isRegistrationOpen, spotsAvailable, registrationPhaseActive });
    console.log("Calculated:", { canRegister, canUnregister, isFull, showRegistrationClosed });
    console.log("------------------------------------------");

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 border-b border-gray-200 pb-3">
                 <h2 className="text-xl font-semibold text-gray-800 flex-shrink-0">
                     Påmeldte ({tournament._count.participants}{tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ''})
                 </h2>
                <div className="w-full sm:w-auto flex-shrink-0 text-right space-y-1 sm:space-y-0">
                    {canRegister && (
                        <Button onClick={onRegister} disabled={isRegistering || isUnregistering} size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                            {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                            Meld på {isOrganizer ? '(Arrangør)' : ''}
                        </Button>
                    )}
                    {canUnregister && (
                         <Button onClick={onUnregister} disabled={isRegistering || isUnregistering} size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                            {isUnregistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                            Meld av {isOrganizer ? '(Arrangør)' : ''}
                        </Button>
                    )}
                    {isParticipant && !canUnregister && (
                        <div className="flex items-center justify-end text-sm text-green-700 font-medium bg-green-100 px-3 py-1 rounded-md w-full sm:w-auto">
                            <CheckCircle className="mr-1.5 h-4 w-4" /> Påmeldt {isOrganizer ? '(Arrangør)' : ''}
                        </div>
                    )}
                     {isFull && !canRegister && (
                         <div className="flex items-center justify-end text-sm text-red-700 font-medium bg-red-100 px-3 py-1 rounded-md w-full sm:w-auto">
                             <XCircle className="mr-1.5 h-4 w-4" /> Fulltegnet
                         </div>
                    )}
                    {showRegistrationClosed && (
                         <div className="flex items-center justify-end text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-md w-full sm:w-auto">
                            Påmelding stengt
                         </div>
                    )}
                </div>
            </div>
            {tournament.participants.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                    {tournament.participants.map((player) => (
                        <li key={player.id} className="flex items-center justify-between border-b border-gray-100 pb-1.5 last:border-b-0">
                            <span className="text-gray-800 truncate" title={player.name || `Bruker ${player.id.substring(0, 6)}`}>
                                {player.name || `Bruker ${player.id.substring(0, 6)}`}
                            </span>
                             {player.id === /* tournament.organizerId */ user?.id && isOrganizer && ( // Korrigert sjekk for arrangør
                                <span className="text-xs text-purple-600 font-semibold">(Arrangør)</span>
                             )}
                             {user?.id === player.id && !isOrganizer && (
                                <span className="text-xs text-blue-600 font-semibold">(Deg)</span>
                             )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-4 text-gray-500 text-sm text-center py-4">Ingen påmeldte ennå.</p>
            )}
        </div>
    );
}