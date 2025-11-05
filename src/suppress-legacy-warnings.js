/**
 * Suppress known warnings from legacy third-party libraries
 *
 * Redux-form (v8.3.10) is the last version and uses deprecated React patterns.
 * These warnings don't affect functionality and come from library code we can't control.
 *
 * This utility suppresses only specific known warnings while preserving
 * warnings from our own application code.
 */

const SUPPRESSED_WARNINGS = [
  'componentWillMount has been renamed',
  'componentWillReceiveProps has been renamed',
  'Support for defaultProps will be removed from memo components',
  'Support for defaultProps will be removed from function components',
  'Function components cannot be given refs',
  'uses the legacy contextTypes API',
  'uses the legacy childContextTypes API',
  'componentWillUpdate has been renamed',
  'React Router Future Flag Warning'
];

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && SUPPRESSED_WARNINGS.some(warning => message.includes(warning))) {
    // Suppress known redux-form warnings
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && SUPPRESSED_WARNINGS.some(warning => message.includes(warning))) {
    // Suppress known redux-form warnings
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Log once that we're suppressing these warnings
if (process.env.NODE_ENV === 'development') {
  console.info(
    '%c[Development] Suppressing legacy warnings from redux-form',
    'color: #888; font-style: italic'
  );
}
