// app/(undersider)/nyheter/_components/news-form-modal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import { NewsArticle } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, XCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

// Zod schema (uendret)
const formSchema = z.object({
  title: z.string().min(3, { message: "Tittel må ha minst 3 tegn." }),
  content: z.string().min(10, { message: "Innhold må ha minst 10 tegn." }),
  isPublished: z.boolean().default(false),
});

type NewsFormValues = z.infer<typeof formSchema>;

interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: NewsArticle | null;
}

// API Error handler (uendret)
const handleApiError = (error: any, defaultMessage: string) => {
     let message = defaultMessage;
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const fieldErrors = axiosError.response?.data?.errors;
        if (fieldErrors && typeof fieldErrors === 'object') {
             const firstFieldName = Object.keys(fieldErrors)[0];
            if (firstFieldName && fieldErrors[firstFieldName]?._errors?.length > 0) {
                 message = fieldErrors[firstFieldName]._errors[0];
            } else {
                message = axiosError.response?.data?.error || `${axiosError.response?.status}: ${axiosError.response?.statusText || 'Ukjent feil'}`;
            }
        } else if (axiosError.response?.data?.error) {
            message = axiosError.response.data.error;
        }
    } else if (error instanceof Error) {
        message = error.message;
    }
    console.error('API Error:', error);
    toast.error(message);
};

export function NewsFormModal({ isOpen, onClose, onSuccess, initialData }: NewsFormModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      content: initialData.content,
      isPublished: initialData.isPublished,
    } : { title: '', content: '', isPublished: false },
  });

  // useEffects (uendret)
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(initialData?.imageUrl ?? null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, initialData?.imageUrl]);

  useEffect(() => {
    if (isOpen) {
        form.reset(initialData ? {
            title: initialData.title,
            content: initialData.content,
            isPublished: initialData.isPublished,
        } : { title: '', content: '', isPublished: false });
        setSelectedFile(null);
        setPreviewUrl(initialData?.imageUrl ?? null);
    }
  }, [initialData, isOpen, form]);

  // Handlers (uendret)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { toast.error("Filen er for stor (maks 10MB)."); return; }
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) { toast.error("Ugyldig filtype (kun JPG, PNG, WEBP, GIF)."); return; }
      setSelectedFile(file);
    }
  };
  const handleRemoveImage = () => {
      setSelectedFile(null); setPreviewUrl(null);
      if (fileInputRef.current) { fileInputRef.current.value = ""; }
  }
  const onSubmit = async (values: NewsFormValues) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('content', values.content);
    formData.append('isPublished', String(values.isPublished));
    if (selectedFile) { formData.append('image', selectedFile); }
    else if (!previewUrl && initialData?.imageUrl) { formData.append('removeImage', 'true'); }
    try {
      if (initialData) { await axios.put(`/api/news/${initialData.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); }
      else { await axios.post('/api/news', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); }
      toast.success(initialData ? 'Nyhetsartikkel oppdatert!' : 'Nyhetsartikkel opprettet!');
      onSuccess(); onClose();
    } catch (error: any) { handleApiError(error, 'En feil oppstod ved lagring.'); }
    finally { setIsLoading(false); }
  };
  const handleClose = () => { if (!isLoading) onClose(); };

  // --- Rendering med justeringer i FormControl ---
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Rediger nyhetsartikkel' : 'Opprett nyhetsartikkel'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Gjør endringer i artikkelen.' : 'Fyll ut detaljene og last opp et bilde.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Tittel */}
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tittel *</FormLabel>
                  {/* --- WRAPPER --- */}
                  <FormControl><div><Input placeholder="Overskrift..." {...field} disabled={isLoading} /></div></FormControl>
                  <FormMessage />
                </FormItem>
             )} />

            {/* Innhold */}
            <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormLabel>Innhold *</FormLabel>
                  {/* --- WRAPPER --- */}
                  <FormControl><div><Textarea placeholder="Artikkeltekst..." {...field} rows={8} disabled={isLoading} /></div></FormControl>
                  <FormMessage />
                </FormItem>
            )} />

            {/* Bildeopplasting */}
            <FormItem>
                <FormLabel>Bilde (valgfritt)</FormLabel>
                 {/* --- WRAPPER (kun rundt det skjulte input-feltet) --- */}
                 <FormControl>
                    <div>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg, image/png, image/webp, image/gif"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isLoading}
                        />
                    </div>
                 </FormControl>
                 {/* Knapp og preview er utenfor FormControl */}
                 <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    {selectedFile ? `Valgt: ${selectedFile.name}` : previewUrl ? 'Bytt bilde' : 'Velg bilde'}
                 </Button>
                 {previewUrl && (
                    <div className="mt-4 relative group w-full aspect-video rounded border bg-muted overflow-hidden">
                       <Image src={previewUrl} alt="Forhåndsvisning" layout="fill" objectFit="contain" />
                       <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-7 w-7" onClick={handleRemoveImage} disabled={isLoading} title="Fjern bilde">
                           <XCircle className="h-4 w-4" />
                       </Button>
                    </div>
                 )}
                 <FormDescription>Last opp bilde (JPG, PNG, WEBP, GIF, maks 10MB).</FormDescription>
            </FormItem>

            {/* Publiseringsstatus */}
            <FormField control={form.control} name="isPublished" render={({ field }) => (
                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel>Publiser</FormLabel>
                        <FormDescription>Gjør artikkelen synlig for alle.</FormDescription>
                    </div>
                    {/* --- WRAPPER --- */}
                    <FormControl><div><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} /></div></FormControl>
                 </FormItem>
            )} />

            <DialogFooter>
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