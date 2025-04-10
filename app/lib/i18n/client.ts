// Fil: lib/i18n/client.ts
// Formål: Initialisering av i18next på klientsiden.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet og feilsøking.

import i18n, { i18n as I18nInstance, Namespace, Resource } from 'i18next'; 
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { cookieName, getOptions } from './settings';

// Funksjon for å initialisere i18next på klienten
const initTranslations = (
    locale: string,
    namespaces: Namespace,
    instance: I18nInstance,
    resources?: Resource
    ) => {


  instance
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(HttpApi)
    .init({
      ...getOptions(locale, namespaces),
      lng: locale,
      resources: resources, // Bruker mottatte ressurser
      // Fallback til 'false' hvis process.env ikke er tilgjengelig på klienten
      debug: process.env.NODE_ENV === 'development' || false, // Aktiver i18next debug logging i dev
      detection: {
        order: ['cookie', 'htmlTag', 'localStorage', 'path', 'subdomain', 'navigator'], // Beholdt din 'detection.order'
        caches: ['cookie'],
        lookupCookie: cookieName,
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      react: {
        useSuspense: false,
      },
      interpolation: {
        escapeValue: false, 
      },
    });

  return instance;
};

export default initTranslations; 