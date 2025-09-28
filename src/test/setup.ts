// Test environment setup
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Quiet axios logging during tests
vi.spyOn(console, 'log').mockImplementation(() => {});

// Suppress noisy warnings in tests
const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
  originalError(...args as []);
};
