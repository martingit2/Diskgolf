/** 
 * Filnavn: types.ts
 * Beskrivelse: Definerer brukerobjektets struktur i applikasjonen. 
 * Inkluderer egenskaper som ID, navn, e-post, rolle og sikkerhetsinnstillinger.
 * Utvikler: Martin Pettersen
 */


export type User = {
  id: string; 
  name: string; 
  email: string; 
  image?: string | null; 
  role: string; 
  isTwoFactorEnable?: boolean; 
  isOAuth: boolean; 
  favoriteCourses: string[]; 
};