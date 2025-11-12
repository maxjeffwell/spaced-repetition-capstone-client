import React from 'react';
import {connect} from 'react-redux';
import {Link, Navigate} from 'react-router-dom';

import LoginForm from './login-form';
import styles from './landing-page.module.css';

export function LandingPage(props) {
    // If we are logged in redirect straight to the learning page
    if (props.loggedIn) {
        return <Navigate to="/learn" replace />;
    }

    return (
        <div className={styles.landingPage}>
            <div className={styles.landingContainer}>
                <div className={styles.brandLogo}>
                    <div className={styles.logoGrid}>
                        <div className={styles.logoRow}>
                            {'INTERVAL'.split('').map((letter, index) => (
                                <div key={index} className={styles.logoLetter}>
                                    {letter}
                                </div>
                            ))}
                        </div>
                        <div className={styles.logoRow}>
                            {'AI'.split('').map((letter, index) => (
                                <div key={`ai-${index}`} className={styles.logoLetter}>
                                    {letter}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.landingHeader}>
                    <h1>🧠 Neural-Enhanced Learning</h1>
                    <p className={styles.landingSubtitle}>
                        Master Spanish vocabulary with AI-powered spaced repetition
                    </p>
                </div>

                <div className={styles.loginSection}>
                    <h2>Sign In</h2>
                    <LoginForm />
                </div>

                <div className={styles.featuresSection}>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🚀</span>
                        <h3>WebGPU Acceleration</h3>
                        <p>Lightning-fast ML predictions powered by your GPU</p>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🎯</span>
                        <h3>Adaptive Learning</h3>
                        <p>AI predicts optimal review intervals for maximum retention</p>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📊</span>
                        <h3>Real-time Analytics</h3>
                        <p>Track your progress with detailed performance metrics</p>
                    </div>
                </div>

                <div className={styles.registerSection}>
                    <p>Don't have an account?</p>
                    <Link to="/register" className={styles.registerLink}>Create Account</Link>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    loggedIn: state.auth.currentUser !== null
});

export default connect(mapStateToProps)(LandingPage);
