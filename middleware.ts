// Fil: middleware.ts
// Formål: Håndterer forespørsler for rutebeskyttelse og internasjonalisering (i18n).
//         Sjekker brukerautentisering (NextAuth JWT), omdirigerer uautoriserte brukere fra beskyttede ruter,
//         og sikrer korrekt språk-prefiks i URL basert på cookie eller 'Accept-Language' header, inkludert støtte for dynamiske offentlige ruter.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import acceptLanguage from 'accept-language';

import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from './routes';
import { cookieName, fallbackLng, languages } from './app/lib/i18n/settings';

acceptLanguage.languages([...languages]);

export const config = {
  matcher: '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|trpc|.*\\.\\w+).*)',
};

/**
 * Hjelpefunksjon for å sjekke om en gitt sti matcher et offentlig rute-mønster.
 */
function isPathPublic(path: string, publicPatterns: string[]): boolean {
    if (publicPatterns.includes(path)) {
        return true;
    }

    // Sjekk for dynamiske mønstre
    if (path.startsWith('/turneringer/') && publicPatterns.includes('/turneringer/[id]')) {
       return true;
    }
    // Sjekk for /klubber/[id] (flertall)
    if (path.startsWith('/klubber/') && publicPatterns.includes('/klubber/[id]')) {
       return true;
    }
    if (path.startsWith('/tournament/') && publicPatterns.includes('/tournament/[id]')) { 
        return true;
     }
    // Sjekk for /klubb/[id] (entall, hvis den fortsatt er relevant)
    if (path.startsWith('/klubb/') && publicPatterns.includes('/klubb/[id]')) {
       return true;
    }
    if (path.startsWith('/courses/') && publicPatterns.includes('/courses/[id]')) {
        return true;
    }
    // Sjekk for /spill/solo/[id]
    if (path.startsWith('/spill/solo/') && publicPatterns.includes('/spill/solo/[id]')) {
        return true;
    }
    // Legg til flere sjekker her...

    return false;
}


export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

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

    const pathnameIsMissingLocale = languages.every(
        (loc) => !pathname.startsWith(`/${loc}/`) && pathname !== `/${loc}`
    );

    if (pathnameIsMissingLocale) {
        const newUrl = new URL(`/${determinedLng}${pathname.startsWith('/') ? '' : '/'}${pathname}${req.nextUrl.search}`, req.url);
        const response = NextResponse.redirect(newUrl);
        response.cookies.set(cookieName, determinedLng, { path: '/', maxAge: 365 * 24 * 60 * 60 });
        return response;
    }

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

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isLoggedIn = !!token;

    const isApiAuthRoute = pathnameWithoutLocale.startsWith(apiAuthPrefix);
    const isPublicRoute = isPathPublic(pathnameWithoutLocale, publicRoutes); // Bruker oppdatert funksjon
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

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = pathname;
        if (req.nextUrl.search) {
            callbackUrl += req.nextUrl.search;
        }
        const loginUrl = new URL(`/${currentLng}/auth/login`, req.url);
        loginUrl.searchParams.set("callbackUrl", callbackUrl);
        return NextResponse.redirect(loginUrl);
    }

    return response;
}