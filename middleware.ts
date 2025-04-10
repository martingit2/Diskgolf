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
 * Middleware for å håndtere språkdeteksjon (i18n), URL-prefiks og autentisering.
 */
export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // --- Steg 1: Bestem ønsket språk (i18n) ---
    let lng: string | null | undefined;
    // Prioriterer språk lagret i cookie
    if (req.cookies.has(cookieName)) {
        lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
    }
    // Ellers, sjekk 'Accept-Language'-header fra nettleser
    if (!lng) {
        lng = acceptLanguage.get(req.headers.get('Accept-Language'));
    }
    // Til slutt, bruk definert fallback-språk
    if (!lng) {
        lng = fallbackLng;
    }
    // Sikrer at lng har en verdi (pga fallbackLng)
    const determinedLng = lng!;

    // --- Steg 2: Omdiriger hvis URL mangler språkprefiks ---
    // Sjekker om stien *ikke* starter med et av de støttede språkene
    const pathnameIsMissingLocale = languages.every(
        (loc) => !pathname.startsWith(`/${loc}/`) && pathname !== `/${loc}`
    );

    // Omdirigerer til URL med korrekt språkprefiks hvis det mangler
    if (pathnameIsMissingLocale) {
        // Bygger ny URL med det bestemte språket
        const newUrl = new URL(`/${determinedLng}${pathname.startsWith('/') ? '' : '/'}${pathname}${req.nextUrl.search}`, req.url);
        const response = NextResponse.redirect(newUrl);
        // Setter en cookie med det valgte språket for fremtidige besøk
        response.cookies.set(cookieName, determinedLng, { path: '/', maxAge: 365 * 24 * 60 * 60 }); // Utløper om 1 år
        return response;
    }

    // --- Steg 3: Hent aktivt språk fra URL og lag response-objekt ---
    // Finner ut hvilket språk som faktisk er i URLen
    let currentLng = fallbackLng;
    let pathnameWithoutLocale = pathname; // Stien uten språkprefiks

    for (const loc of languages) {
        if (pathname.startsWith(`/${loc}/`)) {
            currentLng = loc;
            pathnameWithoutLocale = pathname.substring(`/${loc}`.length) || '/'; // Håndterer '/en' -> '/'
            break;
        } else if (pathname === `/${loc}`) {
            currentLng = loc;
            pathnameWithoutLocale = '/'; // Dekker rot-URL for språket, f.eks. /en
            break;
        }
    }

    // Oppretter et standard 'next'-response som kan modifiseres
    let response = NextResponse.next();

    // Oppdaterer språk-cookie hvis den mangler eller er feil
    if (!req.cookies.has(cookieName) || req.cookies.get(cookieName)?.value !== currentLng) {
       response.cookies.set(cookieName, currentLng, { path: '/', maxAge: 365 * 24 * 60 * 60 });
    }

    // --- Steg 4: Håndter autentisering basert på rute og innloggingsstatus ---

    // Henter brukerens sesjonstoken
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isLoggedIn = !!token; // Sjekker om bruker er innlogget

    // Klassifiserer ruten (bruker stien *uten* språkprefiks)
    const isApiAuthRoute = pathnameWithoutLocale.startsWith(apiAuthPrefix); // f.eks. /api/auth/...
    const isPublicRoute = publicRoutes.includes(pathnameWithoutLocale);   // Ruter som er tilgjengelige for alle
    const isAuthRoute = authRoutes.includes(pathnameWithoutLocale);     // Ruter for innlogging/registrering etc.

    // Tillater alltid kall til NextAuth API-endepunkter
    if (isApiAuthRoute) {
        return response;
    }

    // Tillat tilgang til 'new-password'-siden (spesialtilfelle)
    if (pathnameWithoutLocale === "/auth/new-password") {
        return response;
    }

    // Håndterer forsøk på å besøke autentiseringsruter (login, register)
    if (isAuthRoute) {
        // Hvis bruker er innlogget, omdiriger til standard landingsside
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(`/${currentLng}${DEFAULT_LOGIN_REDIRECT}`, req.url));
        }
        // Hvis ikke innlogget, tillat tilgang til autentiseringsruten
        return response;
    }

    // Håndterer forsøk på å besøke beskyttede ruter uten å være innlogget
    if (!isLoggedIn && !isPublicRoute) {
        // Lagrer opprinnelig URL som callbackUrl for omdirigering etter innlogging
        let callbackUrl = pathname; // Bruker hele stien inkl. språk
        if (req.nextUrl.search) {
            callbackUrl += req.nextUrl.search;
        }
        // Bygger URL til innloggingssiden med korrekt språk
        const loginUrl = new URL(`/${currentLng}/auth/login`, req.url);
        loginUrl.searchParams.set("callbackUrl", callbackUrl);

        // Omdirigerer til innloggingssiden
        return NextResponse.redirect(loginUrl);
    }

    // --- Steg 5: Tillat tilgang hvis ingen av reglene over slo til ---
    // Gjelder for offentlige ruter, eller beskyttede ruter for innloggede brukere
    return response;
}