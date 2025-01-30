/** 
 * Filnavn: routes.ts
 * Beskrivelse: Definerer ruter for offentlig tilgang, autentisering og API-bruk i DiskGolf-applikasjonen.
 * Inkluderer standard omdirigeringsbane etter innlogging.
 * Utvikler: Martin Pettersen
 */




/**
* En array av routes som er tilgjengelig for personer
* Som ikke er logget inn. Disse sidene krever ikke authentication
* @type {string[]}
*/

export const publicRoutes = [
    "/",
    "/auth/new-verification",
    "/settings",
    "/spill",
    "/api/",
    "/api/search",
    "/nyheter",
    "/faq",
    "/turneringer",
    "/turneringer/ny",  // Legg til ruten for å opprette ny turnering
    "/turneringer/[id]", // Legg til ruten for turneringsvisning med ID
    "/turneringer/id/",
    "/klubber",
    "/klubb",
    "/klubb/[id]",
    "/baner",
    "/guide",
    "/arrangementer",
    "/kontakt",
    "/medlemskap",
    "/om-oss",
    "/personvern",
    "/vilkar",
    "/api/clubs",
    "/api/tournaments", // API-rute for å hente turneringer
    "/api/tournaments/join", // API-rute for å bli med i turneringen
    "/api/tournaments/[id]", // API-rute for turnering med ID
    "/dashboard",
    "/dashboard/user",
    "/turnering/ny",
    "/turnering",
    "/dashboard/user/stats",
    "/weather",
    "/api/weather",
    "/api/courses",
];

/** 
* En array av routes som brukes til autentisering
* @type {string[]}
*/

export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/reset",
    "/auth/new-password",
    "/test",
];

/**
* Prefix for API autentisering routes.
* routes som starter med denne prefixen er brukt for API.
* @type {string}
*/


export const apiAuthPrefix = "/api/auth";

/**
* DEfault redirect etter innlogingen
* @type {string}
*/

export const DEFAULT_LOGIN_REDIRECT = "/settings"