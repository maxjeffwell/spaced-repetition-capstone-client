import React from 'react';
import {connect} from 'react-redux';
import {Link, Navigate} from 'react-router-dom';

import LoginForm from './login-form';
import './landing-page.css';

export function LandingPage(props) {
    // If we are logged in redirect straight to the learning page
    if (props.loggedIn) {
        return <Navigate to="/learn" replace />;
    }

    return (
        <div className="landing-page">
            <div className="landing-container">
                <div className="landing-header">
                    <h1>🧠 Neural-Enhanced Learning</h1>
                    <p className="landing-subtitle">
                        Master Spanish vocabulary with AI-powered spaced repetition
                    </p>
                </div>

                <div className="login-section">
                    <h2>Sign In</h2>
                    <LoginForm />
                </div>

                <div className="features-section">
                    <div className="feature">
                        <span className="feature-icon">🚀</span>
                        <h3>WebGPU Acceleration</h3>
                        <p>Lightning-fast ML predictions powered by your GPU</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🎯</span>
                        <h3>Adaptive Learning</h3>
                        <p>AI predicts optimal review intervals for maximum retention</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">📊</span>
                        <h3>Real-time Analytics</h3>
                        <p>Track your progress with detailed performance metrics</p>
                    </div>
                </div>

                <div className="register-section">
                    <p>Don't have an account?</p>
                    <Link to="/register" className="register-link">Create Account</Link>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    loggedIn: state.auth.currentUser !== null
});

export default connect(mapStateToProps)(LandingPage);
