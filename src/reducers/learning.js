const initialState = {
    currentQuestion: null,
    currentAnswer: null,
    thisTimeCorrect: 0,
    thisTimeAtt: 0,
    currentCorrect: 0,
    currentAtt: 0,
    allTimeCorrect: 0,
    allTimeAtt: 0,
    currentStatus: 'question' // either going to be question, answerCorrect, or answerIncorrect
}

export default function reducer(state = initialState, action) {
    if (action.type === 'POST_STATS') {
        return Object.assign({}, state, {
            allTimeCorrect: action.stats.allTimeCorrect,
            allTimeAtt: action.stats.allTimeAtt,
            currentStatus: 'question'
        })
    }
    else if (action.type === 'POST_QUESTION') {
        return Object.assign({}, state, {
            thisTimeCorrect: action.question.thisTimeCorrect,
            thisTimeAtt: action.question.thisTimeAtt,
            currentQuestion: action.question.currentQuestion,
            currentAnswer: action.question.currentAnswer

        })
    }
    else if (action.type === 'ANSWER_RESPONSE') {
        let newStatus = '';
        let newCorrect = state.currentCorrect;
        let newHighCorrect = state.allTimeCorrect;
        let newQuestionCorrect = state.thisTimeCorrect;
        const newAtt = state.currentAtt + 1;
        const newHighAtt = state.allTimeAtt + 1;
        const newQuestionAtt = state.thisTimeAtt + 1;

        if (action.answerCorrect) {
            newStatus = 'answerCorrect';
            newCorrect++;
            newHighCorrect++;
            newQuestionCorrect++;
        }
        else {
            newStatus = 'answerIncorrect';
        }
        return Object.assign({}, state, {
            currentCorrect: newCorrect,
            currentAtt: newAtt,
            allTimeCorrect: newHighCorrect,
            allTimeAtt: newHighAtt,
            thisTimeCorrect: newQuestionCorrect,
            thisTimeAtt: newQuestionAtt,
            currentStatus: newStatus
        })
    }
    return state;
};
