/**
 * API Service for Spaced Repetition Backend
 *
 * Handles all API calls to the Node.js backend
 */

import { API_BASE_URL } from '../config';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const authToken = localStorage.getItem('authToken');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  /**
   * Authentication
   */
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (data.authToken) {
      localStorage.setItem('authToken', data.authToken);
    }

    return data;
  }

  async register(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
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
