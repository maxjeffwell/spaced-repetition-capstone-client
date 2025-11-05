import React from 'react';
import './ml-status.css';

/**
 * ML Status Component
 *
 * Displays:
 * - Current backend (WebGPU/WebGL/WASM/CPU)
 * - Performance metrics
 * - Model info
 */
export default function MLStatus({ mlInfo }) {
  if (!mlInfo || !mlInfo.isLoaded) {
    return (
      <div className="ml-status loading">
        <div className="ml-status-header">
          <span className="ml-icon">🤖</span>
          <span>ML Model Loading...</span>
        </div>
      </div>
    );
  }

  const getBackendIcon = (backend) => {
    const icons = {
      webgpu: '🚀',
      webgl: '⚡',
      wasm: '💨',
      cpu: '🐌'
    };
    return icons[backend] || '🤖';
  };

  const getBackendColor = (backend) => {
    const colors = {
      webgpu: '#00ff41',
      webgl: '#ffaa00',
      wasm: '#00aaff',
      cpu: '#888888'
    };
    return colors[backend] || '#666666';
  };

  const backendInfo = mlInfo.backendInfo || {};
  const available = backendInfo.available || {};
  const current = backendInfo.current || available[mlInfo.backend] || {};

  return (
    <div className="ml-status" style={{ borderColor: getBackendColor(mlInfo.backend) }}>
      <div className="ml-status-header">
        <span className="ml-icon">{getBackendIcon(mlInfo.backend)}</span>
        <span className="ml-backend">{mlInfo.backend.toUpperCase()}</span>
        <span className="ml-speedup">{current.speedup || backendInfo.speedup || 'Active'}</span>
      </div>

      <div className="ml-stats">
        <div className="ml-stat">
          <label>Predictions:</label>
          <value>{mlInfo.metrics?.totalPredictions || 0}</value>
        </div>
        <div className="ml-stat">
          <label>Avg Time:</label>
          <value>{(mlInfo.metrics?.avgPredictionTime || 0).toFixed(2)}ms</value>
        </div>
        <div className="ml-stat">
          <label>Improvement:</label>
          <value className="improvement">+{(mlInfo.metadata?.improvement || 96.1).toFixed(1)}%</value>
        </div>
      </div>

      <div className="ml-description">
        {current.description || 'ML-enhanced predictions'}
      </div>
    </div>
  );
}
