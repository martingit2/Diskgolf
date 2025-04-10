/**
 * Filnavn: routes.ts
 * Beskrivelse: Definerer ruter for offentlig tilgang, autentisering og API-bruk i DiskGolf-applikasjonen.
 * Inkluderer standard omdirigeringsbane etter innlogging.
 * Utvikler: Martin Pettersen
 */

/**
* En array av routes som er tilgjengelig for personer.
* Som ikke er logget inn. Disse sidene krever ikke authentication
* @type {string[]}
*/
export const publicRoutes = [
    "/",
    "/auth/new-verification",
    "/settings",
    "/spill",
    "/spill/solo/[id]", 
    "/api/",
    "/api/search",
    "/nyheter",
    "/faq",
    "/turneringer",
    "/turneringer/ny",
    "/turneringer/[id]",
    "/turneringer/id/",
    "/klubber",
    "/klubb",
    "/klubb/[id]",
    "/klubber/[id]", // Lagt til for dynamisk klubb side (flertall)
    "/baner",
    "/guide",
    "/arrangementer",
    "/kontakt",
    "/medlemskap",
    "/om-oss",
    "/personvern",
    "/vilkar",
    "/api/clubs",
    "/api/tournaments",
    "/api/tournaments/join",
    "/api/tournaments/[id]",
    "/dashboard",
    "/dashboard/user",
    "/turnering/ny",
    "/turnering",
    "/dashboard/user/stats",
    "/map",
    "/weather",
    "/api/weather",
    "/api/courses",
    "/find-course",
    "/courses/[id]",
    "/courses",
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
export const DEFAULT_LOGIN_REDIRECT = "/settings";