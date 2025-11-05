import React from 'react';
import {connect} from 'react-redux';
import {Link, Navigate} from 'react-router-dom';

import RegistrationForm from './registration-form';

export function RegistrationPage(props) {
    // If we are logged in (which happens automatically when registration
    // is successful) redirect to the learning page
    if (props.loggedIn) {
        return <Navigate to="/learn" replace />;
    }
    return (
        <div className="home">
            <h2>Register for Foo App</h2>
            <RegistrationForm />
            <Link to="/">Login</Link>
        </div>
    );
}

const mapStateToProps = state => ({
    loggedIn: state.auth.currentUser !== null
});

export default connect(mapStateToProps)(RegistrationPage);
