import React from 'react';
import { connect } from 'react-redux';

export class Result extends React.component {

    render() {
        const resSchema = {
            answerCorrect:
                <div className="correct-answer">Correct</div>,
            answerIncorrect:
                <div className="incorrect-answer">Incorrect</div>
        }
    let response = resSchema[this.props.status];

        return (
            <div id="result-display">
                { response }
            </div>
                )
    }
}

export const mapStateToProps = state => ({
    status: state.learning.currentStatus
});

export default connect(mapStateToProps(Result));
