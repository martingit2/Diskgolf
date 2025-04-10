// Fil: app/providers/TranslationsProvider.tsx
// Formål: Klientside-provider ('use client') for i18next kontekst.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet og feilsøking.

'use client'; // Markerer komponenten for klientside-rendering.

import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createInstance, i18n as I18nInstance, Namespace, Resource } from 'i18next';
// Importerer initialiseringsfunksjonen for klient-instanser.
import initTranslations from '../lib/i18n/client';

/**
 * Props for TranslationsProvider komponenten.
 */
interface TranslationsProviderProps {
  /** Barn-elementene som skal wrappes av provideren. */
  children: ReactNode;
  /** Språkkoden som skal brukes (f.eks. 'no', 'en'). */
  locale: string;
  /** Nødvendige i18next namespaces for den initielle lastingen. */
  namespaces: Namespace;
  /** Valgfrie i18next-ressurser (oversettelser) pre-lastet fra serveren. */
  resources?: Resource;
}

/**
 * En React Context Provider som initialiserer og tilgjengeliggjør en
 * i18next-instans for klientkomponenter via 'useClientTranslation' hooken (eller lignende).
 * Oppretter en ny, isolert instans for hver render for å unngå state-lekkasje
 * mellom server requests i App Router.
 *
 * @param props - Props for komponenten, inkludert locale, namespaces og ressurser.
 */
export default function TranslationsProvider({
  children,
  locale,
  namespaces,
  resources // Mottar ressurser fra en overordnet Server Component (f.eks. RootLayout).
}: TranslationsProviderProps) {

  // Oppretter en ny i18next-instans for denne spesifikke renderingen av provideren.
  const i18n = createInstance();

  // Initialiserer den nye instansen med mottatt locale, namespaces og pre-lastede ressurser.
  // Selve initialiseringslogikken ligger i initTranslations-funksjonen.
  initTranslations(locale, namespaces, i18n, resources);

  // Bruker I18nextProvider fra react-i18next for å gjøre den konfigurerte 'i18n'-instansen
  // tilgjengelig via React Context for alle barn-komponenter.
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}