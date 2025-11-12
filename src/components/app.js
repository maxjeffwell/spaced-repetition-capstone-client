import React from 'react';
import {connect} from 'react-redux';
import {Routes, Route} from 'react-router-dom';

import LandingPage from './landing-page';
import Dashboard from './dashboard';
import LearningPage from './learning-page';
import StatsDashboard from './stats-dashboard';
import RegistrationPage from './registration-page';
import MLDemo from './ml-demo';
import {refreshAuthToken} from '../actions/auth';

export class App extends React.Component {
    componentDidUpdate(prevProps) {
        if (!prevProps.loggedIn && this.props.loggedIn) {
            // When we are logged in, refresh the auth token periodically
            this.startPeriodicRefresh();
        } else if (prevProps.loggedIn && !this.props.loggedIn) {
            // Stop refreshing when we log out
            this.stopPeriodicRefresh();
        }
    }

    componentWillUnmount() {
        this.stopPeriodicRefresh();
    }

    startPeriodicRefresh() {
        this.refreshInterval = setInterval(
            () => this.props.dispatch(refreshAuthToken()),
            60 * 60 * 1000 // One hour
        );
    }

    stopPeriodicRefresh() {
        if (!this.refreshInterval) {
            return;
        }

        clearInterval(this.refreshInterval);
    }

    render() {
        return (
            <div className="app">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/learn" element={<LearningPage />} />
                    <Route path="/stats" element={<StatsDashboard />} />
                    <Route path="/ml-demo" element={<MLDemo />} />
                    <Route path="/register" element={<RegistrationPage />} />
                </Routes>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    hasAuthToken: state.auth.authToken !== null,
    loggedIn: state.auth.currentUser !== null
});

export default connect(mapStateToProps)(App);
