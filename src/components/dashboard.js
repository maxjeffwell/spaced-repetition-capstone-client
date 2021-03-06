import React from 'react';
import {connect} from 'react-redux';
import requiresLogin from './requires-login';
import {fetchProtectedData} from '../actions/protected-data';
import AnswerInput from './answer-input';
import Feedback from './feedback';
import Score from './score';
import { nextQuestion } from "../actions/scores";

export class Dashboard extends React.Component {
    componentDidMount() {
        console.log(this.props);
        this.props.dispatch(fetchProtectedData());
    }

    render() {
        console.log(`In render`, this.props)
        if (!this.props.protectedData) {
            return <div>Loading...</div>
        }
        return (
            <div className="dashboard">
                <h2>{`Hello ${this.props.firstName}, welcome to the club!`}</h2>
                <div className="question">
                    <p>{`Question: ${this.props.question/* [this.props.currQuestion]*/}`}</p>
                </div>
                <div><AnswerInput />
                </div>
                <div><Feedback />
                </div>
                <div><Score />
                </div>
                <button type="button" className="nextButton" onClick={() => this.props.dispatch(nextQuestion)} /*disabled={this.props.pristine || this.props.submitting}*/>Next</button>
                {/* <div className="dashboard-name">Name: {this.props.username}</div>
                <div className="dashboard-protected-data">
                    { Protected data: {this.props.protectedData} }
                </div> */}
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {currentUser} = state.auth;
    return {
        username: state.auth.currentUser.username,
        firstName: `${currentUser.firstName}`,
        protectedData: state.protectedData.data,
        currQuestion: state.score.currQuestion,
        question: `${currentUser.questions[currentUser.head].question}`
    };
};

export default requiresLogin()(connect(mapStateToProps)(Dashboard));
