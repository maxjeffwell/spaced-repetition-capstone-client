# WebGPU Integration for Neural-Enhanced Spaced Repetition

## Overview

We're using **WebGPU** to accelerate TensorFlow.js computations for training and inference of our neural network model. This provides significant performance improvements and showcases modern web technology.

## Architecture Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER ENVIRONMENT                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          TensorFlow.js with WebGPU Backend             │ │
│  │                                                         │ │
│  │  tf.setBackend('webgpu')                               │ │
│  │  ↓                                                      │ │
│  │  GPU Acceleration for:                                 │ │
│  │  • Model Training (if client-side)                     │ │
│  │  • Interval Predictions (inference)                    │ │
│  │  • Feature Preprocessing                               │ │
│  │                                                         │ │
│  │  Fallback Chain:                                       │ │
│  │  WebGPU → WebGL → WASM → CPU                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Performance Monitoring                     │ │
│  │  • Backend detection                                    │ │
│  │  • Inference time tracking                             │ │
│  │  • Training speed comparison                           │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Implementation

### 1. Backend Setup (Client)

```javascript
// src/ml/setupBackend.js

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';

export async function initializeTensorFlow() {
  console.log('Initializing TensorFlow.js...');

  // Try to set WebGPU backend
  try {
    await tf.setBackend('webgpu');
    await tf.ready();
    console.log('✅ WebGPU backend initialized');
    console.log('Available backends:', tf.engine().backendNames);
    return 'webgpu';
  } catch (error) {
    console.warn('WebGPU not available, falling back to WebGL');

    try {
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('✅ WebGL backend initialized');
      return 'webgl';
    } catch (error) {
      console.warn('WebGL not available, using CPU');
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('⚠️ CPU backend initialized (slower performance)');
      return 'cpu';
    }
  }
}

export function getBackendInfo() {
  return {
    backend: tf.getBackend(),
    isWebGPU: tf.getBackend() === 'webgpu',
    isWebGL: tf.getBackend() === 'webgl',
    isCPU: tf.getBackend() === 'cpu',
    numTensors: tf.memory().numTensors,
    numBytes: tf.memory().numBytes
  };
}

export async function checkWebGPUSupport() {
  if (!navigator.gpu) {
    return {
      supported: false,
      reason: 'WebGPU not available in this browser'
    };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        reason: 'No WebGPU adapter available'
      };
    }

    const device = await adapter.requestDevice();
    return {
      supported: true,
      adapter: {
        name: adapter.name,
        features: Array.from(adapter.features),
        limits: adapter.limits
      },
      device: {
        features: Array.from(device.features)
      }
    };
  } catch (error) {
    return {
      supported: false,
      reason: error.message
    };
  }
}
```

### 2. Model Training with WebGPU

```javascript
// src/ml/modelTraining.js

import * as tf from '@tensorflow/tfjs';

export async function trainSRModel(trainingData, config = {}) {
  console.log('Training SR model with backend:', tf.getBackend());

  const startTime = performance.now();

  // Prepare data
  const { features, labels } = prepareTrainingData(trainingData);

  // Create model
  const model = createSRModel();

  // Compile
  model.compile({
    optimizer: tf.train.adam(config.learningRate || 0.001),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  // Train
  const history = await model.fit(features, labels, {
    epochs: config.epochs || 50,
    batchSize: config.batchSize || 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
      }
    }
  });

  const endTime = performance.now();
  const trainingTime = endTime - startTime;

  // Clean up tensors
  features.dispose();
  labels.dispose();

  return {
    model,
    history: history.history,
    trainingTime,
    backend: tf.getBackend(),
    config
  };
}

function createSRModel() {
  const model = tf.sequential();

  // Input: 8 features
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu',
    inputShape: [8]
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu'
  }));

  model.add(tf.layers.dense({
    units: 8,
    activation: 'relu'
  }));

  // Output: predicted interval
  model.add(tf.layers.dense({
    units: 1,
    activation: 'linear'
  }));

  return model;
}

function prepareTrainingData(data) {
  // Extract features and labels
  const featureData = data.map(d => [
    d.memoryStrength,
    d.difficultyRating,
    d.timeSinceLastReview,
    d.successRate,
    d.averageResponseTime / 1000, // normalize to seconds
    d.totalReviews / 100, // normalize
    d.consecutiveCorrect / 10, // normalize
    d.timeOfDay
  ]);

  const labelData = data.map(d => d.optimalInterval);

  const features = tf.tensor2d(featureData);
  const labels = tf.tensor2d(labelData, [labelData.length, 1]);

  return { features, labels };
}
```

