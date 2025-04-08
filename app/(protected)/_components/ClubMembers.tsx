// src/app/(protected)/_components/ClubMembers.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Trash2, UserX, Crown, Loader2 } from 'lucide-react'; // La til Loader2
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Image from 'next/image';
import { removeMembership } from '@/app/actions/remove-membership';


// Typer (samme som før)
interface ClubOption { id: string; name: string; }
interface MemberData { userId: string; clubId: string; name: string; email: string; image?: string | null; status: string; isPrimary: boolean; }
interface ClubMembersProps { managedClubs: ClubOption[]; initialClubId?: string | null; }

const ClubMembers: React.FC<ClubMembersProps> = ({ managedClubs = [], initialClubId }) => {
    // State for valgt klubb - sett initialverdi direkte
    const [selectedClubId, setSelectedClubId] = useState<string>(() => {
        // Funksjon for å bestemme initiell state bare én gang
        return initialClubId || managedClubs[0]?.id || "";
    });
    // Andre states
    const [members, setMembers] = useState<MemberData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [memberToRemove, setMemberToRemove] = useState<MemberData | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    // --- Effekt for å oppdatere selectedClubId NÅR initialClubId (prop) endres ---
    // Denne kjører kun hvis propen utenfra endres.
    useEffect(() => {
        if (initialClubId && initialClubId !== selectedClubId) {
             console.log(`ClubMembers: InitialClubId prop changed to ${initialClubId}, updating selectedClubId.`);
             setSelectedClubId(initialClubId);
             setCurrentPage(1); // Reset side ved prop-endring
         }
         // Hvis initialClubId fjernes, og vi ikke har en gyldig klubb valgt, velg første
         else if (!initialClubId && managedClubs.length > 0 && !managedClubs.some(c => c.id === selectedClubId)) {
              console.log(`ClubMembers: initialClubId removed or invalid, selecting first club.`);
              setSelectedClubId(managedClubs[0].id);
              setCurrentPage(1);
         }
          // Hvis listen over klubber blir tom, nullstill valget
          else if (managedClubs.length === 0 && selectedClubId !== "") {
              console.log(`ClubMembers: No managed clubs, resetting selectedClubId.`);
              setSelectedClubId("");
          }
    }, [initialClubId, managedClubs]); // Fjernet selectedClubId fra deps her!

    // Effekt for å hente medlemmer
    const fetchMembers = useCallback(async () => {
        if (!selectedClubId) {
            setMembers([]); setTotalPages(1); setTotalMembers(0); setError(null); setLoading(false); // Sett loading false her
            return;
        }
        setLoading(true); setError(null);
        try {
            const response = await axios.get(`/api/clubs/${selectedClubId}/members`, { params: { page: currentPage, limit: 10 } });
            setMembers(response.data?.members || []);
            setTotalPages(response.data?.totalPages || 1);
            setTotalMembers(response.data?.totalMembers || 0);
        } catch (err: any) { /* ... (feilhåndtering som før) ... */ }
        finally { setLoading(false); }
    }, [selectedClubId, currentPage]);

    // Kall fetchMembers når selectedClubId eller currentPage endres
    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]); // fetchMembers har nå riktige dependencies

    // Håndter fjerning av medlem
    const handleRemoveMember = useCallback(async () => {
        if (!memberToRemove) return;
        setIsRemoving(true);
        const toastId = toast.loading(`Fjerner ${memberToRemove.name}...`);
        try {
            const result = await removeMembership({ userIdToRemove: memberToRemove.userId, clubId: memberToRemove.clubId });
            if (result.error) throw new Error(result.error);
            toast.success(result.success || "Medlem fjernet.", { id: toastId });
            setMemberToRemove(null);
            // Oppdater data - gå til forrige side hvis siste element fjernes
            if (members.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                fetchMembers(); // Re-fetch samme side
            }
        } catch (error: any) {
            console.error("Feil ved fjerning:", error);
            toast.error(`Kunne ikke fjerne: ${error.message}`, { id: toastId });
        } finally { setIsRemoving(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberToRemove, fetchMembers, currentPage, members.length]); // Legg til dependencies

    // Paginering handlers
    const goToPage = (page: number) => setCurrentPage(page);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));

    // --- JSX (uendret fra forrige, men AlertDialogAction fikset) ---
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Administrer Medlemmer</h2>
            {/* Klubbvelger */}
            <div>
              <label htmlFor="club-member-select" className="block text-sm font-medium text-gray-700 mb-1"> Velg Klubb </label>
              <Select value={selectedClubId} onValueChange={(value) => { if (value) { setSelectedClubId(value); setCurrentPage(1); } }} disabled={loading || managedClubs.length === 0}>
                  <SelectTrigger id="club-member-select" className="w-full sm:w-[300px]"><SelectValue placeholder="Velg..." /></SelectTrigger>
                  <SelectContent>
                      {managedClubs.length === 0 && <SelectItem value="-" disabled>Ingen klubber</SelectItem>}
                      {managedClubs.map((club) => ( <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem> ))}
                  </SelectContent>
              </Select>
            </div>
            {/* Loading / Error / Liste */}
            {loading && (<div className="flex justify-center py-10"><LoadingSpinner text="Laster..." /></div>)}
            {!loading && error && (<p className="text-red-600 text-center py-10">{error}</p>)}
            {!loading && !error && selectedClubId && (
                <>
                    {members.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden shadow-sm">
                             <Table>
                                <TableHeader className="bg-gray-50"><TableRow>
                                    <TableHead className="w-[60px]"></TableHead>
                                    <TableHead>Navn</TableHead><TableHead>E-post</TableHead>
                                    <TableHead className="text-center">Status</TableHead><TableHead className="text-center">Primær</TableHead>
                                    <TableHead className="text-right">Handlinger</TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                    {members.map(member => (
                                        <TableRow key={member.userId}>
                                            <TableCell><Image src={member.image || '/placeholder-avatar.png'} alt={member.name} width={32} height={32} className="rounded-full object-cover" /></TableCell>
                                            <TableCell className="font-medium">{member.name}</TableCell>
                                            <TableCell className="text-gray-600 text-sm">{member.email}</TableCell>
                                            <TableCell className="text-center text-xs"><span className={`px-2 py-0.5 rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{member.status}</span></TableCell>
                                            <TableCell className="text-center">{member.isPrimary && <Crown className="w-4 h-4 text-yellow-500 inline-block" />}</TableCell>
                                            <TableCell className="text-right">
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setMemberToRemove(member)} disabled={isRemoving && memberToRemove?.userId === member.userId} aria-label={`Fjern ${member.name}`}>{isRemoving && memberToRemove?.userId === member.userId ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserX className="h-4 w-4" />}</Button></AlertDialogTrigger>
                                                     {memberToRemove && memberToRemove.userId === member.userId && ( // Vis kun for den valgte
                                                         <AlertDialogContent>
                                                             <AlertDialogHeader><AlertDialogTitle className='text-black'>Fjerne {memberToRemove.name}?</AlertDialogTitle><AlertDialogDescription className='text-black'>Er du sikker på at du vil fjerne {memberToRemove.name} ({memberToRemove.email})?</AlertDialogDescription></AlertDialogHeader>
                                                             <AlertDialogFooter>
                                                                 <AlertDialogCancel className='text-black bg-gray-50' onClick={() => setMemberToRemove(null)} disabled={isRemoving}>Avbryt</AlertDialogCancel>
                                                                 {/* Korrigert: Bruker handleRemoveMember direkte */}
                                                                 <AlertDialogAction onClick={handleRemoveMember} disabled={isRemoving} className="bg-red-600 hover:bg-red-700">{isRemoving ? "Fjerner..." : "Ja, fjern medlem"}</AlertDialogAction>
                                                             </AlertDialogFooter>
                                                         </AlertDialogContent>
                                                     )}
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : ( <p className="text-center text-gray-500 py-10">Ingen medlemmer.</p> )}
                    {/* Paginering */}
                    {totalPages > 1 && ( <div className="mt-6 flex justify-center"><Pagination><PaginationContent>
                        <PaginationItem><PaginationPrevious onClick={() => { if (currentPage > 1) prevPage(); }} aria-disabled={currentPage === 1} className={`${currentPage === 1 ? 'opacity-50' : ''}`} /></PaginationItem>
                        {[...Array(totalPages)].map((_, i) => ( <PaginationItem key={i}> <PaginationLink href="#" onClick={(e) => { e.preventDefault(); goToPage(i + 1); }} isActive={currentPage === i + 1}>{i + 1}</PaginationLink> </PaginationItem> ))}
                        <PaginationItem><PaginationNext onClick={() => { if (currentPage < totalPages) nextPage(); }} aria-disabled={currentPage === totalPages} className={`${currentPage === totalPages ? 'opacity-50' : ''}`} /></PaginationItem>
                    </PaginationContent></Pagination></div> )}
                </>
            )}
             {!loading && !error && !selectedClubId && managedClubs.length > 0 && ( <p className="text-center text-gray-500 py-10">Velg klubb.</p> )}
        </div>
    );
};

export default ClubMembers;