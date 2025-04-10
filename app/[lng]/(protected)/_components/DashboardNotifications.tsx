// components/DashboardNotifications.tsx (eller app/(protected)/_components/DashboardNotifications.tsx)
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { AlertTriangle, CheckCircle, Clock, HelpCircle, Loader2, ChevronDown } from 'lucide-react';
import { ErrorReport, ErrorReportStatus, UserRole } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ------------------------------------

console.log("Imported DropdownMenu type:", typeof DropdownMenu, DropdownMenu);
// ---------------------------------------------

import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/dropdown-menu-notification"; 

// Type for rapportene vi henter fra API
type FetchedErrorReport = ErrorReport & {
  course: { id: string; name: string };
  user: { id: string; name: string | null };
};

// Tilgjengelige statuser for dropdown
const availableStatuses: ErrorReportStatus[] = [
  ErrorReportStatus.OPEN,
  ErrorReportStatus.IN_PROGRESS,
  ErrorReportStatus.RESOLVED,
  ErrorReportStatus.IGNORED,
];

// Hjelpefunksjon for status-badger
const getStatusBadgeContent = (status: ErrorReportStatus) => {
  switch (status) {
    case ErrorReportStatus.OPEN:
      return <><AlertTriangle className="h-3 w-3 mr-1" /> Åpen</>;
    case ErrorReportStatus.IN_PROGRESS:
      return <><Clock className="h-3 w-3 mr-1" /> Pågår</>;
    case ErrorReportStatus.RESOLVED:
      return <><CheckCircle className="h-3 w-3 mr-1" /> Løst</>;
    case ErrorReportStatus.IGNORED:
        return <><HelpCircle className="h-3 w-3 mr-1" /> Ignorert</>;
    default:
      return <>Ukjent</>;
  }
};

// Hjelpefunksjon for badge variant basert på status
const getBadgeVariant = (status: ErrorReportStatus): "destructive" | "secondary" | "default" | "outline" => {
     switch (status) {
        case ErrorReportStatus.OPEN: return "destructive";
        case ErrorReportStatus.IN_PROGRESS: return "secondary";
        case ErrorReportStatus.RESOLVED: return "default";
        case ErrorReportStatus.IGNORED: return "outline";
        default: return "outline";
    }
}


export default function DashboardNotifications() {
  const { data: session, status: sessionStatus } = useSession();
  const [reports, setReports] = useState<FetchedErrorReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Funksjon for å hente rapporter
  const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
       if (sessionStatus === 'authenticated' && (session?.user?.role === UserRole.ADMIN || session?.user?.role === UserRole.CLUB_LEADER)) {
        try {
          const response = await fetch('/api/error-reports');
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Ukjent feil ved henting' }));
            throw new Error(errorData.error || 'Kunne ikke hente feilrapporter');
          }
          const data: FetchedErrorReport[] = await response.json();
          setReports(data);
        } catch (err: any) {
          console.error("Feil ved henting av rapporter:", err);
          setError(err.message || 'En feil oppstod.');
        } finally {
          setIsLoading(false);
        }
      } else {
          setIsLoading(false);
      }
  };


  useEffect(() => {
    fetchReports();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.user?.id]); // Kjør hvis sesjonsstatus eller bruker-ID endres

  // Funksjon for å håndtere statusoppdatering
  const handleStatusUpdate = (reportId: string, newStatus: ErrorReportStatus) => {
    if (isPending && updatingId === reportId) return;
    setUpdatingId(reportId);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/error-reports/${reportId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Ukjent feil ved oppdatering' }));
          toast.error(errorData.error || `Feil: ${response.statusText}`);
          setUpdatingId(null);
          return;
        }

        const updatedReport: FetchedErrorReport = await response.json();

        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId ? { ...report, status: updatedReport.status, updatedAt: updatedReport.updatedAt } : report
          )
        );
        toast.success(`Status oppdatert til ${newStatus.replace('_', ' ').toLowerCase()}!`);

      } catch (err) {
        console.error("Feil under statusoppdatering:", err);
        toast.error('En uventet feil oppstod under oppdatering.');
      } finally {
        if (updatingId === reportId) { // Sjekk igjen før nullstilling
            setUpdatingId(null);
        }
      }
    });
  };

  // ----- Rendering Logic -----

  if (isLoading || sessionStatus === 'loading') {
    return (
       <Card>
         <CardHeader> <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-orange-500" /> Feilrapporter</CardTitle> <CardDescription>Laster inn rapporter...</CardDescription> </CardHeader>
         <CardContent className="flex justify-center items-center py-10"> <Loader2 className="h-8 w-8 animate-spin text-gray-500" /> </CardContent>
       </Card>
    );
  }

  if (sessionStatus !== 'authenticated' || (session?.user?.role !== UserRole.ADMIN && session?.user?.role !== UserRole.CLUB_LEADER)) {
     return null;
  }

  if (error) {
     return (
       <Card className="border-red-500">
         <CardHeader> <CardTitle className="flex items-center text-red-600"><AlertTriangle className="mr-2 h-5 w-5" /> Feil</CardTitle> <CardDescription className="text-red-500">Kunne ikke laste feilrapporter</CardDescription> </CardHeader>
         <CardContent> <p>{error}</p> </CardContent>
       </Card>
    );
  }

  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center"> <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" /> Nylige Feilrapporter ({reports.length}) </CardTitle>
        <CardDescription> {session?.user?.role === UserRole.ADMIN ? "Oversikt over alle innmeldte feil på baner. Klikk på status for å endre." : "Oversikt over innmeldte feil på baner tilknyttet dine klubber. Klikk på status for å endre."} </CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">Ingen feilrapporter å vise.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Status</TableHead>
                  <TableHead>Bane</TableHead>
                  <TableHead>Beskrivelse</TableHead>
                  <TableHead>Rapportert av</TableHead>
                  <TableHead className="text-right">Tidspunkt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {/* --- Dropdown for statusendring --- */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2 py-1 h-auto w-full justify-start" disabled={isPending && updatingId === report.id} >
                            {isPending && updatingId === report.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Badge variant={getBadgeVariant(report.status)} className="flex-shrink-0">
                                {getStatusBadgeContent(report.status)}
                              </Badge>
                            )}
                            <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground opacity-70 flex-shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {availableStatuses.map((statusOption) => (
                            <DropdownMenuItem
                              key={statusOption}
                              onSelect={() => handleStatusUpdate(report.id, statusOption)}
                              disabled={report.status === statusOption || (isPending && updatingId === report.id)}
                              className={report.status === statusOption ? 'font-semibold bg-accent' : ''}
                            >
                              {getStatusBadgeContent(statusOption)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* --- Slutt på Dropdown --- */}
                    </TableCell>
                    <TableCell className="font-medium">{report.course.name}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate" title={report.description}> {report.description} </TableCell>
                    <TableCell className="text-sm text-gray-500">{report.user?.name || 'Ukjent bruker'}</TableCell>
                    <TableCell className="text-right text-xs text-gray-500"> {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: nb })} </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}