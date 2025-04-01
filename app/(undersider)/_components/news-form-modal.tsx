// app/(undersider)/_components/news-form-modal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import { NewsArticle, Category } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, XCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import RichTextEditor from './rich-text-editor'; // Juster sti om nødvendig
import { cn } from '@/app/lib/utils'; // Juster sti om nødvendig
import { MultiSelect } from '@/components/ui/mutli-select';


// Zod schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Tittel må ha minst 3 tegn." }).max(150, { message: "Tittel kan maks ha 150 tegn." }),
  content: z.string().min(15, { message: "Innhold må ha minst 15 tegn (inkludert formatering)." }),
  isPublished: z.boolean().default(false),
  categoryIds: z.array(z.string().uuid({ message: "Ugyldig kategori ID format." })).optional().default([]),
});

type NewsFormValues = z.infer<typeof formSchema>;

// Type for kategori-opsjoner
interface CategoryOption {
    value: string;
    label: string;
}

// --- VIKTIG: Oppdatert type for initialData ---
interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: (NewsArticle & {
      // Inkluder alle felter som trengs fra NewsArticleWithDetails
      author: { name: string | null; image: string | null } | null;
      // Denne MÅ matche strukturen sendt fra page.tsx
      categories: Pick<Category, 'id' | 'name' | 'slug'>[];
  }) | null;
}
// --- SLUTT VIKTIG ---

// API Error handler
const handleApiError = (error: any, defaultMessage: string) => {
    let message = defaultMessage;
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const fieldErrors = axiosError.response?.data?.errors;
        if (fieldErrors && typeof fieldErrors === 'object') {
            const firstFieldName = Object.keys(fieldErrors)[0];
            const errorDetail = fieldErrors[firstFieldName];
            if (Array.isArray(errorDetail) && errorDetail.length > 0 && typeof errorDetail[0] === 'string') {
                message = errorDetail[0];
            } else if (typeof errorDetail === 'string') {
                message = errorDetail;
            } else if (typeof errorDetail?.[0] === 'string') {
                message = errorDetail[0];
            } else {
                message = axiosError.response?.data?.error || `${axiosError.response?.status}: ${axiosError.response?.statusText || 'Ukjent feil'}`;
            }
        } else if (axiosError.response?.data?.error) {
            message = axiosError.response.data.error;
        } else if (axiosError.response?.status === 404) {
            // Spesifikk melding for 404
            message = `Kunne ikke finne ressursen (${axiosError.config?.url || ''}).`;
        }
         else if (axiosError.response?.status) {
            message = `Feil ${axiosError.response.status}: ${axiosError.message}`;
        } else if (axiosError.request) {
            message = "Ingen respons fra server. Sjekk nettverket.";
        }
    } else if (error instanceof Error) {
        message = error.message;
    }
    console.error('API Error:', error); // Logg hele feilobjektet
    toast.error(message, { duration: 5000 });
};


