// Fil: src/app/(protected)/edit-guide/[pageKey]/page.tsx
// Formål: Side for administratorer for å redigere innholdet på dynamiske guidesider. Tillater lasting, lagring (JSON-format) og tilbakestilling til standardinnhold.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Henter params og router
import { useSession } from 'next-auth/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserRole } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Bruker Textarea som enkel placeholder
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';

// Definerer typen for API-responsen for GET
interface ContentApiResponse {
    useCustom: boolean;
    content: any | null; // 'any' brukes her - bør types nøyere med JSON-strukturen din
}

// Definerer typen for data som sendes ved lagring (POST)
interface SaveContentPayload {
    content: any; // Samme 'any' som over
}


export default function EditGuidePage() {
  const router = useRouter();
  const params = useParams(); // Henter dynamiske parametere { pageKey: '...' }
  const pageKey = params?.pageKey as string | undefined; // Henter ut pageKey

  const { data: session, status: sessionStatus } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  const [isLoading, setIsLoading] = useState(true); // Laster inn data
  const [isSaving, setIsSaving] = useState(false);  // Lagrer data
  const [error, setError] = useState<string | null>(null);
  const [isCustomActive, setIsCustomActive] = useState<boolean>(false); // Bruker siden egendefinert innhold?
  const [editorContent, setEditorContent] = useState<string>(''); // State for innholdet (JSON som string for textarea)

  // --- Hent eksisterende data ---
  const fetchContent = useCallback(async () => {
    if (!pageKey) return; // Ikke hent hvis pageKey mangler

    console.log(`[EditGuidePage] Starter henting for pageKey: ${pageKey}`);
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ContentApiResponse>(`/api/edit-guide/${pageKey}`);
      setIsCustomActive(response.data.useCustom);
      // For textarea, må vi stringify JSON. For en ekte RTE lagrer du objektet.
      setEditorContent(response.data.content ? JSON.stringify(response.data.content, null, 2) : '');
      console.log(`[EditGuidePage] Hentet data: useCustom=${response.data.useCustom}`);
    } catch (err) {
      console.error("[EditGuidePage] Feil ved henting av innhold:", err);
      setError("Kunne ikke laste eksisterende innhold. Du kan fortsatt prøve å lagre nytt innhold.");
      setEditorContent(''); // Nullstill ved feil
      setIsCustomActive(false);
    } finally {
      setIsLoading(false);
      console.log(`[EditGuidePage] Henting ferdig for pageKey: ${pageKey}`);
    }
  }, [pageKey]);

  // Kjør fetchContent når pageKey er tilgjengelig og bruker er admin
  useEffect(() => {
    if (sessionStatus === 'authenticated' && isAdmin && pageKey) {
      fetchContent();
    } else if (sessionStatus === 'authenticated' && !isAdmin) {
        // Håndter ikke-admin her hvis nødvendig, selv om siden bør være beskyttet
        setIsLoading(false);
        setError("Du har ikke tilgang til å redigere denne siden.");
    }
    // Ikke kjør hvis session fortsatt laster
  }, [pageKey, sessionStatus, isAdmin, fetchContent]);


  // --- Lagre innhold ---
  const handleSaveContent = async () => {
    if (!pageKey) return;

    let parsedContent: any;
    try {
        // Viktig: Valider at strengen er gyldig JSON før lagring
        parsedContent = JSON.parse(editorContent || '{}'); // Prøv å parse, bruk tomt objekt som fallback
    } catch (jsonError) {
        toast.error('Ugyldig JSON-format i innholdet. Vennligst korriger før lagring.');
        console.error("JSON Parse Error:", jsonError);
        return;
    }

    const payload: SaveContentPayload = { content: parsedContent };

    setIsSaving(true);
    setError(null);
    const toastId = toast.loading("Lagrer innhold...");

    try {
      await axios.post(`/api/edit-guide/${pageKey}`, payload);
      toast.success("Innhold lagret!", { id: toastId });
      setIsCustomActive(true); // Lagring aktiverer egendefinert innhold
      // Ikke nødvendig å refetch her, vi vet statusen
    } catch (err: any) {
      console.error("[EditGuidePage] Feil ved lagring:", err);
      const errorMsg = err.response?.data?.error || "Kunne ikke lagre innholdet.";
      setError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Tilbakestill til standard ---
  const handleResetToDefault = async () => {
    if (!pageKey) return;

    // Spør om bekreftelse
    if (!window.confirm("Er du sikker på at du vil tilbakestille til standardinnholdet? Alle egendefinerte endringer vil bli deaktivert.")) {
        return;
    }

    setIsSaving(true); // Bruker samme saving-state
    setError(null);
    const toastId = toast.loading("Tilbakestiller til standard...");

    try {
      await axios.put(`/api/edit-guide/${pageKey}`);
      toast.success("Tilbakestilt til standardinnhold!", { id: toastId });
      setIsCustomActive(false); // Tilbakestilling deaktiverer egendefinert innhold
      setEditorContent(''); // Valgfritt: Tøm editoren
      // Du kan også velge å kalle fetchContent() igjen her for å hente standard (som er null)
    } catch (err: any) {
      console.error("[EditGuidePage] Feil ved tilbakestilling:", err);
      const errorMsg = err.response?.data?.error || "Kunne ikke tilbakestille til standard.";
      setError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Renderingslogikk ---

  // Håndter lasting av session
  if (sessionStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner text="Laster sesjon..." />
      </div>
    );
  }

  // Håndter uautorisert tilgang
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Ingen tilgang</h1>
        <p className="mt-4">Du har ikke administratorrettigheter for å redigere denne siden.</p>
        <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Tilbake
        </Button>
      </div>
    );
  }

  // Hovedinnhold for admin
  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Tilbake til guiden
      </Button>

      <h1 className="text-3xl font-bold mb-4">Rediger Guide ({pageKey})</h1>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
        <p>Status: Siden bruker for øyeblikket <strong>{isCustomActive ? 'egendefinert' : 'standard'}</strong> innhold.</p>
        <p className="text-sm mt-1">Endringer du lagrer her vil kun vises hvis 'egendefinert' innhold er aktivt.</p>
      </div>

      {/* Viser feilmelding */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p><strong>Feil:</strong> {error}</p>
        </div>
      )}

      {/* Viser lasteindikator for datahenting */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner text="Laster innhold..." />
        </div>
      ) : (
        // Selve redigeringsområdet
        <div className="space-y-4">
          <label htmlFor="contentEditor" className="block text-sm font-medium text-gray-700">
            Sideinnhold (JSON-format)
          </label>
          {/* 
            !!! PLACEHOLDER !!! 
            Dette <textarea>-feltet BØR erstattes med en skikkelig Rich Text Editor (RTE) 
            som er konfigurert til å produsere og redigere den JSON-strukturen 
            DynamicGuideRenderer forventer (f.eks., Tiptap med egne noder).
            Å redigere kompleks JSON manuelt her er svært feilutsatt.
          */}
          <Textarea
            id="contentEditor"
            rows={25}
            className="font-mono text-sm border rounded shadow-sm p-2" // Litt styling
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder='Lim inn eller skriv sidens innhold i JSON-format her... Eks: [{"type": "hero", "title": "..."}]'
            disabled={isSaving} // Deaktiver mens lagring pågår
          />
           <p className="text-xs text-gray-500">
             Tips: Bruk en online JSON-validator for å sjekke at formatet er korrekt før du lagrer.
           </p>
        </div>
      )}

      {/* Knapper for handlinger */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleSaveContent}
          disabled={isSaving || isLoading} // Deaktivert ved lasting eller lagring
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Lagre Endringer
        </Button>
        <Button
          onClick={handleResetToDefault}
          variant="outline"
          disabled={isSaving || isLoading || !isCustomActive} // Deaktivert hvis standard allerede er i bruk
        >
           {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
          Bruk Standard Innhold
        </Button>
      </div>

    </div>
  );
}