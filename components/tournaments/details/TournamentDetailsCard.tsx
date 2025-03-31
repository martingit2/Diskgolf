// components/tournaments/details/TournamentDetailsCard.tsx
import Link from 'next/link';
import { TournamentStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ListChecks } from 'lucide-react';

// Definer nødvendige felter fra Tournament
interface TournamentDetailsCardProps {
    tournament: {
        id: string;
        startDate: string;
        endDate: string | null;
        status: TournamentStatus;
        maxParticipants: number | null;
        description: string | null;
        _count: {
            participants: number;
        };
    };
}

export function TournamentDetailsCard({ tournament }: TournamentDetailsCardProps) {
    const canViewStandings = tournament.status === TournamentStatus.COMPLETED;

    // Hjelpefunksjon for status-styling
    const getStatusClasses = (status: TournamentStatus) => {
        switch (status) {
            case TournamentStatus.REGISTRATION_OPEN: return 'bg-green-100 text-green-800';
            case TournamentStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
            case TournamentStatus.COMPLETED: return 'bg-gray-100 text-gray-800';
            case TournamentStatus.PLANNING: return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 border-b border-gray-200 pb-2 text-gray-800">Turneringsinfo</h2>
            <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Start:</strong> {new Date(tournament.startDate).toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                {tournament.endDate && (
                    <p><strong>Slutt:</strong> {new Date(tournament.endDate).toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                )}
                <p><strong>Status:</strong> <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${getStatusClasses(tournament.status)}`}>
                    {tournament.status.replace("_", " ")}
                </span></p>
                <p><strong>Påmeldte:</strong> {tournament._count.participants} {tournament.maxParticipants ? `/ ${tournament.maxParticipants}` : '(ubegrenset)'}</p>

                {tournament.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="whitespace-pre-wrap">{tournament.description}</p> {/* Bevar linjeskift */}
                    </div>
                )}

                {/* Lenke til Endelig Stilling */}
                {canViewStandings && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        {/* TODO: Oppdater lenken hvis du har en annen side for sluttstilling */}
                        <Link href={`/turnerings-spill/${tournament.id}/results`}>
                            <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                                <ListChecks className="mr-1 h-4 w-4" /> Se Sluttstilling
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}