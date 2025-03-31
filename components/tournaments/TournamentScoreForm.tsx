// components/tournaments/TournamentScoreForm.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Minus, Plus, AlertTriangle } from 'lucide-react';

import { toast } from "react-hot-toast"; // Brukes kun for form-validering her
import { cn } from '@/app/lib/utils';

// --- Typer ---
interface ScoreInputData {
    score: string;
    ob: string;
}

interface ParticipantInput extends ScoreInputData {
    playerId: string;
    playerName: string;
    currentScore?: number | null;
    currentOb?: number | null;
}

interface TournamentScoreFormProps {
    holeData: {
        id: string;
        holeNumber: number;
        par: number;
        distance?: number | null;
    };
    participants: {
        playerId: string;
        playerName: string;
        currentScore?: number | null;
        currentOb?: number | null;
    }[];
    onSaveScore: (scores: { playerId: string; score: number; obCount: number }[]) => Promise<void>;
    isSaving: boolean;
}

// --- Hjelpefunksjoner ---
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
    // Ref for å sette fokus ved feil
    const formRef = useRef<HTMLFormElement>(null);

    // Initialiser state basert på props
    useEffect(() => {
        const initialInputs: { [playerId: string]: ScoreInputData } = {};
        participants.forEach(p => {
            initialInputs[p.playerId] = {
                score: p.currentScore?.toString() ?? '',
                ob: p.currentOb?.toString() ?? '0',
            };
        });
        setPlayerInputs(initialInputs);
        setValidationError(null); // Nullstill feil ved hullbytte
    }, [participants, holeData]); // Kjør når props endres

    // Håndterer generell input-endring
    const handleInputChange = useCallback((playerId: string, field: 'score' | 'ob', value: string) => {
        if (!isValidNumericInput(value)) return; // Ignorer ugyldig input

        setPlayerInputs(prev => {
            const currentData = prev[playerId] || { score: '', ob: '0' };
            // OB kan ikke være tom streng, sett til '0'
            const finalValue = (field === 'ob' && value === '') ? '0' : value;
            return {
                ...prev,
                [playerId]: { ...currentData, [field]: finalValue },
            };
        });
        setValidationError(null); // Fjern feilmelding ved endring
    }, []);

    // Håndterer OB-justering med knapper
    const handleObAdjust = useCallback((playerId: string, adjustment: number) => {
        setPlayerInputs(prev => {
            const currentOb = parseNumericInput(prev[playerId]?.ob, 0);
            const newOb = Math.max(0, currentOb + adjustment); // Aldri under 0
            return {
                ...prev,
                [playerId]: { ...(prev[playerId] || { score: '', ob: '0' }), ob: newOb.toString() },
            };
        });
        setValidationError(null);
    }, []);

    // Validerer input for en spiller
    const validatePlayerInput = (playerId: string): string | null => {
        const input = playerInputs[playerId];
        if (!input || input.score === '' || input.score === null || input.score === undefined) {
            return "Mangler score";
        }
        const score = parseNumericInput(input.score, 0);
        if (score < 1) {
            return "Score må være minst 1";
        }
        // OB valideres implisitt til >= 0 av input-handlerne
        return null; // Ingen feil
    };

    // Håndterer innsending
    const handleSubmit = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        setValidationError(null); // Nullstill før ny validering

        const scoresToSave: { playerId: string; score: number; obCount: number }[] = [];
        let firstErrorPlayerId: string | null = null;
        let firstErrorMessage: string | null = null;

        for (const p of participants) {
            const errorMessage = validatePlayerInput(p.playerId);
            if (errorMessage) {
                if (!firstErrorPlayerId) {
                    firstErrorPlayerId = p.playerId;
                    firstErrorMessage = `${p.playerName}: ${errorMessage}`;
                }
                // Fortsett å validere alle for å potensielt markere flere felt
            } else {
                const score = parseNumericInput(playerInputs[p.playerId].score, 0); // Bør ikke være 0 pga validering
                const obCount = parseNumericInput(playerInputs[p.playerId].ob, 0);
                scoresToSave.push({ playerId: p.playerId, score, obCount });
            }
        }

        if (firstErrorPlayerId) {
            setValidationError(firstErrorMessage);
            // Sett fokus på det første feltet med feil (hvis mulig)
            const errorInput = formRef.current?.querySelector<HTMLInputElement>(`#score-${firstErrorPlayerId}`);
            errorInput?.focus();
            errorInput?.select();
            toast.error(firstErrorMessage || "Vennligst korriger score-feltene.");
        } else {
            // Ingen valideringsfeil, kall onSaveScore
            await onSaveScore(scoresToSave);
        }
    }, [playerInputs, participants, onSaveScore, holeData.holeNumber]);

    // --- JSX Struktur ---
    return (
        <Card className="w-full max-w-xl mx-auto shadow-lg border border-gray-200"> {/* Økt bredde, skygge, border */}
            <CardHeader className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200"> {/* Styling header */}
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800">
                    Hull {holeData.holeNumber}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                    Par {holeData.par}
                    {holeData.distance && ` / ${holeData.distance}m`}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} ref={formRef} noValidate> {/* noValidate for å håndtere feil selv */}
                    {/* Valideringsfeilmelding øverst */}
                    {validationError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    )}

                    {/* Grid for bedre layout */}
                    <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 sm:gap-x-4 gap-y-4 items-center">
                        {/* Headings */}
                        <div className="font-medium text-sm text-gray-700 pb-1 border-b border-gray-200">Spiller</div>
                        <div className="font-medium text-sm text-gray-700 text-center pb-1 border-b border-gray-200">Kast</div>
                        <div className="font-medium text-sm text-gray-700 text-center pb-1 border-b border-gray-200">OB</div>

                        {/* Player Rows */}
                        {participants.map((participant) => {
                            const playerId = participant.playerId;
                            const inputData = playerInputs[playerId] || { score: '', ob: '0' };
                            const playerError = validationError && validatePlayerInput(playerId); // Sjekk individuell feil

                            return (
                                <React.Fragment key={playerId}>
                                    {/* Player Name */}
                                    <Label
                                        htmlFor={`score-${playerId}`}
                                        className={cn(
                                            "truncate pr-2 text-gray-800",
                                            playerError && "text-red-600 font-medium" // Fremhev ved feil
                                        )}
                                        title={participant.playerName}
                                    >
                                        {participant.playerName}
                                    </Label>

                                    {/* Score Input */}
                                    <div className="flex justify-center">
                                        <Input
                                            id={`score-${playerId}`}
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            min="1"
                                            step="1"
                                            value={inputData.score}
                                            onChange={(e) => handleInputChange(playerId, 'score', e.target.value)}
                                            className={cn(
                                                "w-16 text-center border-gray-300 focus:ring-blue-500 focus:border-blue-500",
                                                playerError && "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50" // Fremhev ved feil
                                            )}
                                            required
                                            disabled={isSaving}
                                            aria-label={`Antall kast for ${participant.playerName}`}
                                            aria-invalid={!!playerError}
                                            aria-describedby={playerError ? `error-${playerId}` : undefined}
                                        />
                                    </div>

                                    {/* OB Controls */}
                                    <div className='flex items-center justify-center gap-1'>
                                        <Button
                                            type="button"
                                            variant="ghost" // Mer subtil
                                            size="icon"
                                            className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                                            onClick={() => handleObAdjust(playerId, -1)}
                                            disabled={isSaving || parseNumericInput(inputData.ob, 0) === 0}
                                            aria-label={`Reduser OB for ${participant.playerName}`}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            id={`ob-${playerId}`}
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            min="0"
                                            step="1"
                                            value={inputData.ob}
                                            onChange={(e) => handleInputChange(playerId, 'ob', e.target.value)}
                                            className="w-12 text-center border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                            disabled={isSaving}
                                            aria-label={`OB-kast for ${participant.playerName}`}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost" // Mer subtil
                                            size="icon"
                                            className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                                            onClick={() => handleObAdjust(playerId, 1)}
                                            disabled={isSaving}
                                            aria-label={`Øk OB for ${participant.playerName}`}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Skjult feilmelding for skjermleser */}
                                     {playerError && (
                                         <span id={`error-${playerId}`} className="sr-only">
                                             {playerError}
                                         </span>
                                     )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Lagre-knapp */}
                    <Button type="submit" className="mt-6 w-full text-base py-2.5" disabled={isSaving}>
                        {isSaving ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Lagrer...</>
                        ) : (
                            'Lagre score'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}