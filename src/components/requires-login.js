import React from 'react';
import {connect} from 'react-redux';
import {Navigate} from 'react-router-dom';

export default () => Component => {
    function RequiresLogin(props) {
        const {authenticating, loggedIn, error, ...passThroughProps} = props;
        if (authenticating) {
            return <div>Logging in...</div>;
        } else if (!loggedIn || error) {
            return <Navigate to="/" replace />;
        }

        return <Component {...passThroughProps} />;
    }

    const displayName = Component.displayName || Component.name || 'Component';
    RequiresLogin.displayName = `RequiresLogin(${displayName})`;

    const mapStateToProps = (state, props) => ({
        authenticating: state.auth.loading,
        loggedIn: state.auth.currentUser !== null,
        error: state.auth.error
    });

    return connect(mapStateToProps)(RequiresLogin);
};
