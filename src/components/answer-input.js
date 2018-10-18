import React from 'react';
import Field from "redux-form/es/Field";
import {nonEmpty, required} from "../validators";
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import Input from "./input";
import { correctAnswer, incorrectAnswer } from "../actions/learning-two";
// import connect from "react-redux/es/connect/connect";
// import * as store from "react-redux";
// import {ThunkAction as getState} from "redux-thunk";

class AnswerInput extends React.Component {
    onSubmit(values) {
        const { answerInput } = values;
        console.log(answerInput);
        console.log(this.props);
        if (this.props.protectedData[0].answer === answerInput) {
            this.props.dispatch(correctAnswer);
        }
        else {
            this.props.dispatch(incorrectAnswer);
        }
        // console.log(store.getState());
    }
        //     if (this.props.status === 'question') {
        //         let answerCorrect = (this.answer.value.toLowerCase() === this.props.answer.toLowerCase());
        //         this.props.dispatch(answerResponse(answerCorrect));
        //         this.props.dispatch(sendAnswer(this.props.id, answerCorrect));
        //     }
        //     else {
        //         this.answer.value = '';
        //         this.props.dispatch(fetchQuestion(this.props.id));
        //

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
    // const {currentUser} = state.auth;
    return {
        // username: state.auth.currentUser.username,
        // firstName: `${currentUser.firstName}`,
        protectedData: state.protectedData.data
    };
};

// function mapStateToProps(state) {
//     return { protectedData: state.protectedData.data};
// };

export default connect(mapStateToProps)(reduxForm({form: 'answerInput'})(AnswerInput));
