// src/hooks/useDebounce.js
// Purpose: Custom React hook to delay state changes (useful for throttling search API calls).

import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce updates to a state value.
 * @param {any} value The input value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {any} The debounced value.
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timer to update value after specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout if value changes before delay window finishes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
