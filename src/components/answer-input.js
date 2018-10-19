import React from 'react';
import Field from "redux-form/es/Field";
import {nonEmpty, required} from "../validators";
import { connect } from 'react-redux';
import { reduxForm, reset } from 'redux-form';
import Input from "./input";
import { correctAnswer, incorrectAnswer } from "../actions/answer-submit";
import { incrementAttCount, incrementCorrectCount } from "../actions/scores";

class AnswerInput extends React.Component {
    onSubmit(values) {
        const { answerInput } = values;
        this.props.dispatch(reset('answerInput'));
        console.log(answerInput);
        console.log(this.props);
        if (this.props.answer === answerInput) {
            this.props.dispatch(correctAnswer);
            this.props.dispatch(incrementAttCount);
            this.props.dispatch(incrementCorrectCount);
        }
        else {
            this.props.dispatch(incorrectAnswer);
            this.props.dispatch(incrementAttCount);
        }

    }

    render() {

            // let buttonText;
            // let inputDisabled = false;

            // if (this.props.status === 'question') {
            //     buttonText = 'Submit';
            // }
            // else {
            //     buttonText = 'Next';
                // inputDisabled = true;
            // }

        return (
            <form onSubmit={this.props.handleSubmit(values => this.onSubmit(values))}>
                <label htmlFor="answerInput">Answer: </label>
                <Field
                    name="answerInput"
                    type="text"
                    component={Input}
                    id="answerInput"
                    validate={[required, nonEmpty]}
                />
                <button type="submit" disabled={this.props.pristine || this.props.submitting}>
                Submit
                </button>
            </form>
        )
    }
}

const mapStateToProps = state => {
    const {currentUser} = state.auth;
    return {
        protectedData: state.protectedData.data,
        currQuestion: state.score.currQuestion,
        answer: `${currentUser.questions[currentUser.head].answer}`
    };
};

export default connect(mapStateToProps)(reduxForm({form: 'answerInput'})(AnswerInput));