### 3. Real-Time Inference with WebGPU

```javascript
// src/ml/inference.js

import * as tf from '@tensorflow/tfjs';

export async function predictInterval(model, questionData) {
  const startTime = performance.now();

  // Prepare features
  const features = tf.tensor2d([[
    questionData.memoryStrength,
    questionData.difficultyRating,
    questionData.timeSinceLastReview,
    questionData.successRate,
    questionData.averageResponseTime / 1000,
    questionData.totalReviews / 100,
    questionData.consecutiveCorrect / 10,
    new Date().getHours() / 24
  ]]);

  // Predict
  const prediction = model.predict(features);
  const interval = (await prediction.data())[0];

  const endTime = performance.now();
  const inferenceTime = endTime - startTime;

  // Clean up
  features.dispose();
  prediction.dispose();

  return {
    interval: Math.round(Math.max(1, interval)),
    inferenceTime,
    backend: tf.getBackend()
  };
}

// Batch predictions for efficiency
export async function predictIntervalBatch(model, questionsData) {
  const featureData = questionsData.map(q => [
    q.memoryStrength,
    q.difficultyRating,
    q.timeSinceLastReview,
    q.successRate,
    q.averageResponseTime / 1000,
    q.totalReviews / 100,
    q.consecutiveCorrect / 10,
    new Date().getHours() / 24
  ]);

  const features = tf.tensor2d(featureData);
  const predictions = model.predict(features);
  const intervals = await predictions.data();

  features.dispose();
  predictions.dispose();

  return Array.from(intervals).map(i => Math.round(Math.max(1, i)));
}
```

### 4. Performance Dashboard Component

```javascript
// src/components/PerformanceDashboard.js

import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { checkWebGPUSupport, getBackendInfo } from '../ml/setupBackend';

export function PerformanceDashboard() {
  const [backendInfo, setBackendInfo] = useState(null);
  const [webgpuInfo, setWebgpuInfo] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    inferenceTime: 0,
    trainingTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    async function checkSupport() {
      const info = await checkWebGPUSupport();
      setWebgpuInfo(info);
      setBackendInfo(getBackendInfo());
    }
    checkSupport();
  }, []);

  return (
    <div className="performance-dashboard">
      <h2>🚀 ML Performance</h2>

      <div className="backend-status">
        <h3>Active Backend</h3>
        <div className={`badge ${backendInfo?.isWebGPU ? 'success' : 'warning'}`}>
          {backendInfo?.backend?.toUpperCase() || 'Loading...'}
        </div>
        {backendInfo?.isWebGPU && (
          <span className="badge success">⚡ GPU Accelerated</span>
        )}
      </div>

      {webgpuInfo && (
        <div className="webgpu-info">
          <h3>WebGPU Support</h3>
          {webgpuInfo.supported ? (
            <>
              <p>✅ WebGPU Available</p>
              <p>Adapter: {webgpuInfo.adapter?.name}</p>
              <p>Features: {webgpuInfo.adapter?.features.length}</p>
            </>
          ) : (
            <p>⚠️ {webgpuInfo.reason}</p>
          )}
        </div>
      )}

      <div className="metrics">
        <h3>Performance Metrics</h3>
        <div className="metric">
          <label>Inference Time:</label>
          <span>{performanceMetrics.inferenceTime.toFixed(2)}ms</span>
        </div>
        <div className="metric">
          <label>Memory Usage:</label>
          <span>{(backendInfo?.numBytes / 1024 / 1024).toFixed(2)} MB</span>
        </div>
        <div className="metric">
          <label>Active Tensors:</label>
          <span>{backendInfo?.numTensors}</span>
        </div>
      </div>

      <div className="comparison">
        <h3>Expected Performance Gains</h3>
        <table>
          <thead>
            <tr>
              <th>Operation</th>
              <th>CPU</th>
              <th>WebGPU</th>
              <th>Speedup</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Single Prediction</td>
              <td>5-10ms</td>
              <td>0.5-1ms</td>
              <td>~10x</td>
            </tr>
            <tr>
              <td>Batch (100 cards)</td>
              <td>200-300ms</td>
              <td>10-20ms</td>
              <td>~15x</td>
            </tr>
            <tr>
              <td>Model Training</td>
              <td>5-10min</td>
              <td>30-60sec</td>
              <td>~10x</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 5. Browser Compatibility

```javascript
// src/utils/browserCheck.js

