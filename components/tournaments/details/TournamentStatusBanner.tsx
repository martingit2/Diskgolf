// components/tournaments/details/TournamentStatusBanner.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, Play, ExternalLink } from 'lucide-react';

// Definer nødvendige props
interface User { id: string; /* ... andre felter ... */} // Minimum user type
interface TournamentStatusBannerProps {
    // tournament: any; // Send med hele hvis du trenger mer info, ellers bare status?
    user: User | null;
    isOrganizer: boolean;
    isParticipant: boolean;
    activeSessionId: string | null;
    isLoadingSessionId: boolean;
    isStartingRound: boolean;
    onStartRound: () => Promise<void>; // Callback for å starte runde
}

export function TournamentStatusBanner({
    user,
    isOrganizer,
    isParticipant,
    activeSessionId,
    isLoadingSessionId,
    isStartingRound,
    onStartRound
}: TournamentStatusBannerProps) {
    // Ikke vis noe hvis bruker ikke er logget inn eller verken deltaker/arrangør
    // (eller tilpass logikken hvis f.eks. tilskuere skal se noe)
    // if (!user || (!isOrganizer && !isParticipant)) {
    //     return null;
    // }

    // Bestem farge/tekst basert på status
    const bannerBg = activeSessionId ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200';
    const textColor = activeSessionId ? 'text-green-800' : 'text-yellow-800';
    const spinnerColor = activeSessionId ? 'text-green-600' : 'text-yellow-600';
    const statusText = isLoadingSessionId ? 'Sjekker spillstatus...' :
                       activeSessionId ? 'Turneringen pågår!' : 'Turneringen pågår! Venter på at spillet skal klargjøres...';

    return (
        <div className={`my-5 p-4 rounded-lg border ${bannerBg}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className='flex items-center'>
                    {isLoadingSessionId ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin text-gray-500" />
                    ) : (
                        <Loader2 className={`h-5 w-5 mr-2 animate-spin ${spinnerColor}`} />
                    )}
                    <p className={`font-medium ${textColor}`}>
                        {statusText}
                    </p>
                </div>

                {/* Knapper */}
                <div className="w-full sm:w-auto">
                    {activeSessionId ? (
                        // Sesjon er aktiv - knapp for deltakere
                         isParticipant || isOrganizer ? ( // Både deltaker og arrangør kan gå til lobby
                            <Link href={`/turnerings-spill/${activeSessionId}/lobby`} className="block">
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    <Play className="mr-2 h-4 w-4" /> Gå til Spillobby
                                </Button>
                            </Link>
                         ) : null // Ikke vis knapp for andre
                    ) : (
                        // Sesjon er IKKE aktiv (eller laster) - knapp for arrangør
                        isOrganizer && !isLoadingSessionId && (
                            <Button
                                onClick={onStartRound}
                                disabled={isStartingRound}
                                variant="secondary"
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                            >
                                {isStartingRound ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                {isStartingRound ? 'Starter Runde...' : 'Start Runde 1'}
                            </Button>
                        )
                    )}
                </div>
            </div>
            {/* Ekstra info for arrangør */}
            {isOrganizer && !activeSessionId && !isLoadingSessionId && (
                 <p className="text-xs text-yellow-700 mt-2 text-center sm:text-left">
                      Klikk "Start Runde" for å opprette spillobbyen slik at deltakere kan bli med.
                 </p>
            )}
             {isOrganizer && activeSessionId && (
                 <p className="text-xs text-green-700 mt-2 text-center sm:text-left">
                      Spillobbyen er klar.
                 </p>
             )}
        </div>
    );
}