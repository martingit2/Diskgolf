// src/components/klubber/MeetingManagementSection.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
// ------ NYE IMPORTER FOR SLETTING ------
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react'; // Sletteikon
// --------------------------------------
import CreateMeetingForm from "@/components/klubber/CreateMeetingForm";
import { Meeting } from "@prisma/client";
import Link from 'next/link';
import { PlusCircle, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface MeetingManagementSectionProps {
    clubId: string;
    isAdmin: boolean;
    initialMeetings: (Meeting & { cloudinaryPublicId?: string | null })[];
}

const MeetingManagementSection: React.FC<MeetingManagementSectionProps> = ({
    clubId,
    isAdmin,
    initialMeetings,
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // ------ STATE FOR SLETTING ------
    const [isDeleting, setIsDeleting] = useState(false);
    const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null); // Holder møtet som skal slettes
    // -------------------------------
    const router = useRouter();

    // --- Handlers for Opplasting ---
    const handleUploadSuccess = () => {
        setIsAddModalOpen(false);
        toast.success("Dokument lagret!");
        router.refresh();
    };

    // --- Handlers for Sletting ---
    const openDeleteConfirm = (meeting: Meeting) => {
        setMeetingToDelete(meeting); // Sett hvilket møte som er valgt for sletting
        // AlertDialog styrer sin egen open/close state via Trigger/Action/Cancel
    };

    const handleDeleteConfirm = async () => {
        if (!meetingToDelete) return;

        setIsDeleting(true);
        const toastId = toast.loading(`Sletter "${meetingToDelete.title}"...`);

        try {
            const response = await fetch(`/api/meetings/${meetingToDelete.id}`, {
                method: 'DELETE',
            });

            // DELETE returnerer ofte 204 No Content ved suksess, så vi sjekker status direkte
            if (response.status === 204 || response.ok) { // Sjekk for 204 eller generell 2xx
                toast.success(`"${meetingToDelete.title}" slettet.`, { id: toastId });
                setMeetingToDelete(null); // Nullstill valgt møte
                router.refresh(); // Oppdater møtelisten
            } else {
                // Prøv å få feilmelding fra JSON hvis mulig
                let errorPayload: any = { error: `Sletting feilet: ${response.status} ${response.statusText}` };
                try { errorPayload = await response.json(); } catch (e) { console.warn("Kunne ikke parse feil-JSON ved sletting"); }
                console.error("API Slettefeil Payload:", errorPayload);
                throw new Error(errorPayload.error || `Sletting feilet (${response.status})`);
            }
        } catch (error: any) {
            console.error("Feil under sletting:", error);
            toast.error(`Feil: ${error.message || 'Ukjent feil'}`, { id: toastId });
        } finally {
            setIsDeleting(false);
            // Lukk dialogen manuelt hvis nødvendig (vanligvis ikke med AlertDialog)
            // setMeetingToDelete(null); // Kan gjøres her også
        }
    };
    // -------------------------------

    return (
        <div>
            {/* Overskrift og Legg til-knapp (Dialog) */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200"> Møtedokumenter </h2>
                {isAdmin && (
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"> <PlusCircle className="mr-2 h-4 w-4" /> Legg til dokument </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg ...">
                            <DialogHeader className="px-6 pt-6 pb-4 ...">
                                <DialogTitle className="text-lg text-black  ..."> Last opp nytt møtedokument </DialogTitle>
                                <DialogDescription className="mt-1 ..."> Fyll ut info... </DialogDescription>
                            </DialogHeader>
                             <div className="px-6 pb-6"> <CreateMeetingForm clubId={clubId} onSuccess={handleUploadSuccess} /> </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Møteliste */}
            <div className="space-y-5 mt-5">
                {initialMeetings.length > 0 ? (
                    initialMeetings.map((meeting) => (
                        <div key={meeting.id} className="border ... flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            {/* Venstre side: Tittel, Beskrivelse, Dato */}
                            <div className="flex-grow mb-3 sm:mb-0 pr-4">
                                <h3 className="text-lg font-semibold ...">{meeting.title}</h3>
                                {meeting.description && ( <p className="text-gray-600 ..."> {meeting.description} </p> )}
                                <p className="text-xs text-gray-500 ..."> Publisert: {new Date(meeting.createdAt).toLocaleDateString('nb-NO')} </p>
                            </div>
                            {/* Høyre side: Knapper */}
                            <div className="flex-shrink-0 flex items-center space-x-2">
                                {/* Nedlastingsknapp */}
                                {meeting.cloudinaryPublicId ? (
                                    <Link href={`/api/meetings/${meeting.id}/download`} passHref>
                                        <Button size="sm" variant="outline"> <Download className="mr-2 h-4 w-4" /> Last ned PDF </Button>
                                    </Link>
                                ) : ( <span className="text-xs text-gray-400 italic self-center">Nedlasting utilgjengelig</span> )}

                                {/* ------ SLETT-KNAPP (kun for admin) ------ */}
                                {isAdmin && (
                                     <AlertDialog>
                                         <AlertDialogTrigger asChild>
                                             {/* Bruk outline/destructive variant for slett */}
                                             <Button
                                                 variant="outline"
                                                 size="sm"
                                                 className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                                 onClick={() => openDeleteConfirm(meeting)} // Bare åpner dialogen
                                                 disabled={isDeleting} // Deaktiver under sletting
                                             >
                                                 <Trash2 className="h-4 w-4" /> {/* Ikke mr-2 for ikon-knapp */}
                                             </Button>
                                         </AlertDialogTrigger>
                                         <AlertDialogContent>
                                             <AlertDialogHeader>
                                                 <AlertDialogTitle className='text-black'>Er du sikker?</AlertDialogTitle>
                                                 <AlertDialogDescription>
                                                     Denne handlingen kan ikke angres. Dette vil permanent slette møtedokumentet
                                                     <span className="font-semibold"> "{meetingToDelete?.title}"</span> og tilhørende fil.
                                                 </AlertDialogDescription>
                                             </AlertDialogHeader>
                                             <AlertDialogFooter>
                                                 <AlertDialogCancel className='text-black' disabled={isDeleting}>Avbryt</AlertDialogCancel>
                                                 {/* Kall handleDeleteConfirm når bruker bekrefter */}
                                                 <AlertDialogAction
                                                    onClick={handleDeleteConfirm}
                                                    disabled={isDeleting}
                                                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800" // Destruktiv styling
                                                >
                                                     {isDeleting ? "Sletter..." : "Ja, slett dokument"}
                                                 </AlertDialogAction>
                                             </AlertDialogFooter>
                                         </AlertDialogContent>
                                     </AlertDialog>
                                )}
                                {/* ---------------------------------------- */}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center ..."> Ingen møtedokumenter lagt ut ennå. ... </p>
                )}
            </div>
        </div>
    );
};

export default MeetingManagementSection;