/** 
 * Filnavn: Page.tsx
 * Beskrivelse: Sidekomponent for visning av autentiseringsfeil. 
 * Denne siden renderer en feilkomponent som informerer brukeren om autentiseringsproblemer.
 * Utvikler: Martin Pettersen
 */


import { ErrorCard } from "../../../components/auth/error-card";




const AuthErrorPage = () => {
  return <ErrorCard />;
};

export default AuthErrorPage;