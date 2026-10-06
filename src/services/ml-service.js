/**
 * Client-Side ML Service with WebGPU Acceleration
 *
 * Loads the trained interval prediction model and provides
 * GPU-accelerated predictions in the browser
 *
 * Backend fallback chain: WebGPU → WebGL → WASM → CPU
 */

import * as tf from '@tensorflow/tfjs';
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

    // Dynamically import WebGPU backend
    try {
      await import('@tensorflow/tfjs-backend-webgpu');
      console.log('   WebGPU backend loaded');
    } catch (error) {
      console.log('   WebGPU backend not available, using fallback');
    }

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
  // v2 (2026-10-06): 24 growth-encoding features incl. the graded outcome. Served
  // from its own directory so caches (Cloudflare, browsers) never hand a v1
  // bundle v2 files or vice versa.
  async loadModel(modelDir = '/models/v2') {
    const startTime = performance.now();

    try {
      console.log('\n📦 Loading ML model...');

      // Initialize backend
      await this.initializeBackend();

      // Load model using TensorFlow.js built-in loader
      // Add cache-busting parameter to force fresh fetch
      const cacheBuster = `?v=${Date.now()}`;
      const modelPath = `${modelDir}/model.json`;
      const modelUrlWithCache = modelPath + cacheBuster;
      console.log(`\n📥 Loading model from ${modelPath}...`);
      this.model = await tf.loadLayersModel(modelUrlWithCache);

      // Load normalization stats (with cache busting)
      const statsResponse = await fetch(`${modelDir}/normalization-stats.json${cacheBuster}`);
      this.normalizationStats = await statsResponse.json();

      // Load metadata (with cache busting)
      const metadataResponse = await fetch(`${modelDir}/metadata.json${cacheBuster}`);
      const metadata = await metadataResponse.json();

      const expected = this.model.inputs[0].shape[1];
      if (this.normalizationStats.mean.length !== expected) {
        throw new Error(`Normalization stats (${this.normalizationStats.mean.length}) do not match model input (${expected})`);
      }

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
    const MIN_STD = 1e-7; // Minimum std to avoid division by zero

    for (let i = 0; i < features.length; i++) {
      const mean = this.normalizationStats.mean[i];
      const std = this.normalizationStats.std[i];

      // If std is too small (constant feature), just subtract mean
      if (Math.abs(std) < MIN_STD) {
        normalized.push(features[i] - mean);
      } else {
        normalized.push((features[i] - mean) / std);
      }
    }

    return normalized;
  }

  /**
   * Predict the next interval for BOTH possible outcomes of the answer the user
   * is about to submit. The browser does not know whether the answer is right
   * (the server grades it), so it sends { ifCorrect, ifIncorrect } and the
   * server applies the branch matching the graded answer.
   */
  async predictBothOutcomes(questionFeatures, reviewHistory = null) {
    const startTime = performance.now();
    const correct = await this.predict(questionFeatures, reviewHistory, true);
    const incorrect = await this.predict(questionFeatures, reviewHistory, false);
    if (!correct || !incorrect) return null;
    return {
      ifCorrect: correct.interval,
      ifIncorrect: incorrect.interval,
      predictionTime: performance.now() - startTime,
      backend: this.backend,
      normalizedFeatures: correct.normalizedFeatures,
      advancedFeatures: correct.advancedFeatures
    };
  }

  /**
   * Predict optimal interval for a question, given the outcome of the current
   * answer (recalled = true/false). Defaults to the "recalled" branch.
   */
  async predict(questionFeatures, reviewHistory = null, recalled = true) {
    if (!this.isLoaded || !this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    const startTime = performance.now();

    try {
      // Create base features object (v2: card state + graded outcome; no elapsed-time inputs)
      const baseFeatures = {
        memoryStrength: questionFeatures.memoryStrength || 1,
        difficultyRating: questionFeatures.difficultyRating || 0.5,
        successRate: questionFeatures.successRate || 0,
        averageResponseTime: questionFeatures.averageResponseTime || 0,
        totalReviews: questionFeatures.totalReviews || 0,
        consecutiveCorrect: questionFeatures.consecutiveCorrect || 0,
        timeOfDay: questionFeatures.timeOfDay || (new Date().getHours() / 24),
        recalled: recalled ? 1 : 0
      };

      // Generate the v2 feature vector (24 dimensions)
      const advancedFeatures = createAdvancedFeatureVector(baseFeatures, reviewHistory);
      const featureVector = getFeatureArray(advancedFeatures);

      const normalizedFeatures = this.normalizeFeatures(featureVector);

      // Create tensor and predict
      const inputTensor = tf.tensor2d([normalizedFeatures]);
      const predictionTensor = this.model.predict(inputTensor);
      const predictionData = await predictionTensor.data();
      const rawPrediction = predictionData[0];

      // Debug logging
      console.log('🔍 ML Prediction Debug:');
      console.log('  Raw model output:', rawPrediction);
      console.log('  First 10 normalized features:', normalizedFeatures.slice(0, 10));
      console.log('  Question features:', {
        memoryStrength: questionFeatures.memoryStrength,
        successRate: questionFeatures.successRate,
        totalReviews: questionFeatures.totalReviews
      });

      // Sanity check: a non-finite output means the model/stats are broken; let the
      // server predict instead (it runs the same v2 model on OVMS).
      if (!Number.isFinite(rawPrediction)) {
        console.warn('⚠️ ML model returned a non-finite value; letting the server predict instead.');
        return null;
      }

      const interval = Math.max(1, Math.min(365, Math.round(rawPrediction)));

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
