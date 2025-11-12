import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {clearAuth} from '../actions/auth';
import {clearAuthToken} from '../local-storage';

export class HeaderBar extends React.Component {
    logOut() {
        this.props.dispatch(clearAuth());
        clearAuthToken();
    }

    render() {
        // Only render the greeting and the log-out button if we are logged in
        let logOutButton;
        let navLinks;
        if (this.props.loggedIn) {
            logOutButton = (
                <button onClick={() => this.logOut()}>Log out</button>
            );
            navLinks = (
                <nav className="nav-links">
                    <Link to="/learn">Learn</Link>
                    <Link to="/stats">Stats</Link>
                </nav>
            );
        }
        return (
            <div className="header-bar">
                <h1>🧠 IntervalAI - Neural Learning</h1>
                {navLinks}
                {logOutButton}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    loggedIn: state.auth.currentUser !== null,
});

export default connect(mapStateToProps)(HeaderBar);
