// Fil: hooks/use-debounce.ts
// Formål: Custom React hook for å forsinke oppdateringen av en verdi (debouncing). Nyttig for å begrense hyppige oppdateringer,
//         som f.eks. API-kall ved tastetrykk i et søkefelt. Returnerer den forsinkede verdien.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing a value.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Update debounced value after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cleanup function to clear the timeout if value or delay changes
      // This prevents the debounced value from updating if the value changes
      // within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}

