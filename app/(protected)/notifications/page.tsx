// app/(protected)/notifications/page.tsx


import { UserRole } from "@prisma/client";
import { redirect } from 'next/navigation'; // For redirect av uautoriserte
import { AlertTriangle } from 'lucide-react'; // For et ikon i tittelen
import { currentUser } from "@/app/lib/auth";
import DashboardNotifications from "../_components/DashboardNotifications";

// Metadata for siden
export const metadata = {
  title: "Varsler - Feilrapporter",
  description: "Oversikt over innmeldte feil på discgolfbaner.",
};

export default async function NotificationsPage() {
  const user = await currentUser();

  // Sikkerhetssjekk: Kun Admin og Club Leader har tilgang
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.CLUB_LEADER)) {
    redirect('/'); // Send uautoriserte brukere til forsiden
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 border-b pb-3">
         <AlertTriangle className="h-7 w-7 text-orange-500 flex-shrink-0" />
         <h1 className="text-3xl font-bold text-gray-800">
            Varsler om Banefeil
         </h1>
      </div>

      <p className="mb-8 text-gray-600">
        Her ser du en oversikt over feilrapporter som er sendt inn for banene du har tilgang til.
        {user.role === UserRole.ADMIN && " Som administrator ser du rapporter for alle baner."}
        {user.role === UserRole.CLUB_LEADER && " Som klubbleder ser du rapporter for baner tilknyttet dine klubber."}
      </p>

      {/* Selve varsel/rapport-komponenten */}
      <DashboardNotifications />

       {/* Eventuelt legg til en knapp for å gå tilbake eller lignende */}
       {/* <div className="mt-8">
            <button onClick={() => window.history.back()} className="text-blue-600 hover:underline">
                ← Tilbake
            </button>
       </div> */}

    </div>
  );
}