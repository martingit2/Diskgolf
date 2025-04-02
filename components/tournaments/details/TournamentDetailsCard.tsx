// components/tournaments/details/TournamentDetailsCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { TournamentStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ListChecks, CalendarDays, MapPin, Disc, User, Users } from 'lucide-react';

interface TournamentDetailsCardProps {
    tournament: {
        id: string;
        startDate: string;
        endDate: string | null;
        status: TournamentStatus;
        maxParticipants: number | null;
        description: string | null;
        location: string;
        image: string | null;
        course: {
            id: string;
            name: string;
            location: string | null;
            image: string | null;
            par: number | null;
            numHoles: number | null;
        };
        organizer: { id: string; name: string | null };
        club: { id: string; name: string } | null;
        _count: {
            participants: number;
        };
    };
}

export function TournamentDetailsCard({ tournament }: TournamentDetailsCardProps) {
    const canViewStandings = tournament.status === TournamentStatus.COMPLETED;
    const startDate = new Date(tournament.startDate);
    const endDate = tournament.endDate ? new Date(tournament.endDate) : null;

    // Hjelpefunksjoner
    const getStatusClasses = (status: TournamentStatus) => {
        switch (status) {
            case TournamentStatus.REGISTRATION_OPEN: return 'bg-green-100 text-green-800';
            case TournamentStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
            case TournamentStatus.COMPLETED: return 'bg-gray-100 text-gray-800';
            case TournamentStatus.PLANNING: return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleString('nb-NO', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Banebilde */}
            {tournament.course?.image && (
                <div className="relative w-full h-48">
                    <Image
                        src={tournament.course.image}
                        alt={`Bilde av ${tournament.course.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}

            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2 text-gray-800 flex items-center gap-2">
                    <Disc className="h-5 w-5" />
                    <span>Turneringsinfo</span>
                </h2>

                <div className="space-y-4 text-sm text-gray-700">
                    {/* Baneinformasjon */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">Bane: {tournament.course?.name}</h3>
                        {tournament.course?.location && (
                            <p className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {tournament.course.location}
                            </p>
                        )}
                        <div className="flex gap-4">
                            {tournament.course?.par && (
                                <p className="text-muted-foreground">
                                    Par: {tournament.course.par}
                                </p>
                            )}
                            {tournament.course?.numHoles && (
                                <p className="text-muted-foreground">
                                    Hull: {tournament.course.numHoles}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                        <h3 className="font-semibold text-gray-900">Arrangør</h3>
                        <p className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            {tournament.organizer.name || 'Ukjent arrangør'}
                        </p>
                        {tournament.club && (
                            <p className="text-muted-foreground">
                                Klubb: {tournament.club.name}
                            </p>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>Tidsplan</span>
                        </h3>
                        <p className="text-muted-foreground">
                            Starter: {formatDate(startDate)}
                        </p>
                        {endDate && (
                            <p className="text-muted-foreground">
                                Slutter: {formatDate(endDate)}
                            </p>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Påmelding</span>
                        </h3>
                        <p className="text-muted-foreground">
                            Påmeldte: {tournament._count.participants} {tournament.maxParticipants ? `/ ${tournament.maxParticipants}` : '(ubegrenset)'}
                        </p>
                        <p className="text-muted-foreground">
                            Status:{' '}
                            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${getStatusClasses(tournament.status)}`}>
                                {tournament.status.replace("_", " ")}
                            </span>
                        </p>
                    </div>

                    {tournament.description && (
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Beskrivelse</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {tournament.description}
                            </p>
                        </div>
                    )}

                    {/* Lenke til Endelig Stilling */}
                    {canViewStandings && (
                        <div className="border-t border-gray-200 pt-4">
                            <Link href={`/turnerings-spill/${tournament.id}/results`}>
                                <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                                    <ListChecks className="mr-1 h-4 w-4" /> Se Sluttstilling
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}