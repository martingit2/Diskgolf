// Fil: components/tournaments/details/TournamentAdminPanel.tsx
// Formål: Definerer en React-komponent for et administrasjonspanel spesifikt for turneringsarrangører.
//         Tillater endring av turneringsstatus (via en Select-komponent) og oppstart av første spillrunde (eller navigering til lobby hvis den eksisterer).
//         Håndterer visning av ulike knapper og informasjon basert på turneringsstatus og aktiv spilløkt, samt loading states for statusoppdateringer og rundoppstart.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, ExternalLink, Settings } from 'lucide-react';
import { TournamentStatus } from '@prisma/client';

// Definer nødvendige props
interface TournamentAdminPanelProps {
    tournament: {
        id: string;
        status: TournamentStatus;
    };
    isOrganizer: boolean; // Teknisk sett overflødig siden panelet kun vises for arrangør, men greit for tydelighet
    isUpdatingStatus: boolean;
    activeSessionId: string | null;
    isLoadingSessionId: boolean;
    isStartingRound: boolean;
    onStatusUpdate: (newStatus: TournamentStatus) => Promise<void>;
    onStartRound: () => Promise<void>;
}

export function TournamentAdminPanel({
    tournament,
    isOrganizer, // Selv om vi sjekker utenfor, kan det være nyttig internt
    isUpdatingStatus,
    activeSessionId,
    isLoadingSessionId,
    isStartingRound,
    onStatusUpdate,
    onStartRound
}: TournamentAdminPanelProps) {

    // Bør ikke rendere hvis ikke isOrganizer, men ekstra sjekk skader ikke
    if (!isOrganizer) return null;

    const isInProgress = tournament.status === TournamentStatus.IN_PROGRESS;

    return (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 border-b border-gray-200 pb-2 text-gray-800">
                <Settings className="inline-block mr-2 h-5 w-5 align-text-bottom" /> Administrasjon
            </h2>
            <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-4 items-center">
                {/* Statusvelger */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="statusSelect" className="text-sm font-medium text-gray-700 whitespace-nowrap">Endre status:</label>
                    <Select
                        value={tournament.status}
                        onValueChange={(value) => onStatusUpdate(value as TournamentStatus)}
                        disabled={isUpdatingStatus}
                    >
                        <SelectTrigger id="statusSelect" className="flex-grow min-w-[180px] bg-white border-gray-300" disabled={isUpdatingStatus}>
                            <SelectValue placeholder="Velg status" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(TournamentStatus).map(s => (
                                <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin text-gray-500 flex-shrink-0" />}
                </div>

                {/* Start Runde / Gå til Lobby Knapper */}
                {/* Vises kun hvis status er IN_PROGRESS */}
                 {isInProgress && !activeSessionId && (
                     <Button
                         onClick={onStartRound}
                         disabled={isStartingRound || isLoadingSessionId}
                         variant="secondary"
                         className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black"
                     >
                         {isStartingRound ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                         {isStartingRound ? 'Starter...' : 'Start Runde 1'}
                     </Button>
                 )}
                 {isInProgress && activeSessionId && (
                      <Link href={`/turnerings-spill/${activeSessionId}/lobby`} className="w-full sm:w-auto">
                          <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100">
                              <ExternalLink className="mr-2 h-4 w-4" /> Gå til Spillobby
                          </Button>
                      </Link>
                 )}
            </div>

            {/* Info om status/spill */}
             <div className="mt-3 text-xs text-gray-500">
                 {isInProgress && isLoadingSessionId && <p>Sjekker spillstatus...</p>}
                 {isInProgress && !activeSessionId && !isLoadingSessionId && <p>Klikk "Start Runde" for å la deltakere gå til spillobbyen.</p>}
                 {isInProgress && activeSessionId && <p className="text-green-600">Spillobbyen er klar. Deltakere kan nå bli med.</p>}
             </div>
        </div>
    );
}