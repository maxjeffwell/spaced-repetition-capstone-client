import React from 'react';
import { connect } from 'react-redux';

export class Feedback extends React.component {
    render() {
        let feedback = '';
        if (this.props.status === "incorrect") {
            feedback = (
                <div>
                    <div className="answer-label">The correct answer is:</div>
                    <div className="answer-text">{this.props.answer}</div>
                </div>
            )
        }
    else {
        feedback = <div></div>
        }

        const percentage = this.props.thisTimeAtt > 0 ? this.props.thisTimeCorrect / this.props.thisTimeAtt : 0;

    return (
        <div id="feedback-container">
            <div id="feedback-box">
                {feedback}
            </div>
            <div id="q-his-box">
                <div className="fb-label">Past Questions:</div>
                <div className="fb-text fb pct"{`${percentage.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1})}`}
                <div className="fb-text">{`Past Attempts: ${this.props.thisTimeAtt}`}</div>
                <div className="fb-text">{`Correct: ${this.props.thisTimeCorrect}`}</div>
            </div>
        </div>
    )
    }
}

export const mapStateToProps = state => ({
    answer: state.learning.currentAnswer,
    status: state.learning.currentStatus,
    thisTimeAtt: state.learning.thisTimeAtt,
    thisTimeCorrect: state.learning.thisTimeCorrect
});

export default connect(mapStateToProps(Feedback));