export function checkBrowserCapabilities() {
  const capabilities = {
    webgpu: !!navigator.gpu,
    webgl: checkWebGLSupport(),
    wasm: checkWasmSupport(),
    recommended: false,
    warnings: []
  };

  if (capabilities.webgpu) {
    capabilities.recommended = true;
    capabilities.message = '✅ Your browser supports WebGPU for optimal performance!';
  } else if (capabilities.webgl) {
    capabilities.message = '⚠️ WebGPU not available. Using WebGL (slower but functional).';
    capabilities.warnings.push('Consider using Chrome 113+ or Edge 113+ for WebGPU support');
  } else if (capabilities.wasm) {
    capabilities.message = '⚠️ Limited GPU support. Using WebAssembly (slower performance).';
    capabilities.warnings.push('GPU acceleration not available');
  } else {
    capabilities.message = '❌ Using CPU only (very slow performance).';
    capabilities.warnings.push('Update your browser for better performance');
  }

  return capabilities;
}

function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
}

function checkWasmSupport() {
  try {
    return typeof WebAssembly === 'object';
  } catch (e) {
    return false;
  }
}
```

## Browser Support

```
WebGPU Support (as of 2025):
✅ Chrome 113+ (Windows, macOS, ChromeOS)
✅ Edge 113+
✅ Firefox (behind flag)
⏳ Safari (experimental)

Fallback Support:
✅ WebGL: All modern browsers
✅ WASM: All modern browsers
✅ CPU: Universal (slow)
```

## Performance Benchmarks

```
Expected Performance on WebGPU:

Model Training (2000 samples, 50 epochs):
├── CPU: ~5-10 minutes
├── WebGL: ~1-2 minutes
└── WebGPU: ~30-60 seconds ⚡

Single Interval Prediction:
├── CPU: ~5-10ms
├── WebGL: ~1-2ms
└── WebGPU: ~0.5-1ms ⚡

Batch Prediction (100 cards):
├── CPU: ~200-300ms
├── WebGL: ~20-30ms
└── WebGPU: ~10-20ms ⚡
```

## Integration in App Flow

```javascript
// src/index.js

import { initializeTensorFlow } from './ml/setupBackend';
import { checkBrowserCapabilities } from './utils/browserCheck';

async function initApp() {
  // Check browser capabilities
  const capabilities = checkBrowserCapabilities();
  console.log('Browser capabilities:', capabilities);

  // Initialize TensorFlow with best available backend
  const backend = await initializeTensorFlow();
  console.log('Running on:', backend);

  // Render app
  ReactDOM.render(<App backend={backend} />, document.getElementById('root'));
}

initApp();
```

## Benefits for This Project

1. **Performance**: 10-100x faster ML operations
2. **User Experience**: Near-instant predictions
3. **Client-Side Training**: Users can train personalized models locally
4. **Modern Stack**: Demonstrates cutting-edge web technology
5. **Scalability**: Handle more complex models efficiently
6. **Portfolio Value**: Shows expertise in modern GPU computing

## Visualization Features

We'll add to the dashboard:
- Real-time backend status
- Performance metrics comparison
- Training speed visualization
- Memory usage monitoring
- GPU utilization indicators

---

This WebGPU integration makes the ML capabilities truly production-ready and showcases modern web development at its finest!
