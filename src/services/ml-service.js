/**
 * Client-Side ML Service with WebGPU Acceleration
 *
 * Loads the trained interval prediction model and provides
 * GPU-accelerated predictions in the browser
 *
 * Backend fallback chain: WebGPU → WebGL → WASM → CPU
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';
import { createAdvancedFeatureVector, getFeatureArray } from './advanced-features.js';

class MLService {
  constructor() {
    this.model = null;
    this.normalizationStats = null;
    this.isLoaded = false;
    this.backend = null;
    this.performanceMetrics = {
      loadTime: 0,
      totalPredictions: 0,
      totalPredictionTime: 0,
      avgPredictionTime: 0
    };
  }

  /**
   * Initialize WebGPU backend with fallbacks
   */
  async initializeBackend() {
    console.log('🚀 Initializing TensorFlow.js backend...');

    const backends = ['webgpu', 'webgl', 'wasm', 'cpu'];
    let selectedBackend = null;

    for (const backend of backends) {
      try {
        console.log(`   Trying ${backend.toUpperCase()}...`);
        await tf.setBackend(backend);
        await tf.ready();

        // Verify backend is working
        const testTensor = tf.tensor([1, 2, 3]);
        const result = testTensor.mul(2);
        await result.data();
        testTensor.dispose();
        result.dispose();

        selectedBackend = backend;
        console.log(`   ✓ ${backend.toUpperCase()} backend initialized`);
        break;

      } catch (error) {
        console.log(`   ✗ ${backend.toUpperCase()} not available: ${error.message}`);
        continue;
      }
    }

    if (!selectedBackend) {
      throw new Error('No TensorFlow.js backend available');
    }

    this.backend = selectedBackend;

    // Get performance info
    const backendInfo = {
      webgpu: '🚀 WebGPU (10-100x faster, GPU-accelerated)',
      webgl: '⚡ WebGL (5-20x faster, GPU-accelerated)',
      wasm: '💨 WebAssembly (2-5x faster, CPU SIMD)',
      cpu: '🐌 CPU (baseline performance)'
    };

    console.log(`\n   ${backendInfo[selectedBackend]}`);

    return selectedBackend;
  }

  /**
   * Load the trained model
   */
  async loadModel(modelPath = '/models/model.json') {
    const startTime = performance.now();

    try {
      console.log('\n📦 Loading ML model...');

      // Initialize backend
      await this.initializeBackend();

      // Load model using TensorFlow.js built-in loader
      console.log(`\n📥 Loading model from ${modelPath}...`);
      this.model = await tf.loadLayersModel(modelPath);

      // Load normalization stats
      const statsResponse = await fetch('/models/normalization-stats.json');
      this.normalizationStats = await statsResponse.json();

      // Load metadata
      const metadataResponse = await fetch('/models/metadata.json');
      const metadata = await metadataResponse.json();

      const loadTime = performance.now() - startTime;
      this.performanceMetrics.loadTime = loadTime;

      console.log(`\n✓ Model loaded successfully!`);
      console.log(`   Load time: ${loadTime.toFixed(2)}ms`);
      console.log(`   Backend: ${this.backend.toUpperCase()}`);
      console.log(`   Training MAE: ${metadata.performance.testMAE.toFixed(4)} days`);
      console.log(`   Improvement: ${metadata.performance.improvement.toFixed(1)}%`);

      this.isLoaded = true;

      return {
        backend: this.backend,
        loadTime,
        metadata
      };

    } catch (error) {
      console.error('❌ Failed to load ML model:', error);
      throw error;
    }
  }

  /**
   * Normalize features using stored statistics
   */
  normalizeFeatures(features) {
    if (!this.normalizationStats) {
      throw new Error('Normalization stats not loaded');
    }

    const normalized = [];
    for (let i = 0; i < features.length; i++) {
      const mean = this.normalizationStats.mean[i];
      const std = this.normalizationStats.std[i];
      normalized.push((features[i] - mean) / std);
    }

    return normalized;
  }

  /**
   * Predict optimal interval for a question
   */
  async predict(questionFeatures, reviewHistory = null) {
    if (!this.isLoaded || !this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    const startTime = performance.now();

    try {
      // Create base features object
      const baseFeatures = {
        memoryStrength: questionFeatures.memoryStrength || 1,
        difficultyRating: questionFeatures.difficultyRating || 0.5,
        timeSinceLastReview: questionFeatures.timeSinceLastReview || 0,
        successRate: questionFeatures.successRate || 0,
        averageResponseTime: questionFeatures.averageResponseTime || 0,
        totalReviews: questionFeatures.totalReviews || 0,
        consecutiveCorrect: questionFeatures.consecutiveCorrect || 0,
        timeOfDay: questionFeatures.timeOfDay || (new Date().getHours() / 24)
      };

      // Generate advanced features (51 dimensions)
      const advancedFeatures = createAdvancedFeatureVector(baseFeatures, reviewHistory);
      const featureVector = getFeatureArray(advancedFeatures);

      const normalizedFeatures = this.normalizeFeatures(featureVector);

      // Create tensor and predict
      const inputTensor = tf.tensor2d([normalizedFeatures]);
      const predictionTensor = this.model.predict(inputTensor);
      const predictionData = await predictionTensor.data();
      const interval = Math.max(1, Math.round(predictionData[0]));

      // Cleanup tensors
      inputTensor.dispose();
      predictionTensor.dispose();

      // Update metrics
      const predictionTime = performance.now() - startTime;
      this.performanceMetrics.totalPredictions++;
      this.performanceMetrics.totalPredictionTime += predictionTime;
      this.performanceMetrics.avgPredictionTime =
        this.performanceMetrics.totalPredictionTime / this.performanceMetrics.totalPredictions;

      return {
        interval,
        predictionTime,
        backend: this.backend,
        advancedFeatures,
        normalizedFeatures,
      };

    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  /**
   * Get activations from all layers for visualization
   */
  async getActivations(normalizedFeatures) {
    if (!this.isLoaded || !this.model) {
      throw new Error('Model not loaded');
    }

    // Create a model that outputs all intermediate activations
    const activationModel = tf.model({
      inputs: this.model.inputs,
      outputs: this.model.layers.map(layer => layer.output)
    });

    const inputTensor = tf.tensor2d([normalizedFeatures]);
    const activations = activationModel.predict(inputTensor);

    // Add input tensor to the beginning of the activations array
    const allActivations = [inputTensor, ...activations];

    return allActivations;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      backend: this.backend,
      isLoaded: this.isLoaded,
      memoryUsage: tf.memory()
    };
  }

  /**
   * Get current backend info
   */
  getBackendInfo() {
    const capabilities = {
      webgpu: {
        name: 'WebGPU',
        speedup: '10-100x',
        description: 'Next-gen GPU compute API',
        supported: this.backend === 'webgpu'
      },
      webgl: {
        name: 'WebGL 2.0',
        speedup: '5-20x',
        description: 'GPU-accelerated graphics API',
        supported: this.backend === 'webgl'
      },
      wasm: {
        name: 'WebAssembly',
        speedup: '2-5x',
        description: 'CPU SIMD acceleration',
        supported: this.backend === 'wasm'
      },
      cpu: {
        name: 'CPU',
        speedup: '1x',
        description: 'JavaScript baseline',
        supported: this.backend === 'cpu'
      }
    };

    return {
      current: capabilities[this.backend] || capabilities.cpu,
      available: capabilities,
      speedup: capabilities[this.backend]?.speedup || '1x'
    };
  }

  /**
   * Check if model is ready
   */
  isReady() {
    return this.isLoaded && this.model !== null;
  }
}

// Export singleton instance
const mlService = new MLService();

export default mlService;
