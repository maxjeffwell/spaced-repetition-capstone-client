import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import apiService from '../services/api-service';
import { StatsDashboard, maeImprovement } from './stats-dashboard';

jest.mock('chart.js', () => ({
  Chart: class {
    static register() {}
    destroy() {}
  },
  registerables: []
}));
jest.mock('./nav-bar', () => () => null);
jest.mock('../services/api-service', () => ({
  getAlgorithmComparison: jest.fn(),
  getProgress: jest.fn()
}));

// Shape of GET /questions/stats/comparison as the server actually sends it
// (routes/questions.js wraps the comparison object).
const comparisonResponse = {
  comparison: {
    baseline: { totalReviews: 5, retentionRate: 0.6, avgInterval: 3, avgResponseTime: 1200 },
    ml: { totalReviews: 64, retentionRate: 0.8, avgInterval: 9, avgResponseTime: 1100 },
    improvement: { retentionRate: 0.2, avgInterval: 6, reviewsNeeded: -59 }
  },
  mlReadiness: { ready: true },
  currentMode: 'ml'
};
const progressResponse = { totalReviews: 69, successRate: 0.78, cards: [] };

function renderDashboard() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  return { container, root };
}

describe('StatsDashboard comparison table', () => {
  let container;
  let root;

  beforeEach(async () => {
    apiService.getAlgorithmComparison.mockResolvedValue(comparisonResponse);
    apiService.getProgress.mockResolvedValue(progressResponse);
    ({ container, root } = renderDashboard());
    await act(async () => {
      root.render(<StatsDashboard loggedIn />);
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    jest.clearAllMocks();
  });

  it('reads the comparison object out of the API envelope and reports the ML reviews', () => {
    const text = container.textContent;
    expect(text).toContain('Comparing 5 baseline vs 64 ML predictions');
    expect(text).not.toContain('No ML predictions yet');
  });

  it('shows the per-algorithm review counts in the table', () => {
    const cells = Array.from(container.querySelectorAll('td')).map(td => td.textContent);
    expect(cells).toEqual(expect.arrayContaining(['5', '64']));
  });

  it('does not invent an improvement figure when the server sends no MAE', () => {
    expect(container.textContent).not.toContain('96.1');
  });
});

describe('maeImprovement', () => {
  it('is a dash when the API sends no MAE', () => {
    expect(maeImprovement({ baseline: { totalReviews: 5 }, ml: { totalReviews: 64 } })).toBe('-');
  });

  it('computes the MAE reduction when both values are present', () => {
    expect(maeImprovement({ baseline: { mae: 49.31 }, ml: { mae: 6.07 } })).toBe('+87.7%');
    expect(maeImprovement({ baselineMAE: 10, mlMAE: 12 })).toBe('-20.0%');
  });
});
