import React from 'react';
import {connect} from 'react-redux';
import requiresLogin from './requires-login';
import {fetchProtectedData} from '../actions/protected-data';

export class Dashboard extends React.Component {
    componentDidMount() {
        console.log(this.props);
        this.props.dispatch(fetchProtectedData());
    }

    render() {
        console.log(`In render`, this.props)
        if (this.props.protectedData.length < 1) {
            return <div>Loading...</div>
        }
        return (
            <div className="dashboard">
                <h2>{`Hello ${this.props.firstName}, welcome to the club!`}</h2>
                <div className="question">
                    <p>{`Question: ${this.props.protectedData[0].question}`}</p>
                </div>
                <div className="dashboard-name">Name: {this.props.username}</div>
                <div className="dashboard-protected-data">
                    {/* Protected data: {this.props.protectedData} */}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {currentUser} = state.auth;
    return {
        username: state.auth.currentUser.username,
        firstName: `${currentUser.firstName}`,
        protectedData: state.protectedData.data
    };
};

export default requiresLogin()(connect(mapStateToProps)(Dashboard));
