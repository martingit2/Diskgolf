/** 
 * Filnavn: TestLoginPage.tsx
 * Beskrivelse: Enkel sidekomponent for å rendre TestLogin-komponenten, 
 * som brukes til testing av innloggingsfunksjonalitet.
 * Utvikler: Martin Pettersen
 */

import TestLogin from "@/components/test-login";

/**
 * TestLoginPage-komponenten viser TestLogin-komponenten for å teste innloggingsfunksjonalitet.
 * 
 * @component
 * @author Martin Pettersen
 */
const TestLoginPage = () => {
  return <TestLogin />;
};

export default TestLoginPage;
