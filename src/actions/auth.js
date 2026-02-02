import {API_BASE_URL} from '../config';
import {normalizeResponseErrors} from './utils';

export const CLEAR_AUTH = 'CLEAR_AUTH';
export const AUTH_REQUEST = 'AUTH_REQUEST';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_ERROR = 'AUTH_ERROR';

export const clearAuth = () => ({
    type: CLEAR_AUTH
});

export const authRequest = () => ({
    type: AUTH_REQUEST
});

export const authSuccess = currentUser => ({
    type: AUTH_SUCCESS,
    currentUser
});

export const authError = error => ({
    type: AUTH_ERROR,
    error
});

// Login - server sets httpOnly cookies, returns user info
export const login = (username, password) => dispatch => {
    dispatch(authRequest());
    return fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ username, password })
    })
        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        .then(({ user }) => {
            dispatch(authSuccess(user));
        })
        .catch(err => {
            const { code } = err;
            const message =
                code === 401
                    ? 'Incorrect username or password'
                    : 'Unable to login, please try again';
            dispatch(authError(err));
            return Promise.reject(new Error(message));
        });
};

// Logout - clears cookies and revokes refresh token
export const logout = () => dispatch => {
    return fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(() => {
            dispatch(clearAuth());
        })
        .catch(() => {
            // Clear auth state even if request fails
            dispatch(clearAuth());
        });
};

// Refresh access token using refresh cookie
export const refreshAuthToken = () => dispatch => {
    return fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('Refresh failed');
            }
            return res.json();
        })
        .catch(err => {
            // Refresh failed, clear auth state
            dispatch(clearAuth());
        });
};

// Fetch current user from /auth/me (used on app load)
export const fetchCurrentUser = () => dispatch => {
    dispatch(authRequest());
    return fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include'
    })
        .then(res => {
            if (!res.ok) {
                if (res.status === 401) {
                    // Try refresh first
                    return fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include'
                    })
                        .then(refreshRes => {
                            if (!refreshRes.ok) {
                                throw new Error('Not authenticated');
                            }
                            // Retry /auth/me after refresh
                            return fetch(`${API_BASE_URL}/auth/me`, {
                                credentials: 'include'
                            });
                        })
                        .then(retryRes => {
                            if (!retryRes.ok) {
                                throw new Error('Not authenticated');
                            }
                            return retryRes.json();
                        });
                }
                throw new Error('Failed to fetch user');
            }
            return res.json();
        })
        .then(({ user }) => {
            dispatch(authSuccess(user));
        })
        .catch(err => {
            // Not authenticated - this is normal for first visit
            dispatch(clearAuth());
        });
};
