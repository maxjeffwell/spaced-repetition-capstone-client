/**
 * API Service for Spaced Repetition Backend
 *
 * Handles all API calls to the Node.js backend using httpOnly cookie authentication
 */

import { API_BASE_URL } from '../config';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make authenticated API request using httpOnly cookies
   */
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include' // Include httpOnly cookies
    });

    if (!response.ok) {
      // Handle token expiration - try refresh
      if (response.status === 401) {
        const data = await response.json();
        if (data.code === 'TOKEN_EXPIRED') {
          // Try to refresh the token
          const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          });

          if (refreshResponse.ok) {
            // Retry original request
            const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
              ...options,
              headers,
              credentials: 'include'
            });

            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
        }
      }

      const error = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(error.message || error.error || 'API request failed');
    }

    return response.json();
  }

  /**
   * Authentication - now handled via httpOnly cookies
   */
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    // Server sets httpOnly cookies, returns user info
    return data;
  }

  async register(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  /**
   * Learning Flow
   */
  async getNextQuestion() {
    return this.request('/questions/next');
  }

  async submitAnswer(answer, responseTime, predictedInterval = null, predictionTime = null) {
    return this.request('/questions/answer', {
      method: 'POST',
      body: JSON.stringify({
        answer,
        responseTime,
        predictedInterval,
        predictionTime
      })
    });
  }

  /**
   * Statistics & Progress
   */
  async getProgress() {
    return this.request('/questions/progress');
  }

  async getAlgorithmComparison() {
    return this.request('/questions/stats/comparison');
  }

  /**
   * Settings
   */
  async updateSettings(settings) {
    return this.request('/questions/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }
}

const apiService = new APIService();

export default apiService;
