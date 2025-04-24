// Fil: schemas/index.test.ts

// Importer funksjonen du vil teste
import { sanitizeInput } from './index';

// Grupper tester for denne funksjonen
describe('sanitizeInput funksjonen', () => {

  // Test case 1: Skal fjerne enkle anførselstegn
  it('skal fjerne enkle anførselstegn', () => {
    const input = "Dette er 'farlig' input";
    const forventetOutput = "Dette er farlig input";
    const resultat = sanitizeInput(input);
    expect(resultat).toBe(forventetOutput);
  });

  // Test case 2: Skal fjerne doble anførselstegn
  it('skal fjerne doble anførselstegn', () => {
    expect(sanitizeInput('Test med "doble" tegn')).toBe('Test med doble tegn');
  });

  // Test case 3: Skal fjerne backslash
  it('skal fjerne backslash', () => {
    // I JavaScript-strenger må vi skrive \\ for å representere én \
    expect(sanitizeInput('En \\ backslash')).toBe('En  backslash');
  });

  // Test case 4: Skal fjerne semikolon
  it('skal fjerne semikolon', () => {
    expect(sanitizeInput('SELECT * FROM users;')).toBe('SELECT * FROM users');
  });

  // Test case 5: Skal fjerne parenteser
  it('skal fjerne parenteser', () => {
    expect(sanitizeInput('alert(1)')).toBe('alert1');
  });

   // Test case 6: Skal fjerne likhetstegn
   it('skal fjerne likhetstegn', () => {
    expect(sanitizeInput('user=admin')).toBe('useradmin');
  });

  // Test case 7: Skal fjerne flere tegn samtidig
  it('skal fjerne flere uønskede tegn samtidig', () => {
    expect(sanitizeInput("('SELECT * FROM users WHERE name = \"admin\";')")).toBe('SELECT * FROM users WHERE name  admin');
  });

  // Test case 8: Skal IKKE fjerne vanlige tegn
  it('skal ikke fjerne vanlige bokstaver, tall og mellomrom', () => {
    const input = "Trygg tekst 123 med æøå";
    expect(sanitizeInput(input)).toBe(input);
  });

   // Test case 9: Skal håndtere en tom streng
   it('skal returnere en tom streng hvis input er tom', () => {
    expect(sanitizeInput("")).toBe("");
  });

});