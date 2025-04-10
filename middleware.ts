// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import acceptLanguage from 'accept-language';

// Prosjektinterne imports
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from './routes';
import { cookieName, fallbackLng, languages } from './app/lib/i18n/settings'; 

// Registrer støttede språk for accept-language biblioteket
acceptLanguage.languages([...languages]);

// =============================================
// ===== DENNE config-BLOKKEN ER OPPDATERT =====
// =============================================
export const config = {
    // KJØR KUN på stier som IKKE starter med:
    // - api/
    // - _next/static/
    // - _next/image/
    // - assets/
    // - favicon.ico
    // - sw.js
    // - trpc/ (hvis du bruker det og vil ekskludere)
    // OG som IKKE er filer med kjente utvidelser (bilder, css, js etc.)
    matcher: '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|trpc|.*\\.\\w+).*)',
};
// =============================================
// =============================================


export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // --- i18n Språkdeteksjon og URL-prefiks ---
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

    const determinedLng = lng!; // Bruker non-null assertion

    const pathnameIsMissingLocale = languages.every(
        (loc) => !pathname.startsWith(`/${loc}/`) && pathname !== `/${loc}`
    );

    // Denne if-blokken vil ikke lenger trenge å sjekke for !pathname.startsWith('/api/')
    // fordi middlewaren uansett ikke kjører for /api/
    if (pathnameIsMissingLocale && !pathname.startsWith(apiAuthPrefix)) { // Fjernet /trpc/ sjekk også hvis matcheren ekskluderer den
        const newUrl = new URL(`/${determinedLng}${pathname.startsWith('/') ? '' : '/'}${pathname}${req.nextUrl.search}`, req.url);
        const response = NextResponse.redirect(newUrl);
        response.cookies.set(cookieName, determinedLng, { path: '/', maxAge: 365 * 24 * 60 * 60 });
        return response;
    }

    // --- Hent språk fra URL og normaliser sti ---
    let currentLng = fallbackLng;
    let pathnameWithoutLocale = pathname;

    for (const loc of languages) {
        if (pathname.startsWith(`/${loc}/`)) {
            currentLng = loc;
            pathnameWithoutLocale = pathname.substring(`/${loc}`.length);
            if (!pathnameWithoutLocale.startsWith('/')) {
                 pathnameWithoutLocale = '/' + pathnameWithoutLocale;
            }
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

    // --- Autentiseringslogikk ---

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isLoggedIn = !!token;

    const isApiAuthRoute = pathnameWithoutLocale.startsWith(apiAuthPrefix); 
    const isPublicRoute = publicRoutes.includes(pathnameWithoutLocale);
    const isAuthRoute = authRoutes.includes(pathnameWithoutLocale);

    if (isApiAuthRoute) { // Denne gjelder kun /api/auth/...
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

    // --- Tillat tilgang ---
    return response;
}