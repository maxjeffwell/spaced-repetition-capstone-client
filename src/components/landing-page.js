import React from 'react';
import {connect} from 'react-redux';
import {Link, Redirect} from 'react-router-dom';

import LoginForm from './login-form';

export function LandingPage(props) {
    // If we are logged in redirect straight to the user's dashboard
    if (props.loggedIn) {
        return <Redirect to="/dashboard" />;
    }

    return (
        <div className="home">
            <h2>Welcome to Speakeasy...do you know the secret knock?</h2>
            <LoginForm />
            <p>Do you find yourself nodding along with your smart tech friends, coworkers, or worse, your boss, as if you understand the latest tech jargon? All the while, secretly hoping that you won't have to feign choking on your drink if someone asks you a question? Are you yearning to get into the club but can't quite speak the language? Welcome to Speakeasy, where it's fun to stay up to date with all the latest secret knocks that open doors... </p>
            <Link to="/register">Become one of the club</Link>
        </div>
    );
}

const mapStateToProps = state => ({
    loggedIn: state.auth.currentUser !== null
});

export default connect(mapStateToProps)(LandingPage);
