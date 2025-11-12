import React from 'react';
import styles from './ml-status.module.css';

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
      <div className={`${styles.mlStatus} ${styles.loading}`}>
        <div className={styles.mlStatusHeader}>
          <span className={styles.mlIcon}>🤖</span>
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
    <div className={styles.mlStatus} style={{ borderColor: getBackendColor(mlInfo.backend) }}>
      <div className={styles.mlStatusHeader}>
        <span className={styles.mlIcon}>{getBackendIcon(mlInfo.backend)}</span>
        <span className={styles.mlBackend}>{mlInfo.backend.toUpperCase()}</span>
        <span className={styles.mlSpeedup}>{current.speedup || backendInfo.speedup || 'Active'}</span>
      </div>

      <div className={styles.mlStats}>
        <div className={styles.mlStat}>
          <label>Predictions:</label>
          <span className={styles.value}>{mlInfo.metrics?.totalPredictions || 0}</span>
        </div>
        <div className={styles.mlStat}>
          <label>Avg Time:</label>
          <span className={styles.value}>{(mlInfo.metrics?.avgPredictionTime || 0).toFixed(2)}ms</span>
        </div>
        <div className={styles.mlStat}>
          <label>Improvement:</label>
          <span className={`${styles.value} ${styles.improvement}`}>+{(mlInfo.metadata?.improvement || 96.1).toFixed(1)}%</span>
        </div>
      </div>

      <div className={styles.mlDescription}>
        {current.description || 'ML-enhanced predictions'}
      </div>
    </div>
  );
}
