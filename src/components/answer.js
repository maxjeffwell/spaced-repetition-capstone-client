import React from 'react';
import { connect } from 'react-redux';
import { answerResponse, fetchQuestion, sendAnswer } from '../actions/learning';

// Do we need a quit button?
// import { SET_AUTH_TOKEN, SET_CURRENT_USER} from "../actions/auth";
// import { clearAuthToken } from "../local-storage";

export class Answer extends React.component {
    handleFormSubmit(event) {
        event.preventDefault();

        if (this.props.status === 'question') {
            let answerCorrect = (this.answer.value.toLowerCase() === this.props.answer.toLowerCase());
            this.props.dispatch(answerResponse(answerCorrect));
            this.props.dispatch(sendAnswer(this.props.id, answerCorrect));
        }
    else {
        this.answer.value = '';
        this.props.dispatch(fetchQuestion(this.props.id));
        }
    }

    render() {
        let buttonText;
        let inputDisabled = false;

        if (this.props.status === 'question') {
            buttonText = 'Submit';
        }
        else {
            buttonText = 'Next';
            inputDisabled = true;
        }

        return (
            <div id="answer-container">
                <form id="answer-form" onSubmit={e => this.handleFormSubmit(e)} ref={form => this.form = form}>
                    <input type="text" placeholder="answer" disabled={inputDisabled} ref={input => this.answer = input} />
                    <button type="submit">{buttonText}</button>
                </form>
            </div>
        )
    }
}

export const mapStateToProps = state => ({
    status: state.learning.currentStatus,
    id: state.auth.currentUser.id,
    answer: state.learning.currentAnswer
});

export default connect(mapStateToProps(Answer));

