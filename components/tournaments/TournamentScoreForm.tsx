// components/tournaments/TournamentScoreForm.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter, // Bruker CardFooter for knappen
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Loader2, Minus, Plus, AlertTriangle, Target } from 'lucide-react'; // La til Target ikon
import { toast } from "react-hot-toast";
import { cn } from '@/app/lib/utils'; // Sørg for at denne er korrekt importert

// --- Typer (uendret) ---
interface ScoreInputData { score: string; ob: string; }
interface ParticipantInput extends ScoreInputData { playerId: string; playerName: string; currentScore?: number | null; currentOb?: number | null; }
interface TournamentScoreFormProps {
    holeData: { id: string; holeNumber: number; par: number; distance?: number | null; };
    participants: { playerId: string; playerName: string; currentScore?: number | null; currentOb?: number | null; }[];
    onSaveScore: (scores: { playerId: string; score: number; obCount: number }[]) => Promise<void>;
    isSaving: boolean;
}

// --- Hjelpefunksjoner (uendret) ---
const isValidNumericInput = (value: string): boolean => /^\d*$/.test(value);
const parseNumericInput = (value: string | undefined, defaultValue: number): number => {
    const parsed = parseInt(value || '', 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// --- Komponenten ---
export function TournamentScoreForm({
    holeData,
    participants,
    onSaveScore,
    isSaving
}: TournamentScoreFormProps) {

    const [playerInputs, setPlayerInputs] = useState<{ [playerId: string]: ScoreInputData }>({});
    const [validationError, setValidationError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null); // Ref for å fokusere første input

    // Initialiser state og nullstill feil
    useEffect(() => {
        const initialInputs: { [playerId: string]: ScoreInputData } = {};
        participants.forEach(p => {
            initialInputs[p.playerId] = {
                score: p.currentScore?.toString() ?? '',
                ob: p.currentOb?.toString() ?? '0',
            };
        });
        setPlayerInputs(initialInputs);
        setValidationError(null); // Nullstill feil ved hullbytte/prop-endring

        // Sett fokus på score-feltet når komponenten lastes for et nytt hull (etter en kort forsinkelse)
        const timer = setTimeout(() => {
             firstInputRef.current?.focus();
             firstInputRef.current?.select(); // Marker innholdet for enkel overskriving
        }, 100); // Liten delay for å sikre at elementet er rendret

         return () => clearTimeout(timer); // Rydd opp timer

    }, [participants, holeData.holeNumber]); // Kjør når deltaker eller hullnummer endres

    // --- Input Handlers (uendret logikk, men satt inn i komponenten) ---
    const handleInputChange = useCallback((playerId: string, field: 'score' | 'ob', value: string) => {
        if (!isValidNumericInput(value)) return;
        setPlayerInputs(prev => {
            const currentData = prev[playerId] || { score: '', ob: '0' };
            const finalValue = (field === 'ob' && value === '') ? '0' : value;
            return { ...prev, [playerId]: { ...currentData, [field]: finalValue } };
        });
        setValidationError(null);
    }, []);

    const handleObAdjust = useCallback((playerId: string, adjustment: number) => {
        setPlayerInputs(prev => {
            const currentOb = parseNumericInput(prev[playerId]?.ob, 0);
            const newOb = Math.max(0, currentOb + adjustment);
            return { ...prev, [playerId]: { ...(prev[playerId] || { score: '', ob: '0' }), ob: newOb.toString() } };
        });
        setValidationError(null);
    }, []);

    // --- Validering (uendret logikk) ---
    const validatePlayerInput = (playerId: string): string | null => {
        const input = playerInputs[playerId];
        if (!input || input.score.trim() === '') return "Mangler antall kast"; // Mer spesifikk melding
        const score = parseNumericInput(input.score, 0);
        if (score < 1) return "Antall kast må være minst 1";
        return null;
    };

    // --- Submit Handler (uendret logikk) ---
    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        setValidationError(null);
        const scoresToSave: { playerId: string; score: number; obCount: number }[] = [];
        let firstErrorPlayerId: string | null = null;
        let firstErrorMessage: string | null = null;

        for (const p of participants) { // Vil nå kun kjøre for én spiller
            const errorMessage = validatePlayerInput(p.playerId);
            if (errorMessage) {
                firstErrorPlayerId = p.playerId;
                firstErrorMessage = `${p.playerName}: ${errorMessage}`;
                break; // Stopp ved første feil
            } else {
                const score = parseNumericInput(playerInputs[p.playerId].score, 1); // Default til 1 hvis tomt (men validering stopper det)
                const obCount = parseNumericInput(playerInputs[p.playerId].ob, 0);
                scoresToSave.push({ playerId: p.playerId, score, obCount });
            }
        }

        if (firstErrorPlayerId) {
            setValidationError(firstErrorMessage);
            const errorInput = formRef.current?.querySelector<HTMLInputElement>(`#score-${firstErrorPlayerId}`);
            errorInput?.focus();
            errorInput?.select();
            toast.error(firstErrorMessage || "Vennligst korriger score-feltene.", { duration: 4000 });
        } else if (scoresToSave.length > 0) {
            await onSaveScore(scoresToSave);
        } else {
             // Bør ikke skje hvis participants har elementer, men for sikkerhets skyld
             toast.error("Ingen score å lagre.");
        }
    }, [playerInputs, participants, onSaveScore, holeData.holeNumber]);


    // --- JSX Struktur (Betydelig redesignet) ---
    const participant = participants[0]; // Vi vet det kun er én nå
    const playerId = participant?.playerId; // Hent ID for bruk i state/handlers
    const inputData = playerId ? playerInputs[playerId] : { score: '', ob: '0' }; // Hent data trygt
    const playerError = validationError; // Feilmelding gjelder nå denne ene spilleren

    return (
        <Card className="w-full max-w-xl mx-auto overflow-hidden border-gray-200/80 shadow-md rounded-xl bg-gradient-to-br from-white via-white to-gray-50/30">
             {/* Header med mer visuell info */}
             <CardHeader className="bg-muted/30 px-5 py-4 border-b border-gray-200/80">
                 <div className="flex items-center justify-between">
                      <div className='flex items-center gap-2.5'>
                          <Target className="w-6 h-6 text-primary/80" />
                          <CardTitle className="text-xl font-semibold tracking-tight text-gray-800">
                              Hull {holeData.holeNumber}
                          </CardTitle>
                      </div>
                      <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">Par {holeData.par}</p>
                          {holeData.distance != null && (
                              <p className="text-xs text-muted-foreground">{holeData.distance}m</p>
                          )}
                      </div>
                 </div>
             </CardHeader>

            {/* Vis kun hvis vi har en gyldig deltaker */}
            {participant && playerId && (
                <form onSubmit={handleSubmit} ref={formRef} noValidate id={`scoreForm-${playerId}`}>
                     <CardContent className="p-6 space-y-6">
                         {/* Valideringsfeilmelding */}
                         {validationError && (
                             <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm flex items-center gap-2 animate-pulse-fast">
                                 <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                 <span>{validationError}</span>
                             </div>
                         )}

                         {/* Spillerseksjon */}
                         <div className="space-y-4">
                             {/* Spiller Navn (ikke label, bare visning) */}
                             <p className="text-lg font-medium text-gray-900">{participant.playerName}</p>

                             {/* Input-område med grid */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                                  {/* Kast Input */}
                                  <div className="space-y-1.5">
                                      <Label htmlFor={`score-${playerId}`} className="text-sm font-medium text-gray-700">
                                          Antall kast
                                      </Label>
                                      <Input
                                          ref={firstInputRef} // Ref for initial fokus
                                          id={`score-${playerId}`}
                                          type="number" // Bruk number for +/- på mobil etc.
                                          inputMode="numeric" // Hjelper mobil-tastatur
                                          pattern="[0-9]*"
                                          min="1"
                                          step="1"
                                          value={inputData?.score ?? ''}
                                          onChange={(e) => handleInputChange(playerId, 'score', e.target.value)}
                                          className={cn(
                                              "h-12 text-xl px-4 rounded-md border-gray-300 shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // Styling for premium look
                                              playerError && "border-red-500 ring-1 ring-red-500 bg-red-50/50 focus-visible:ring-red-500" // Tydeligere feil
                                          )}
                                          required
                                          disabled={isSaving}
                                          aria-label={`Antall kast for ${participant.playerName}`}
                                          aria-invalid={!!playerError}
                                          aria-describedby={playerError ? `error-${playerId}-score` : undefined}
                                      />
                                       {playerError && ( <p id={`error-${playerId}-score`} className="text-xs text-red-600 mt-1">{playerError}</p> )}
                                  </div>

                                  {/* OB Controls */}
                                  <div className="space-y-1.5">
                                      <Label htmlFor={`ob-${playerId}`} className="text-sm font-medium text-gray-700">
                                          OB-kast
                                      </Label>
                                      <div className='flex items-center gap-2'>
                                          <Button
                                              type="button"
                                              variant="outline" // Tydeligere enn ghost
                                              size="icon"
                                              className="h-12 w-12 rounded-md shadow-sm active:scale-95 transition-transform disabled:opacity-50" // Styling
                                              onClick={() => handleObAdjust(playerId, -1)}
                                              disabled={isSaving || parseNumericInput(inputData?.ob, 0) === 0}
                                              aria-label="Reduser OB"
                                          >
                                              <Minus className="h-5 w-5" />
                                          </Button>
                                          {/* Viser OB som tekst, ikke input, for enklere justering */}
                                          <div
                                             id={`ob-${playerId}`}
                                             className="flex-1 h-12 flex items-center justify-center text-xl font-medium border border-gray-300 rounded-md bg-gray-50/50"
                                             aria-label={`Antall OB-kast: ${inputData?.ob ?? '0'}`} // Gi verdi til skjermleser
                                             role="status" // Indikerer at innholdet kan endres dynamisk
                                          >
                                            {inputData?.ob ?? '0'}
                                          </div>
                                          {/*
                                          // Alternativ med Input (hvis manuell input er ønskelig):
                                            <Input
                                                id={`ob-${playerId}`} type="number" inputMode="numeric" pattern="[0-9]*"
                                                min="0" step="1" value={inputData?.ob ?? '0'}
                                                onChange={(e) => handleInputChange(playerId, 'ob', e.target.value)}
                                                className="w-16 text-center h-12 text-xl px-2 rounded-md border-gray-300 shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                disabled={isSaving} aria-label="OB-kast"
                                            />
                                           */}
                                          <Button
                                              type="button"
                                              variant="outline"
                                              size="icon"
                                              className="h-12 w-12 rounded-md shadow-sm active:scale-95 transition-transform disabled:opacity-50"
                                              onClick={() => handleObAdjust(playerId, 1)}
                                              disabled={isSaving}
                                              aria-label="Øk OB"
                                          >
                                              <Plus className="h-5 w-5" />
                                          </Button>
                                      </div>
                                  </div>
                             </div>
                         </div>
                     </CardContent>

                    {/* Footer med Lagre-knapp */}
                    <CardFooter className="p-5 bg-muted/30 border-t border-gray-200/80">
                         <Button
                             type="submit"
                             className="w-full h-11 text-base font-semibold rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:from-green-600 hover:to-emerald-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70" // Mer fancy knapp
                             disabled={isSaving}
                             form={`scoreForm-${playerId}`} // Koble til form
                         >
                             {isSaving ? (
                                 <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Lagrer...</>
                             ) : (
                                 'Lagre Score'
                             )}
                         </Button>
                    </CardFooter>
                </form>
            )}
            {!participant && (
                 <CardContent className="p-6 text-center text-muted-foreground">
                     Ingen spillerdata å vise.
                 </CardContent>
            )}
        </Card>
    );
}