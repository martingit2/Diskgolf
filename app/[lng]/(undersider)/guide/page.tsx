// src/app/guide/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

import LoadingSpinner from '@/components/ui/loading-spinner'; // Antar du har en slik
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { StaticGuideContent } from '@/components/StaticGuideContent';
import { DynamicGuideRenderer } from '@/components/DynamicGuideRenderer';

// Definerer typen for API-responsen
interface ContentApiResponse {
    useCustom: boolean;
    content: any | null; // 'any' er brukt her, men bør types bedre basert på JSON-strukturen
}

export default function DiscgolfGuidePageLoader() {
  // State for å holde API-responsen
  const [contentData, setContentData] = useState<ContentApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession(); // Hent session for å sjekke admin-rolle

  const isAdmin = session?.user?.role === UserRole.ADMIN;
  const pageKey = "guide"; // Definer nøkkelen for denne siden

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`[GuidePage] Starter henting for pageKey: ${pageKey}`);
      try {
        // ------ VIKTIG: Bruker korrekt API-sti her ------
        const response = await axios.get<ContentApiResponse>(`/api/edit-guide/${pageKey}`);
        setContentData(response.data);
         console.log(`[GuidePage] Hentet data: useCustom=${response.data.useCustom}`);
      } catch (err) {
        console.error("[GuidePage] Feil ved henting av guideinnhold:", err);
        setError("Kunne ikke laste innholdet for guiden. Viser standardversjon.");
        // Fall tilbake til standard ved feil
        setContentData({ useCustom: false, content: null });
      } finally {
        setIsLoading(false);
         console.log(`[GuidePage] Henting ferdig for pageKey: ${pageKey}`);
      }
    };

    fetchContent();
  }, []); // Tomt array betyr kjør kun ved første lasting

  // --- Hjelpekomponent for å rendre innhold ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner text="Laster guide..." />
        </div>
      );
    }

    if (error && !contentData?.useCustom) { // Viser feil OG standard hvis feil OG ikke satt til custom
      return (
        <>
          <p className="text-center text-red-600 mb-8 bg-red-50 p-4 rounded border border-red-200">{error}</p>
          <StaticGuideContent />
        </>
      );
    }

    if (contentData?.useCustom && contentData.content) {
        console.log("[GuidePage] Rendrer dynamisk innhold.");
      // Render dynamisk innhold hvis useCustom er true og content finnes
      return <DynamicGuideRenderer content={contentData.content} />;
    } else {
        console.log("[GuidePage] Rendrer statisk standardinnhold.");
      // Render standard statisk innhold ellers (eller hvis content er null selv om useCustom er true)
      return <StaticGuideContent />;
    }
  };
  // --------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Sentrert innholds-wrapper */}
      <div className="max-w-7xl mx-auto relative"> {/* Sørg for at denne har relativ posisjonering */}

        {/* Rediger-knapp for Admin */}
        {isAdmin && (
          <div className="absolute top-0 right-0 -mt-8 sm:-mt-4 z-10">
            {/* ------ KORREKT STI I HREF HER ------ */}
            <Link href={`/edit-guide/${pageKey}`} passHref legacyBehavior>
              <a>
                <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 shadow">
                  <Edit className="w-4 h-4 mr-2" /> Rediger Side
                </Button>
              </a>
            </Link>
            {/* ------------------------------------- */}
          </div>
        )}

        {/* Render innholdet */}
        {renderContent()}

      </div>
    </div>
  );
}