export function NewsFormModal({ isOpen, onClose, onSuccess, initialData }: NewsFormModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    // Setter defaultValues basert på den (nå korrekte) initialData-typen
    defaultValues: initialData ? {
      title: initialData.title,
      content: initialData.content ?? '<p></p>',
      isPublished: initialData.isPublished,
      categoryIds: initialData.categories.map(cat => cat.id), // Bruker ID fra initialData.categories
    } : {
        title: '',
        content: '<p></p>',
        isPublished: false,
        categoryIds: []
    },
  });

  // Hent kategorier
  useEffect(() => {
      const fetchCategories = async () => {
          setLoadingCategories(true);
          try {
              // ** SJEKK AT DENNE URLEN ER KORREKT **
              const response = await axios.get<Pick<Category, 'id' | 'name'>[]>('/api/news/categories');
              setCategoryOptions(response.data.map(cat => ({ value: cat.id, label: cat.name })));
          } catch (error) {
              // Vis feil til brukeren hvis kategorier ikke kan lastes
              handleApiError(error, "Kunne ikke laste kategorier.");
              // console.error("Kunne ikke laste kategorier:", error); // Redundant hvis handleApiError logger
              // toast.error("Kunne ikke laste kategorier for valg."); // Redundant hvis handleApiError toaster
          } finally {
              setLoadingCategories(false);
          }
      };
      if (isOpen) {
          fetchCategories();
      }
  }, [isOpen]);


  // Reset form (uendret logikk, men avhenger av korrekt initialData-type)
   useEffect(() => {
    if (isOpen) {
        form.reset(initialData ? {
            title: initialData.title,
            content: initialData.content ?? '<p></p>',
            isPublished: initialData.isPublished,
            categoryIds: initialData.categories.map(cat => cat.id) // Bruker nå korrekt type
        } : {
            title: '', content: '<p></p>', isPublished: false, categoryIds: []
        });
        setSelectedFile(null);
        setPreviewUrl(initialData?.imageUrl ?? null);
    }
  }, [initialData, isOpen, form]);

    // Oppdater preview (uendret)
    useEffect(() => {
        if (!selectedFile) { return; }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);


  // Handlers (uendret)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast.error("Filen er for stor (maks 10MB)."); return; }
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) { toast.error("Ugyldig filtype (kun JPG, PNG, WEBP, GIF)."); return; }
        setSelectedFile(file);
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) { fileInputRef.current.value = ""; }
        if (initialData?.imageUrl) {
            console.log("Markerer for fjerning av eksisterende bilde ved lagring.");
        }
    };

    const onSubmit = async (values: NewsFormValues) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('content', values.content);
        formData.append('isPublished', String(values.isPublished));
        values.categoryIds?.forEach(id => formData.append('categoryIds', id));
        if (selectedFile) {
            formData.append('image', selectedFile);
        } else if (!previewUrl && initialData?.imageUrl) {
            formData.append('removeImage', 'true');
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (initialData) {
                await axios.put(`/api/news/${initialData.id}`, formData, config);
            } else {
                await axios.post('/api/news', formData, config);
            }
            toast.success(initialData ? 'Nyhetsartikkel oppdatert!' : 'Nyhetsartikkel opprettet!', {
                icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            handleApiError(error, `Kunne ikke ${initialData ? 'oppdatere' : 'opprette'} artikkelen.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => { if (!isLoading) onClose(); };

  // --- Rendering (med korrekt MultiSelect import) ---
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Rediger nyhetsartikkel' : 'Opprett nyhetsartikkel'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Gjør endringer i artikkelen.' : 'Skriv artikkelen med formatering og legg til detaljer.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[75vh] overflow-y-auto pr-2">
            {/* Tittel */}
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tittel *</FormLabel>
                  <FormControl>
                      <Input placeholder=" fengende tittel..." {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
             )} />

            {/* Rich Text Editor */}
            <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Innhold *</FormLabel>
                        <FormControl>
                            <RichTextEditor
                                content={field.value}
                                onChange={field.onChange}
                                disabled={isLoading}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

             {/* Kategori Velger */}
             <FormField
                control={form.control}
                name="categoryIds"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Kategorier</FormLabel>
                        <FormControl>
                           <MultiSelect // ** Bruker den importerte komponenten **
                                options={categoryOptions}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder={loadingCategories ? "Laster kategorier..." : "Velg kategorier..."}
                                disabled={isLoading || loadingCategories}
                                className="w-full"
                           />
                        </FormControl>
                        <FormDescription>Velg en eller flere relevante kategorier.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Bildeopplasting */}
            <FormItem>
                <FormLabel>Fremhevet bilde (valgfritt)</FormLabel>
                 <FormControl>
                    <div>
                        <Input
                            ref={fileInputRef} type="file" id="news-image-upload"
                            accept="image/jpeg, image/png, image/webp, image/gif"
                            onChange={handleFileChange} className="sr-only"
                            disabled={isLoading} aria-describedby="image-description"
                        />
                    </div>
                 </FormControl>
                 <label
                     htmlFor="news-image-upload"
                     className={cn(
                        "mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium ring-offset-background",
                        "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isLoading ? "cursor-not-allowed opacity-50" : ""
                     )}
                     tabIndex={isLoading ? -1 : 0}
                     onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                 >
                    <Upload className="h-4 w-4" />
                    {selectedFile ? `Bytt bilde (${selectedFile.name})` : previewUrl ? 'Bytt bilde' : 'Velg bilde'}
                 </label>
                 {previewUrl && (
                    <div className="mt-4 relative group w-full aspect-video rounded-md border bg-muted overflow-hidden shadow-inner">
                       <Image src={previewUrl} alt="Forhåndsvisning av valgt bilde" fill style={{objectFit: "contain"}} />
                       <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 rounded-full shadow-md" onClick={handleRemoveImage} disabled={isLoading} title="Fjern bilde">
                           <XCircle className="h-5 w-5" />
                       </Button>
                    </div>
                 )}
                 <FormDescription id="image-description">
                    Anbefalt format: JPG, PNG, WEBP. Maks 10MB. Bildet vises øverst i artikkelen.
                 </FormDescription>
            </FormItem>

            {/* Publiseringsstatus */}
            <FormField control={form.control} name="isPublished" render={({ field }) => (
                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Publiser artikkel</FormLabel>
                        <FormDescription>Gjør artikkelen synlig for alle besøkende.</FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value} onCheckedChange={field.onChange}
                            disabled={isLoading} aria-label="Publiseringsstatus"
                            className="data-[state=checked]:bg-primary"
                         />
                    </FormControl>
                 </FormItem>
            )} />

            <DialogFooter className="pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>Avbryt</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Lagre endringer' : 'Opprett artikkel'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}