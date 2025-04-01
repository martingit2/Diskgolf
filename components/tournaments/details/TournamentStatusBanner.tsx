// components/tournaments/details/TournamentStatusBanner.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Bruk Card for struktur
import { Loader2, Play, Users, ListChecks } from 'lucide-react'; // Importer flere ikoner

// Definer User interface minimum
interface User {
  id: string;
  // ... andre potensielle brukerfelter
}

// Definer propstyper
interface TournamentStatusBannerProps {
  user: User | null;
  isOrganizer: boolean;
  isParticipant: boolean;
  activeSessionId: string | null;
  activeSessionStatus: 'waiting' | 'inProgress' | 'completed' | null; // Den nye status-propen
  isLoadingSessionId: boolean; // For å vise lasting mens sesjons-ID hentes
  isStartingRound: boolean; // For å vise lasting når runde startes
  onStartRound: () => Promise<void>; // Callback for å starte runde
}

export function TournamentStatusBanner({
  user,
  isOrganizer,
  isParticipant,
  activeSessionId,
  activeSessionStatus, // Bruk denne
  isLoadingSessionId,
  isStartingRound,
  onStartRound,
}: TournamentStatusBannerProps) {

  // --- Logikk for å bestemme innhold og utseende ---

  let bannerVariant: "default" | "warning" | "info" | "success" = "default";
  let title: string = "Turnering";
  let description: React.ReactNode = "Laster status...";
  let actionContent: React.ReactNode = null;

  if (isLoadingSessionId) {
    // Viser lasting mens vi sjekker om det finnes en aktiv sesjon
    bannerVariant = "default";
    title = "Sjekker rundestatus...";
    description = <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
  } else if (activeSessionId) {
    // Vi har funnet en aktiv sesjon
    if (activeSessionStatus === 'waiting') {
      bannerVariant = "info";
      title = "Spillobby er klar";
      description = "Runden venter på at spillere skal bli klare.";
      if (isParticipant || isOrganizer) { // Både deltakere og arrangører kan gå til lobby
        actionContent = (
          <Link href={`/turnerings-spill/${activeSessionId}/lobby`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Users className="mr-2 h-4 w-4" /> Gå til Spillobby
            </Button>
          </Link>
        );
      }
    } else if (activeSessionStatus === 'inProgress') {
      bannerVariant = "success";
      title = "Runden spilles nå!";
      description = "Resultater oppdateres live.";
      const playButton = (isParticipant || isOrganizer) ? ( // Arrangør kan også gå til spillet for å se
        <Link href={`/turnerings-spill/${activeSessionId}/play`}>
          <Button size="sm" variant="secondary">
            <Play className="mr-2 h-4 w-4" /> Gå til Spill
          </Button>
        </Link>
      ) : null;
      const resultsButton = (
          <Link href={`/turnerings-spill/${activeSessionId}/results`}>
              <Button size="sm" variant="outline">
                  <ListChecks className="mr-2 h-4 w-4" /> Se Leaderboard
              </Button>
          </Link>
      );
       // Vis begge knappene hvis brukeren kan spille
      actionContent = (
          <div className="flex flex-wrap gap-2 mt-2">
              {playButton}
              {resultsButton}
          </div>
      );

    } else if (activeSessionStatus === 'completed') {
        // Selvom 'active-session' API ikke burde returnere completed, håndterer vi det
        bannerVariant = "default";
        title = "Runde Fullført";
        description = "Denne runden av turneringen er ferdigspilt.";
        actionContent = (
             <Link href={`/turnerings-spill/${activeSessionId}/results`}>
                 <Button size="sm" variant="outline">
                     <ListChecks className="mr-2 h-4 w-4" /> Se Sluttresultater
                 </Button>
             </Link>
        );
    } else {
        // Fallback hvis status er null selv om ID finnes (bør ikke skje)
        bannerVariant = "default";
        title = "Turneringen pågår";
        description = "En runde er aktiv, men status er ukjent.";
    }
  } else {
    // Ingen aktiv sesjon funnet
    if (isOrganizer) {
      bannerVariant = "warning";
      title = "Klar til å starte Runde 1?";
      description = "Ingen aktiv spillrunde funnet. Start runden for å åpne lobbyen.";
      actionContent = (
        <Button
          size="sm"
          onClick={onStartRound}
          disabled={isStartingRound}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          {isStartingRound ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          {isStartingRound ? 'Starter...' : 'Start Runde 1'}
        </Button>
      );
    } else {
        // For vanlige brukere/deltakere når ingen runde er aktiv
        bannerVariant = "default";
        title = "Turneringen er i gang"; // Eller hent status fra tournament-objektet?
        description = "Venter på at arrangøren skal starte neste runde.";
        // Ingen handling for ikke-arrangører her
    }
  }

  // Definer CSS klasser basert på variant
  const cardClass = {
    default: "bg-gray-50 border-gray-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
  }[bannerVariant];

  const titleClass = {
    default: "text-gray-700",
    warning: "text-yellow-800", // Mørkere gul for bedre kontrast
    info: "text-blue-700",
    success: "text-green-700",
  }[bannerVariant];

  const descriptionClass = {
    default: "text-gray-600",
    warning: "text-yellow-700", // Mørkere gul
    info: "text-blue-600",
    success: "text-green-600",
  }[bannerVariant];


  return (
    // Bruk Card for en penere struktur
    <Card className={`mt-6 ${cardClass}`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
             {/* Tittel og beskrivelse */}
             <div className="flex-1">
                <CardTitle className={`text-lg font-semibold ${titleClass}`}>{title}</CardTitle>
                <CardDescription className={`mt-1 text-sm ${descriptionClass}`}>
                    {description}
                </CardDescription>
             </div>
             {/* Handlingsknapper (hvis noen) */}
             {actionContent && (
                 <div className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0">
                     {actionContent}
                 </div>
             )}
        </div>
      </CardHeader>
    </Card>
  );
}