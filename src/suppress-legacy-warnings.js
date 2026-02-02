/**
 * Suppress known warnings from third-party libraries
 *
 * This utility suppresses only specific known warnings while preserving
 * warnings from our own application code.
 */

const SUPPRESSED_WARNINGS = [
  'React Router Future Flag Warning'
];

const originalConsoleWarn = console.warn;

console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && SUPPRESSED_WARNINGS.some(warning => message.includes(warning))) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
