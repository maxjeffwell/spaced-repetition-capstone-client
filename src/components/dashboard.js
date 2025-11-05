import React from 'react';
import {connect} from 'react-redux';
import {Navigate} from 'react-router-dom';
import requiresLogin from './requires-login';

export class Dashboard extends React.Component {
    render() {
        // Redirect to the new learning page
        return <Navigate to="/learn" replace />;
    }
}

const mapStateToProps = state => ({
    loggedIn: state.auth.currentUser !== null
});

export default requiresLogin()(connect(mapStateToProps)(Dashboard));
