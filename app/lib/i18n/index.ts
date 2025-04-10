// Fil: app/lib/i18n/index.ts
// Formål: Initialisering og hjelpefunksjoner for i18next på serversiden (RSC).
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet og feilsøking.

import { createInstance, Namespace, KeyPrefix, i18n } from 'i18next'; // <-- La til i18n for Promise type hint
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
// Importerer konfigurasjon fra settings-filen. Stien bør verifiseres for prosjektet.
import { getOptions, defaultNS } from './settings';

/**
 * Initialiserer en i18next-instans for server-side bruk per request.
 * Sikrer isolerte instanser for hver brukerforespørsel.
 * @param lng Språkkoden (f.eks. 'no', 'en').
 * @param ns Namespace(s) som skal lastes (f.eks. 'translation').
 * @returns En Promise som resolver til en initialisert i18next-instans.
 */
const initI18next = async (lng: string, ns: string | string[]): Promise<i18n> => { // <-- La til Promise<i18n>
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    // Laster oversettelser dynamisk fra public/locales basert på språk og namespace.
    .use(resourcesToBackend(async (language: string, namespace: string) => {
        const module = await import(`../../../public/locales/${language}/${namespace}.json`);
        // Returnerer spesifikt 'translation'-objektet fra JSON-modulen hvis det finnes.
        // Nødvendig hvis JSON-filene har et ekstra nivå med "translation".
        return module.default?.translation;
      }
    ))
    // Initialiserer instansen med konfigurasjonsopsjoner.
    .init(getOptions(lng, ns));
  return i18nInstance;
};

/**
 * Asynkron funksjon for å hente oversettelsesfunksjonalitet i Server Components.
 * Etterligner en hook for server-miljøet.
 * @param lng Språkkoden for oversettelsene.
 * @param ns Namespace(s) som trengs. Bruker defaultNS hvis ikke spesifisert.
 * @param options Valgfrie innstillinger, primært for 'keyPrefix'.
 * @returns Et objekt med oversettelsesfunksjonen 't' og den initialiserte 'i18n'-instansen.
 */
export async function serverUseTranslation(
  lng: string,
  ns: Namespace = defaultNS,
  options: { keyPrefix?: KeyPrefix<Namespace> } = {}
) {
  // Oppretter og initialiserer en ny instans for denne spesifikke bruken.
  const i18nextInstance = await initI18next(lng, Array.isArray(ns) ? ns : [ns]);
  return {
    // Henter en 't'-funksjon som er bundet til spesifikt språk, namespace og keyPrefix.
    t: i18nextInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
    // Returnerer hele instansen for eventuell avansert bruk.
    i18n: i18nextInstance
  };
}