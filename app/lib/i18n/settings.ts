// Fil: app/lib/i18n/settings.ts
// Formål: Sentral konfigurasjon for i18next.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet og feilsøking.

import { Namespace } from 'i18next';

export const fallbackLng = 'no';
export const languages: readonly string[] = [fallbackLng, 'en'];
export const defaultNS: Namespace = 'translation';
export const cookieName = 'i18nextLng'; // Standard cookie-navn for i18next

/**
 * Genererer i18next konfigurasjonsoptions.
 * @param lng Språkkode.
 * @param ns Namespace(s).
 * @returns i18next konfigurasjonsobjekt.
 */
export function getOptions(lng = fallbackLng, ns: Namespace = defaultNS) {
  return {
    // debug: process.env.NODE_ENV === 'development', // Kan aktiveres for feilsøking
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS: defaultNS,
    ns,
  };
}