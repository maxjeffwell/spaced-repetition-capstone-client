import { CORRECT_ANSWER, INCORRECT_ANSWER} from "../actions/answer-submit";


const initialState = {
    currentStatus: 'question' // either going to be question, answerCorrect, or answerIncorrect
}


export default function reducer(state = initialState, action) {
    if (action.type === CORRECT_ANSWER) {
        return Object.assign({}, state, {
            currentStatus: 'answerCorrect'
        });
    }
    else if (action.type === INCORRECT_ANSWER) {
        return Object.assign({}, state, {
            currentStatus: 'answerIncorrect'
        });
    }
    return state;
};

