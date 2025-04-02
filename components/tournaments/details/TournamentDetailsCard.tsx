// components/tournaments/details/TournamentDetailsCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { TournamentStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
    ListChecks,     // For resultater
    CalendarDays,   // For tidsplan
    Users,          // For påmelding
    Info,           // For beskrivelse
    Target,         // For banedetaljer (Hull, Par)
    TrendingUp,     // For banedistanse
    AlertTriangle,  // For OB-soner
    Disc            // Gjenbruker Disc for hovedtittel
} from 'lucide-react';

// Oppdatert interface: La til 'name', forventer mer baneinfo
interface TournamentDetailsCardProps {
    tournament: {
        id: string;
        name: string; // Lagt til denne for alt-text
        startDate: string;
        endDate: string | null;
        status: TournamentStatus;
        maxParticipants: number | null;
        description: string | null;
        image: string | null; // Turneringsbilde (valgfritt)
        course: {
            id: string;
            name: string; // Trengs for banenavn i Banedetaljer-tittel
            location: string | null;
            image: string | null; // Banebilde
            par: number | null;
            numHoles: number | null;
            // NYE FELTER FORVENTET FRA API:
            totalDistance?: number | null; // Total distanse for banen
            obZones?: { id: string; }[]; // Liste over OB-soner (trenger bare lengden her)
        };
        // organizer og club trengs ikke lenger her hvis de kun vises i header
        _count: {
            participants: number;
        };
    };
}

export function TournamentDetailsCard({ tournament }: TournamentDetailsCardProps) {
    const canViewStandings = tournament.status === TournamentStatus.COMPLETED;
    const startDate = new Date(tournament.startDate);
    const endDate = tournament.endDate ? new Date(tournament.endDate) : null;

    // --- Hjelpefunksjoner (uendret) ---
    const getStatusClasses = (status: TournamentStatus): string => {
        switch (status) {
            case TournamentStatus.REGISTRATION_OPEN: return 'bg-green-100 text-green-800 border border-green-200';
            case TournamentStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case TournamentStatus.COMPLETED: return 'bg-gray-100 text-gray-700 border border-gray-200';
            case TournamentStatus.PLANNING: return 'bg-blue-100 text-blue-800 border border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleString('nb-NO', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const numObZones = tournament.course?.obZones?.length ?? 0;

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col h-full">
            {/* Bilde (Prioriterer turneringsbilde) */}
            {(tournament.image || tournament.course?.image) && (
                <div className="relative w-full h-48 flex-shrink-0">
                    <Image
                        src={tournament.image || tournament.course.image || '/placeholder-image.webp'}
                        // Bruker tournament.name hvis det er turneringsbilde
                        alt={tournament.image ? `Bilde for ${tournament.name}` : `Bilde av ${tournament.course?.name || 'bane'}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none"></div>
                </div>
            )}

            {/* Kortinnhold */}
            <div className="p-5 md:p-6 flex-grow flex flex-col space-y-4"> {/* Bruker space-y for generell avstand */}

                {/* Banedetaljer Seksjon */}
                <div> {/* Ikke behov for mb/pb her pga overordnet space-y */}
                     <h3 className="text-base font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
                         <Target size={16} className="text-gray-500" />
                         {/* Viser banenavn for kontekst */}
                         <span>Banedetaljer ({tournament.course?.name ?? 'Ukjent bane'})</span>
                     </h3>
                     {/* Grid for baneinfo */}
                     <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600 border-l-2 border-gray-100 pl-3">
                        <div className="flex items-center gap-1.5" title="Antall hull">
                            <Target size={14} className="text-gray-400 flex-shrink-0" />
                             <span>Hull: <span className="font-medium text-gray-800">{tournament.course?.numHoles ?? 'Ukjent'}</span></span>
                        </div>
                         <div className="flex items-center gap-1.5" title="Banens par">
                             <Target size={14} className="text-gray-400 flex-shrink-0" />
                             <span>Par: <span className="font-medium text-gray-800">{tournament.course?.par ?? 'Ukjent'}</span></span>
                         </div>
                         <div className="flex items-center gap-1.5" title="Total banelengde">
                             <TrendingUp size={14} className="text-gray-400 flex-shrink-0" />
                             <span>Lengde: <span className="font-medium text-gray-800">
                                 {tournament.course?.totalDistance != null ? `${tournament.course.totalDistance.toFixed(0)} m` : 'Ukjent'}
                                 </span>
                             </span>
                         </div>
                         <div className="flex items-center gap-1.5" title="Antall OB-soner">
                             <AlertTriangle size={14} className="text-gray-400 flex-shrink-0" />
                             <span>OB-soner: <span className="font-medium text-gray-800">{numObZones > 0 ? numObZones : 'Ingen'}</span></span>
                         </div>
                     </div>
                 </div>

                {/* Separator */}
                <hr className="border-gray-100" />

                {/* Tidsplan Seksjon */}
                <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <CalendarDays size={16} className="text-gray-500" />
                        <span>Tidsplan</span>
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600 border-l-2 border-gray-100 pl-3">
                        <p>
                            Starter: <span className="font-medium text-gray-800">{formatDate(startDate)}</span>
                        </p>
                        {endDate && (
                            <p>
                                Slutter: <span className="font-medium text-gray-800">{formatDate(endDate)}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Separator */}
                <hr className="border-gray-100" />

                {/* Påmelding Seksjon */}
                <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Users size={16} className="text-gray-500" />
                        <span>Påmelding</span>
                    </h3>
                    <div className="space-y-1.5 text-sm text-gray-600 border-l-2 border-gray-100 pl-3">
                        <p>
                            Plasser: <span className="font-medium text-gray-800">
                                {tournament._count.participants} {tournament.maxParticipants ? `/ ${tournament.maxParticipants}` : '(Ubegrenset)'}
                            </span>
                        </p>
                        <div className="flex items-center gap-2">
                            <span>Status:</span>
                            <span className={`inline-block font-semibold px-2.5 py-0.5 rounded-full text-xs leading-tight ${getStatusClasses(tournament.status)}`}>
                                {tournament.status.replace("_", " ").charAt(0).toUpperCase() + tournament.status.replace("_", " ").slice(1).toLowerCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Beskrivelse Seksjon (kun hvis den finnes) */}
                {tournament.description && (
                    <>
                        {/* Separator */}
                        <hr className="border-gray-100" />
                        <div className="flex-grow"> {/* flex-grow for å skyve resultater ned */}
                            <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <Info size={16} className="text-gray-500" />
                                <span>Beskrivelse</span>
                            </h3>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap border-l-2 border-gray-100 pl-3">
                                {tournament.description}
                            </p>
                        </div>
                    </>
                )}

                {/* Resultater Seksjon (kun hvis ferdig) */}
                {canViewStandings && (
                    <>
                        {/* Separator (kun hvis beskrivelse ikke finnes) */}
                        {!tournament.description && <hr className="border-gray-100 flex-grow"/>}

                        <div className="mt-auto pt-3"> {/* mt-auto skyver denne til bunnen */}
                             <Link href={`/turnerings-spill/${tournament.id}/results`} className="inline-block w-full sm:w-auto">
                                 <Button variant="outline" size="sm" className="w-full sm:w-auto border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-colors duration-150">
                                     <ListChecks className="mr-1.5 h-4 w-4" /> Se Resultater
                                 </Button>
                             </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}