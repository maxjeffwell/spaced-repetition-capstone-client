import React from 'react';
import { connect } from 'react-redux';

export class Feedback extends React.Component {
    render() {
        if (this.props.currentStatus === "answerCorrect") {
            return (
                <div className="answerCorrect">
                    <p>
                        {`You are correct!`}
                    </p>
                </div>
            )
        }
        else if (this.props.currentStatus === "answerIncorrect") {
            return (
                <div className="answer-label">
                <p>
                    {`The correct answer is: ${this.props.answer}`}
                </p>
                </div>
            )
        }
        else {
            return (
                <div className="answer-label">
                <p>
                    {`Answer the question`}
                </p>
                </div>
            )
        }
    }
}

const mapStateToProps = state => {
    const {currentUser} = state.auth;

    // Safety check for user data
    if (!currentUser || !currentUser.questions || currentUser.head === undefined) {
        return {
            currentStatus: state.answerSubmit.currentStatus,
            protectedData: state.protectedData.data,
            currQuestion: state.score.currQuestion,
            answer: ''
        };
    }

    return {
        currentStatus: state.answerSubmit.currentStatus,
        protectedData: state.protectedData.data,
        currQuestion: state.score.currQuestion,
        answer: `${currentUser.questions[currentUser.head].answer}`
    };
};

export default connect(mapStateToProps)(Feedback);
