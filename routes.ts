/**
* En array av routes som er tilgjengelig for personer
* Som ikke er logget inn. Disse sidene krever ikke authentication
* @type {string[]}
*/

export const publicRoutes = [
    "/",
    "/auth/new-verification"
]


/** 
* En array av routes som brukes til autentisering
* Disse routene skal til slutt route til  user dashboard eller no.
* @type {string[]}
*/

export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/reset",
]

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