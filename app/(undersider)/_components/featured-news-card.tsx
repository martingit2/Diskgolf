import React, { useState } from 'react'; // Importer useState for feilhåndtering
import Link from 'next/link';
import Image from 'next/image';
import { Category, NewsArticle } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/app/lib/utils';
import { ArticleMetadata } from './news-article-metadata'; // Sørg for at stien er korrekt
import { Newspaper, ArrowRight, ImageOff } from 'lucide-react'; // Ikoner
import { buttonVariants } from '@/components/ui/button'; // For "Les mer"-styling

// --- Type Definitions ---
export type NewsArticleWithDetails = NewsArticle & {
  author: { name: string | null; image: string | null } | null;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
};

// --- Props Interface ---
interface FeaturedNewsCardProps {
  article: NewsArticleWithDetails;
  priority?: boolean; // For LCP optimalisering
  className?: string;
}

// --- FeaturedNewsCard Component ---
export function FeaturedNewsCard({ article, priority = false, className }: FeaturedNewsCardProps) {
  // State for å håndtere bilde-lastefeil
  const [imageError, setImageError] = useState(false);

  // Validering av nødvendig data
  if (!article?.id) {
    console.error("FEIL: FeaturedNewsCard mottok ugyldig artikkel-data:", article);
    return null; // Returnerer null for å unngå rendering av en ugyldig komponent
  }

  // --- Data Preparation ---
  const displayDate = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);
  const authorDisplay = article.author ?? { name: 'Ukjent forfatter', image: null };
  const linkHref = `/nyheter/${article.id}`;
  const imageUrl = article.imageUrl ?? null;
  const shouldShowImage = imageUrl && !imageError;

  // Fallback excerpt generator (robust)
  const createExcerptFallback = (text: string | null | undefined, maxLength = 120): string => {
    if (!text) return 'Ingen ingress tilgjengelig.'; // Tydeligere fallback
    // Fjerner HTML-tags og overflødig whitespace
    const cleanedText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (cleanedText.length <= maxLength) return cleanedText;
    // Finner siste mellomrom før maks lengde for å unngå å kutte midt i et ord
    const truncated = cleanedText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated) + '...';
  };
  const displayExcerpt = article.excerpt || createExcerptFallback(article.content);

  // --- Render ---
  return (
    <article
      className={cn(
        // Grunnleggende struktur og stil
        "group relative flex h-full flex-col overflow-hidden rounded-lg bg-card shadow-md transition-all duration-300",
        // Kantlinjer: Generell først, deretter spesifikk overstyring
        "border border-border/80 dark:border-border/60", // Standard kant
        "border-l-4 border-l-green-500 dark:border-l-green-400", // Grønn venstrekant (overstyrer venstre)
        // Hover-effekter
        "hover:shadow-xl dark:hover:shadow-slate-700/50", // Litt mer markant skygge på mørk modus hover
        className // Tillater eksterne klasser
      )}
      aria-labelledby={`featured-article-title-${article.id}`} // For bedre tilgjengelighet
    >
      {/* Klikkbar lenke som dekker hele kortet (bak innholdet) */}
      <Link href={linkHref} className="absolute inset-0 z-0" aria-label={`Les mer om ${article.title}`} />

      {/* === Bilde-seksjon (med MØRKERE gradient) === */}
      <div className="relative aspect-video w-full overflow-hidden">
        {/* --- Bildelaget (hvis bilde finnes og lastes korrekt) --- */}
        {imageUrl && ( // Kun prøv å rendre Image hvis imageUrl finnes
          <Image
            src={imageUrl}
            alt={`Fremhevet bilde for ${article.title}`}
            fill
            style={{ objectFit: 'cover' }} // Sikrer at bildet dekker området uten forvrengning
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive bildestørrelser
            priority={priority} // Viktig for Largest Contentful Paint hvis dette er "above the fold"
            className={cn(
              "z-0 transition-all duration-500 ease-in-out", // Ligger under gradient (z-0)
              "group-hover:scale-105", // Zoom-effekt på hover
              imageError ? "opacity-0" : "opacity-100" // Skjul hvis feil, vis ellers
            )}
            onError={() => {
              // Håndterer feil ved lasting av bilde
              console.warn(`Bilde feilet lasting: ${imageUrl}`);
              setImageError(true); // Oppdaterer state for å vise fallback
            }}
            unoptimized={process.env.NODE_ENV === 'development'} // Kan være nyttig for lokal utvikling
          />
        )}

        {/* --- Fallback (hvis bilde mangler eller feiler) --- */}
        {/* Vises hvis `imageUrl` er null ELLER `imageError` er true */}
        {!shouldShowImage && (
          <div className="absolute inset-0 z-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/70 dark:from-slate-800 dark:to-slate-800/50 p-4 text-center">
            {imageError ? (
              // Ikon for feilet bilde
              <ImageOff className="h-12 w-12 text-destructive/50 dark:text-red-400/40 mb-2" strokeWidth={1.5} />
            ) : (
              // Ikon for manglende bilde
              <Newspaper className="h-12 w-12 text-muted-foreground/30 dark:text-slate-600/50 mb-2" strokeWidth={1.5} />
            )}
             <span className="text-xs text-muted-foreground/60 dark:text-slate-500/70">
                {imageError ? 'Kunne ikke laste bilde' : 'Bilde mangler'}
             </span>
          </div>
        )}

        {/* --- ✨ MØRKERE GRADIENT OVER BILDET / FALLBACK ✨ --- */}
        {/* Ligger *over* bilde/fallback (z-10), men *under* tekstinnholdet (z-20). */}
        {/* `pointer-events-none` sikrer at den ikke blokkerer for klikk/hover. */}
        {/* Justert til from-black/80 via-black/40 for mørkere effekt */}
        <div
           className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"
           aria-hidden="true"
        />
        {/* ------------------------------------------------------- */}

      </div> {/* Slutt på bilde-seksjon */}


      {/* === Innholdsseksjon === */}
      {/* `relative z-20` sikrer at dette innholdet ligger over gradienten og hovedlenken */}
      <div className="relative z-20 flex flex-grow flex-col p-4 md:p-5">

        {/* Kategorier (hvis de finnes) */}
        {article.categories && article.categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {/* Viser maks 2 kategorier for å unngå rot */}
            {article.categories.slice(0, 2).map(cat => (
              <Badge key={cat.id} variant="secondary" className="text-[10px] font-medium tracking-wide px-1.5 py-0.5">
                {/* Vurder å legge til Link her hvis kategorisider finnes */}
                {/* <Link href={`/kategori/${cat.slug}`} className="relative z-30 hover:underline">{cat.name}</Link> */}
                 {cat.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Tittel */}
        <h3
          id={`featured-article-title-${article.id}`} // Knyttet til article aria-labelledby
          className="mb-2 text-lg font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary md:text-xl line-clamp-3"
        >
            {/* Tittel er ikke en lenke siden hele kortet er klikkbart */}
            {article.title}
        </h3>

        {/* Metadata (forfatter og dato) */}
        <ArticleMetadata
          author={authorDisplay}
          date={displayDate}
          className="mb-3 text-xs text-muted-foreground"
          variant="compact" // Eller annen passende variant definert i ArticleMetadata
        />

        {/* Utdrag / Ingress */}
        <p className="mb-4 flex-grow text-sm text-muted-foreground line-clamp-3">
          {displayExcerpt}
        </p>

        {/* "Les mer"-indikator (visuell, ikke funksjonell lenke) */}
        <div className="mt-auto pt-2"> {/* mt-auto skyver denne til bunnen */}
          <div
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              // Bruker `pointer-events-none` siden hele kortet allerede er en lenke
              "group/link pointer-events-none inline-flex items-center p-0 text-sm font-medium text-primary"
            )}
            aria-hidden="true" // Skjules for skjermlesere da hele kortet er lenken
          >
            Les mer
            {/* Hover-effekt på pilen knyttet til kort-hover (`group-hover` på article) */}
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div> {/* Slutt på innholdsseksjon */}
    </article>
  );
}