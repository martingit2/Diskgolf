// components/tournaments/details/TournamentHeader.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

// Definer Tournament-typen (enten importer eller definer her)
// For enkelhets skyld, definerer vi de nødvendige feltene her
interface TournamentHeaderProps {
    tournament: {
        id: string;
        name: string;
        organizer: {
            id: string;
            name: string | null;
        };
        club: {
            id: string;
            name: string;
        } | null;
        course: {
            id: string;
            name: string;
        };
        location: string;
    };
    isOrganizer: boolean;
}

export function TournamentHeader({ tournament, isOrganizer }: TournamentHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
                <p className="text-gray-700 mt-1 text-sm">
                    Arrangert av {tournament.organizer.name || 'Ukjent arrangør'}
                    {tournament.club && ` • ${tournament.club.name}`}
                </p>
                <p className="text-gray-600 text-sm">
                    Bane: <Link href={`/course/${tournament.course.id}`} className="text-blue-600 hover:underline hover:text-blue-800">{tournament.course.name}</Link> ({tournament.location})
                </p>
            </div>
            {isOrganizer && (
                <Link href={`/tournament/${tournament.id}/edit`}>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto">
                        <Settings className="mr-2 h-4 w-4" /> Rediger
                    </Button>
                </Link>
            )}
        </div>
    );
}