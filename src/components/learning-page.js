import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import apiService from '../services/api-service';
import mlService from '../services/ml-service';
import MLStatus from './ml-status';
import './learning-page.css';

export class LearningPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Question state
      question: null,
      questionId: null,
      answer: '',
      isSubmitting: false,

      // Timing
      questionStartTime: null,
      responseTime: null,

      // Feedback
      feedback: null,
      showFeedback: false,
      correct: null,

      // Stats
      stats: {
        totalReviews: 0,
        correctAnswers: 0,
        currentStreak: 0
      },

      // ML
      mlInfo: {
        isLoaded: false,
        backend: null,
        metrics: null,
        metadata: null
      },

      // State
      loading: true,
      error: null
    };
  }

  async componentDidMount() {
    // Initialize ML service
    this.initializeML();

    // Load first question
    this.loadNextQuestion();
  }

  async initializeML() {
    try {
      const loadResult = await mlService.loadModel();

      this.setState({
        mlInfo: {
          isLoaded: true,
          backend: loadResult.backend,
          metadata: loadResult.metadata,
          metrics: mlService.getMetrics(),
          backendInfo: mlService.getBackendInfo()
        }
      });

      console.log('✓ ML service initialized:', loadResult.backend);
    } catch (error) {
      console.error('Failed to load ML service:', error);
      // Continue without ML - will use baseline
    }
  }

  async loadNextQuestion() {
    this.setState({ loading: true, error: null });

    try {
      const data = await apiService.getNextQuestion();

      if (!data.question) {
        this.setState({
          question: null,
          loading: false,
          error: 'No questions available. Great job!'
        });
        return;
      }

      this.setState({
        question: data.question,
        questionId: data.questionId,
        stats: data.stats,
        questionStartTime: Date.now(),
        answer: '',
        showFeedback: false,
        feedback: null,
        correct: null,
        loading: false
      });

    } catch (error) {
      this.setState({
        error: error.message,
        loading: false
      });
    }
  }

  handleAnswerChange = (e) => {
    this.setState({ answer: e.target.value });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    if (!this.state.answer.trim()) {
      return;
    }

    this.setState({ isSubmitting: true });

    const responseTime = Date.now() - this.state.questionStartTime;

    try {
      const result = await apiService.submitAnswer(
        this.state.answer,
        responseTime
      );

      this.setState({
        correct: result.correct,
        feedback: result.feedback,
        showFeedback: true,
        isSubmitting: false,
        stats: result.stats,
        // Update ML metrics
        mlInfo: {
          ...this.state.mlInfo,
          metrics: mlService.getMetrics()
        }
      });

    } catch (error) {
      this.setState({
        error: error.message,
        isSubmitting: false
      });
    }
  }

  handleNext = () => {
    this.loadNextQuestion();
  }

  render() {
    if (!this.props.loggedIn) {
      return <Navigate to="/" replace />;
    }

    const { question, answer, showFeedback, feedback, correct, stats, loading, error, isSubmitting, mlInfo } = this.state;

    return (
      <div className="learning-page">
        <div className="learning-container">
          <h1>🧠 Neural-Enhanced Learning</h1>

          {/* ML Status Banner */}
          <MLStatus mlInfo={mlInfo} />

          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat">
              <label>Reviews</label>
              <span className="value">{stats.totalReviews}</span>
            </div>
            <div className="stat">
              <label>Correct</label>
              <span className="value correct">{stats.correctAnswers}</span>
            </div>
            <div className="stat">
              <label>Streak</label>
              <span className="value streak">{stats.currentStreak}🔥</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading question...</p>
            </div>
          )}

          {/* Question Display */}
          {!loading && question && !showFeedback && (
            <div className="question-card">
              <div className="question-label">Translate to English:</div>
              <div className="question-text">{question}</div>

              <form onSubmit={this.handleSubmit} className="answer-form">
                <input
                  type="text"
                  value={answer}
                  onChange={this.handleAnswerChange}
                  placeholder="Type your answer..."
                  className="answer-input"
                  autoFocus
                  disabled={isSubmitting}
                />

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting || !answer.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </form>
            </div>
          )}

          {/* Feedback Display */}
          {showFeedback && feedback && (
            <div className={`feedback-card ${correct ? 'correct' : 'incorrect'}`}>
              <div className="feedback-header">
                <span className="feedback-icon">
                  {correct ? '✓' : '✗'}
                </span>
                <span className="feedback-text">
                  {correct ? 'Correct!' : 'Not Quite'}
                </span>
              </div>

              {!correct && (
                <div className="correct-answer">
                  The answer was: <strong>{feedback.correctAnswer || 'N/A'}</strong>
                </div>
              )}

              <div className="interval-info">
                <h3>Next Review</h3>
                <div className="interval-display">
                  <div className="interval-value">{feedback.intervalUsed}</div>
                  <div className="interval-unit">days</div>
                </div>
                <div className="interval-date">
                  {new Date(feedback.nextReviewDate).toLocaleDateString()}
                </div>
              </div>

              {/* Algorithm Comparison */}
              <div className="algorithm-comparison">
                <h4>Algorithm Predictions</h4>
                <div className="comparison-grid">
                  <div className="algorithm-pred baseline">
                    <label>SM-2 Baseline</label>
                    <span className="value">{feedback.baselineInterval} days</span>
                  </div>

                  {feedback.mlInterval !== null && (
                    <div className="algorithm-pred ml">
                      <label>ML Enhanced</label>
                      <span className="value">{feedback.mlInterval} days</span>
                    </div>
                  )}

                  <div className="algorithm-used">
                    <label>Used</label>
                    <span className={`value ${feedback.algorithmUsed}`}>
                      {feedback.algorithmUsed.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="performance-stats">
                <div className="perf-stat">
                  <label>Quality</label>
                  <span className="value">{feedback.quality}/5</span>
                </div>
                <div className="perf-stat">
                  <label>Success Rate</label>
                  <span className="value">{(feedback.stats.successRate * 100).toFixed(0)}%</span>
                </div>
                <div className="perf-stat">
                  <label>Total Reviews</label>
                  <span className="value">{feedback.stats.totalReviews}</span>
                </div>
                <div className="perf-stat">
                  <label>Consecutive</label>
                  <span className="value">{feedback.stats.consecutiveCorrect}</span>
                </div>
              </div>

              <button
                onClick={this.handleNext}
                className="next-button"
              >
                Next Question →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loggedIn: state.auth.currentUser !== null
});

export default connect(mapStateToProps)(LearningPage);
