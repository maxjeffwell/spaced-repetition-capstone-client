import React, { Component } from 'react';
import mlService from '../services/ml-service';
import MLStatus from './ml-status';
import './ml-demo.css';

/**
 * ML Demo Component
 *
 * Tests and demonstrates WebGPU-accelerated ML predictions
 */
export default class MLDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mlInfo: {
        isLoaded: false,
        backend: null,
        metrics: null,
        metadata: null,
        backendInfo: null
      },
      testResults: [],
      isLoading: true,
      error: null
    };
  }

  async componentDidMount() {
    try {
      console.log('🚀 Starting ML service...');

      // Load model
      const loadResult = await mlService.loadModel();

      // Update state with ML info
      this.setState({
        mlInfo: {
          isLoaded: true,
          backend: loadResult.backend,
          metadata: loadResult.metadata,
          metrics: mlService.getMetrics(),
          backendInfo: mlService.getBackendInfo().current
        },
        isLoading: false
      });

      // Run test predictions
      this.runTestPredictions();

    } catch (error) {
      console.error('Failed to initialize ML service:', error);
      this.setState({
        error: error.message,
        isLoading: false
      });
    }
  }

  async runTestPredictions() {
    console.log('\n🧪 Running test predictions...');

    const testCases = [
      {
        name: 'New card (never reviewed)',
        features: {
          memoryStrength: 1,
          difficultyRating: 0.5,
          timeSinceLastReview: 0,
          successRate: 0,
          averageResponseTime: 0,
          totalReviews: 0,
          consecutiveCorrect: 0,
          timeOfDay: 0.5
        }
      },
      {
        name: 'Easy card (high success)',
        features: {
          memoryStrength: 6,
          difficultyRating: 0.2,
          timeSinceLastReview: 6,
          successRate: 0.9,
          averageResponseTime: 1500,
          totalReviews: 10,
          consecutiveCorrect: 5,
          timeOfDay: 0.5
        }
      },
      {
        name: 'Difficult card (struggling)',
        features: {
          memoryStrength: 1,
          difficultyRating: 0.7,
          timeSinceLastReview: 1,
          successRate: 0.4,
          averageResponseTime: 4500,
          totalReviews: 8,
          consecutiveCorrect: 0,
          timeOfDay: 0.5
        }
      },
      {
        name: 'Mastered card (perfect recall)',
        features: {
          memoryStrength: 30,
          difficultyRating: 0.1,
          timeSinceLastReview: 30,
          successRate: 0.95,
          averageResponseTime: 1200,
          totalReviews: 20,
          consecutiveCorrect: 10,
          timeOfDay: 0.5
        }
      }
    ];

    const results = [];

    for (const testCase of testCases) {
      try {
        const prediction = await mlService.predict(testCase.features);

        results.push({
          name: testCase.name,
          features: testCase.features,
          prediction: prediction.interval,
          predictionTime: prediction.predictionTime,
          backend: prediction.backend
        });

        console.log(`   ${testCase.name}: ${prediction.interval} days (${prediction.predictionTime.toFixed(2)}ms)`);

      } catch (error) {
        console.error(`   Error predicting ${testCase.name}:`, error);
      }
    }

    this.setState({ testResults: results });

    // Update metrics
    this.setState(prevState => ({
      mlInfo: {
        ...prevState.mlInfo,
        metrics: mlService.getMetrics()
      }
    }));
  }

  render() {
    const { mlInfo, testResults, isLoading, error } = this.state;

    if (error) {
      return (
        <div className="ml-demo">
          <h2>❌ ML Service Error</h2>
          <div className="error-message">{error}</div>
          <p>The ML model could not be loaded. Using baseline algorithm only.</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="ml-demo">
          <h2>Loading ML Service...</h2>
          <div className="loading-spinner">⏳</div>
        </div>
      );
    }

    return (
      <div className="ml-demo">
        <h2>🤖 ML-Enhanced Predictions</h2>

        <MLStatus mlInfo={mlInfo} />

        <div className="test-results">
          <h3>Test Predictions</h3>

          {testResults.map((result, idx) => (
            <div key={idx} className="test-result">
              <div className="test-result-header">
                <strong>{result.name}</strong>
                <span className="prediction-value">{result.prediction} days</span>
              </div>

              <div className="test-result-details">
                <div className="feature-grid">
                  <div className="feature">
                    <label>Success Rate:</label>
                    <value>{(result.features.successRate * 100).toFixed(0)}%</value>
                  </div>
                  <div className="feature">
                    <label>Reviews:</label>
                    <value>{result.features.totalReviews}</value>
                  </div>
                  <div className="feature">
                    <label>Streak:</label>
                    <value>{result.features.consecutiveCorrect}</value>
                  </div>
                  <div className="feature">
                    <label>Prediction Time:</label>
                    <value>{result.predictionTime.toFixed(2)}ms</value>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="backend-info">
          <h3>Backend Capabilities</h3>
          <div className="backend-grid">
            {Object.entries(mlInfo.backendInfo?.available || {}).map(([key, info]) => (
              <div
                key={key}
                className={`backend-card ${info.supported ? 'supported' : 'unsupported'}`}
              >
                <div className="backend-name">{info.name}</div>
                <div className="backend-speedup">{info.speedup}</div>
                <div className="backend-desc">{info.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="memory-usage">
          <h4>GPU Memory Usage</h4>
          <pre>{JSON.stringify(mlInfo.metrics?.memoryUsage, null, 2)}</pre>
        </div>
      </div>
    );
  }
}
