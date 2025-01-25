/** 
 * Filnavn: types.ts
 * Beskrivelse: Definerer brukerobjektets struktur i applikasjonen. 
 * Inkluderer egenskaper som ID, navn, e-post, rolle og sikkerhetsinnstillinger.
 * Utvikler: Martin Pettersen
 */


export type User = {
    id: string; // Unik ID for brukeren
    name: string; // Brukernavn, alltid string
    email: string; // Brukerens e-postadresse
    image?: string | null; // Bilde-URL, kan være null
    role: string; // Brukerens rolle, f.eks. "Admin", "User", etc.
    isTwoFactorEnable?: boolean; // Om tofaktorautentisering er aktivert
    isOAuth: boolean; // Om brukeren er logget inn via OAuth
  };
  