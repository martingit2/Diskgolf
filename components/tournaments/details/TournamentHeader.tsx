// Fil: components/tournaments/details/TournamentHeader.tsx
// Formål: Definerer en React-komponent som viser hovedoverskriften og nøkkelinformasjon for en turneringsdetaljside.
//         Inkluderer turneringsnavn, arrangør, klubb (hvis tilgjengelig), bane/sted og en "Rediger"-knapp som kun vises for turneringsarrangøren.
//         Benytter Next.js Link, Lucide-ikoner og Button-komponent for UI.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, User, MapPin, Users, Award } from 'lucide-react'; // La til Award-ikonet

// Interface for props - Sørger for at vi vet hvilke data vi får inn
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
        location: string; // Stedet turneringen avholdes
    };
    isOrganizer: boolean; // Er den innloggede brukeren arrangør?
}

/**
 * TournamentHeader Component
 *
 * Viser hovedinformasjonen om turneringen på toppen av detaljsiden.
 * Inkluderer tittel, arrangør, klubb, bane/sted og en redigeringsknapp for arrangøren.
 * Stylet for et profesjonelt og rent utseende.
 */
export function TournamentHeader({ tournament, isOrganizer }: TournamentHeaderProps) {
    return (
        // Ytre container: Bruker flex for layout, justerer spacing (gap) og bunnmarg (mb)
        <div className="flex flex-col sm:flex-row justify-between items-start gap-x-6 gap-y-4 mb-8 sm:mb-10">

            {/* Venstre seksjon: Turneringsinformasjon */}
            {/*
                - `flex-grow`: Tar opp tilgjengelig plass.
                - `space-y-3`: Gir vertikal avstand mellom elementene inni.
                - `border-l-4 border-green-600/80`: Den grønne venstreborden (litt gjennomsiktig).
                - `pl-4 py-2`: Padding for å gi luft rundt innholdet og borden.
                - `bg-gradient-to-r from-white/50 to-transparent`: Subtil hvit gradient som toner ut.
                - `rounded-r-md`: Avrundede hjørner på høyre side.
            */}
            <div className="flex-grow space-y-3 border-l-4 border-green-600/80 pl-4 pr-2 py-2 bg-gradient-to-r from-white/50 to-transparent rounded-r-md">

                {/* Tittel-seksjon med ikon */}
                <div className='flex items-center gap-2.5'> {/* Mer luft rundt tittelikonet */}
                     <Award size={26} className="text-green-700 flex-shrink-0 mt-0.5" /> {/* Justert størrelse/posisjon */}
                     {/* Selve tittelen: Stor, fet, litt tettere bokstavavstand */}
                     <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                         {tournament.name}
                     </h1>
                </div>

                {/* Detaljer-seksjon (Arrangør, Klubb, Bane) */}
                {/* `space-y-1.5`: Mindre vertikal avstand mellom detaljlinjene */}
                <div className="space-y-1.5 text-sm text-gray-700">

                    {/* Arrangør-linje */}
                    <div className="flex items-center gap-1.5">
                        {/* Ikon: Litt nedtonet farge */}
                        <User size={14} className="text-gray-500 flex-shrink-0" />
                        {/* Tekst: Label og verdi (verdi med litt mer vekt) */}
                        <span>
                            Arrangør: <span className="font-medium text-gray-800">{tournament.organizer.name || 'Ukjent'}</span>
                        </span>
                    </div>

                    {/* Klubb-linje (vises kun hvis klubb finnes) */}
                    {tournament.club && (
                        <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-gray-500 flex-shrink-0" />
                            <span>
                                Klubb: <span className="font-medium text-gray-800">{tournament.club.name}</span>
                            </span>
                        </div>
                    )}

                    {/* Bane og Sted-linje */}
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                        <span>
                            {/* Lenke til banen, med tydeligere hover-effekt */}
                            Bane: <Link
                                        href={`/course/${tournament.course.id}`}
                                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors duration-150"
                                    >
                                        {tournament.course.name}
                                    </Link>
                            {/* Sted i parentes, litt nedtonet */}
                            <span className='text-gray-500'> ({tournament.location})</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Høyre seksjon: Rediger-knapp (vises kun for arrangør) */}
            {isOrganizer && (
                // `flex-shrink-0`: Forhindrer at knappen krymper.
                // `sm:pt-1`: Liten justering opp på større skjermer for bedre visuell linje.
                <div className="w-full sm:w-auto flex-shrink-0 sm:pt-1">
                     {/* Lenke rundt knappen for navigasjon */}
                     {/* `aria-label` for skjermlesere */}
                    <Link
                        href={`/tournament/${tournament.id}/edit`}
                        aria-label={`Rediger innstillinger for turneringen ${tournament.name}`}
                    >
                        <Button
                            variant="outline" // Bruker outline-varianten
                            size="sm" // Litt mindre knapp
                            // Styling: Full bredde på mobil, auto på større. Hvit bakgrunn, tydeligere grenser og hover. Fokus-styling. Animasjon. Skygge.
                            className="w-full sm:w-auto border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-150 shadow-sm hover:shadow-md"
                        >
                            <Settings className="mr-2 h-4 w-4" /> {/* Ikon med mellomrom */}
                            Rediger
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}