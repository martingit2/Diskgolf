// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import acceptLanguage from 'accept-language';

// Prosjektinterne imports for ruter og i18n-innstillinger
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from './routes';
import { cookieName, fallbackLng, languages } from './app/lib/i18n/settings';

// Registrerer støttede språk for 'accept-language'-biblioteket
acceptLanguage.languages([...languages]);

// Konfigurasjon for hvilke stier middlewaren skal kjøre på
export const config = {
  // Ignorerer API-kall, statiske filer, bilder, assets, etc.
  matcher: '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|trpc|.*\\.\\w+).*)',
};

/**
 * Hjelpefunksjon for å sjekke om en gitt sti matcher et offentlig rute-mønster.
 * Håndterer både eksakte treff og dynamiske mønstre definert i publicRoutes.
 * @param path Stien uten språkprefiks (f.eks. '/nyheter', '/turneringer/123').
 * @param publicPatterns Array med offentlige rute-strenger/mønstre fra routes.ts.
 * @returns boolean True hvis stien er offentlig, ellers false.
 */
function isPathPublic(path: string, publicPatterns: string[]): boolean {
    // Sjekk for eksakt match (for statiske ruter som '/', '/nyheter', etc.)
    if (publicPatterns.includes(path)) {
        return true;
    }

    // Sjekk for dynamiske mønstre
    // Tilpass disse 'startsWith'-sjekkene basert på *dine* dynamiske ruter i publicRoutes
    if (path.startsWith('/turneringer/') && publicPatterns.includes('/turneringer/[id]')) {
       return true;
    }
    if (path.startsWith('/klubb/') && publicPatterns.includes('/klubb/[id]')) {
       return true;
    }
    if (path.startsWith('/courses/') && publicPatterns.includes('/courses/[id]')) {
        return true;
    }
    // Legg til flere sjekker for andre dynamiske offentlige ruter her...
    // f.eks. if (path.startsWith('/profil/') && publicPatterns.includes('/profil/[username]')) return true;

    return false; // Ikke offentlig hvis ingen av sjekkene over matchet
}


/**
 * Middleware for å håndtere språkdeteksjon (i18n), URL-prefiks og autentisering.
 */
export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // --- Steg 1: Bestem ønsket språk (i18n) ---
    let lng: string | null | undefined;
    if (req.cookies.has(cookieName)) {
        lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
    }
    if (!lng) {
        lng = acceptLanguage.get(req.headers.get('Accept-Language'));
    }
    if (!lng) {
        lng = fallbackLng;
    }
    const determinedLng = lng!;

    // --- Steg 2: Omdiriger hvis URL mangler språkprefiks ---
    const pathnameIsMissingLocale = languages.every(
        (loc) => !pathname.startsWith(`/${loc}/`) && pathname !== `/${loc}`
    );

    if (pathnameIsMissingLocale) {
        const newUrl = new URL(`/${determinedLng}${pathname.startsWith('/') ? '' : '/'}${pathname}${req.nextUrl.search}`, req.url);
        const response = NextResponse.redirect(newUrl);
        response.cookies.set(cookieName, determinedLng, { path: '/', maxAge: 365 * 24 * 60 * 60 });
        return response;
    }

    // --- Steg 3: Hent aktivt språk fra URL og lag response-objekt ---
    let currentLng = fallbackLng;
    let pathnameWithoutLocale = pathname;

    for (const loc of languages) {
        if (pathname.startsWith(`/${loc}/`)) {
            currentLng = loc;
            pathnameWithoutLocale = pathname.substring(`/${loc}`.length) || '/';
            break;
        } else if (pathname === `/${loc}`) {
            currentLng = loc;
            pathnameWithoutLocale = '/';
            break;
        }
    }

    let response = NextResponse.next();

    if (!req.cookies.has(cookieName) || req.cookies.get(cookieName)?.value !== currentLng) {
       response.cookies.set(cookieName, currentLng, { path: '/', maxAge: 365 * 24 * 60 * 60 });
    }

    // --- Steg 4: Håndter autentisering basert på rute og innloggingsstatus ---
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isLoggedIn = !!token;

    const isApiAuthRoute = pathnameWithoutLocale.startsWith(apiAuthPrefix);

    // Bruker den nye hjelpefunksjonen for å sjekke offentlig rute
    const isPublicRoute = isPathPublic(pathnameWithoutLocale, publicRoutes);

    const isAuthRoute = authRoutes.includes(pathnameWithoutLocale);

    if (isApiAuthRoute) {
        return response;
    }

    if (pathnameWithoutLocale === "/auth/new-password") {
        return response;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(`/${currentLng}${DEFAULT_LOGIN_REDIRECT}`, req.url));
        }
        return response;
    }

    // Bruker nå den korrekte isPublicRoute-verdien
    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = pathname;
        if (req.nextUrl.search) {
            callbackUrl += req.nextUrl.search;
        }
        const loginUrl = new URL(`/${currentLng}/auth/login`, req.url);
        loginUrl.searchParams.set("callbackUrl", callbackUrl);
        return NextResponse.redirect(loginUrl);
    }

    // --- Steg 5: Tillat tilgang ---
    return response;
}