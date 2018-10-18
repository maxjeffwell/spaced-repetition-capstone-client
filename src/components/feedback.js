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
                    {`The correct answer is: ${this.props.protectedData[this.props.currQuestion].answer}`}
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
    return {
        currentStatus: state.learningTwo.currentStatus,
        protectedData: state.protectedData.data,
        currQuestion: state.score.currQuestion
    };
};

export default connect(mapStateToProps)(Feedback);
