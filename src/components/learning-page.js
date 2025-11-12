import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import apiService from '../services/api-service';
import mlService from '../services/ml-service';
import MLStatus from './ml-status';
import NavBar from './nav-bar';
import styles from './learning-page.module.css';

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
      <div className={styles.learningPage}>
        <div className={styles.learningContainer}>
          <h1>🧠 Neural-Enhanced Learning</h1>

          {/* Navigation */}
          <NavBar />

          {/* ML Status Banner */}
          <MLStatus mlInfo={mlInfo} />

          {/* Stats Bar */}
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <label>Reviews</label>
              <span className={styles.value}>{stats.totalReviews}</span>
            </div>
            <div className={styles.stat}>
              <label>Correct</label>
              <span className={`${styles.value} ${styles.correct}`}>{stats.correctAnswers}</span>
            </div>
            <div className={styles.stat}>
              <label>Streak</label>
              <span className={`${styles.value} ${styles.streak}`}>{stats.currentStreak}🔥</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading question...</p>
            </div>
          )}

          {/* Question Display */}
          {!loading && question && !showFeedback && (
            <div className={styles.questionCard}>
              <div className={styles.questionLabel}>Translate to English:</div>
              <div className={styles.questionText}>{question}</div>

              <form onSubmit={this.handleSubmit} className={styles.answerForm}>
                <input
                  type="text"
                  value={answer}
                  onChange={this.handleAnswerChange}
                  placeholder="Type your answer..."
                  className={styles.answerInput}
                  autoFocus
                  disabled={isSubmitting}
                />

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || !answer.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </form>
            </div>
          )}

          {/* Feedback Display */}
          {showFeedback && feedback && (
            <div className={`${styles.feedbackCard} ${correct ? styles.correct : styles.incorrect}`}>
              <div className={styles.feedbackHeader}>
                <span className={styles.feedbackIcon}>
                  {correct ? '✓' : '✗'}
                </span>
                <span className={styles.feedbackText}>
                  {correct ? 'Correct!' : 'Not Quite'}
                </span>
              </div>

              {!correct && (
                <div className={styles.correctAnswer}>
                  The answer was: <strong>{feedback.correctAnswer || 'N/A'}</strong>
                </div>
              )}

              <div className={styles.intervalInfo}>
                <h3>Next Review</h3>
                <div className={styles.intervalDisplay}>
                  <div className={styles.intervalValue}>{feedback.intervalUsed}</div>
                  <div className={styles.intervalUnit}>days</div>
                </div>
                <div className={styles.intervalDate}>
                  {new Date(feedback.nextReviewDate).toLocaleDateString()}
                </div>
              </div>

              {/* Algorithm Comparison */}
              <div className={styles.algorithmComparison}>
                <h4>Algorithm Predictions</h4>
                <div className={styles.comparisonGrid}>
                  <div className={`${styles.algorithmPred} ${styles.baseline}`}>
                    <label>SM-2 Baseline</label>
                    <span className={styles.value}>{feedback.baselineInterval} days</span>
                  </div>

                  {feedback.mlInterval !== null && (
                    <div className={`${styles.algorithmPred} ${styles.ml}`}>
                      <label>ML Enhanced</label>
                      <span className={styles.value}>{feedback.mlInterval} days</span>
                    </div>
                  )}

                  <div className={styles.algorithmUsed}>
                    <label>Used</label>
                    <span className={`${styles.value} ${styles[feedback.algorithmUsed]}`}>
                      {feedback.algorithmUsed.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className={styles.performanceStats}>
                <div className={styles.perfStat}>
                  <label>Quality</label>
                  <span className={styles.value}>{feedback.quality}/5</span>
                </div>
                <div className={styles.perfStat}>
                  <label>Success Rate</label>
                  <span className={styles.value}>{(feedback.stats.successRate * 100).toFixed(0)}%</span>
                </div>
                <div className={styles.perfStat}>
                  <label>Total Reviews</label>
                  <span className={styles.value}>{feedback.stats.totalReviews}</span>
                </div>
                <div className={styles.perfStat}>
                  <label>Consecutive</label>
                  <span className={styles.value}>{feedback.stats.consecutiveCorrect}</span>
                </div>
              </div>

              <button
                onClick={this.handleNext}
                className={styles.nextButton}
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
