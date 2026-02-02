// DEPRECATED: Token storage moved to httpOnly cookies
// These functions are no-ops for backward compatibility
// Kept to prevent import errors in any code that still references them

// Clean up any old localStorage tokens on module load
try {
    localStorage.removeItem('authToken');
} catch (e) {
    // Ignore errors
}

export const loadAuthToken = () => null;

export const saveAuthToken = (authToken) => {
    // No-op - tokens are now stored in httpOnly cookies
};

export const clearAuthToken = () => {
    // No-op - cookies are cleared server-side via /auth/logout
};
