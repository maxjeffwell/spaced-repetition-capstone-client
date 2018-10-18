import {API_BASE_URL} from '../config';

export const postStats = stats => ({
    type: 'POST_STATS',
    stats
})

export const postQuestion = question => ({
    type: 'POST_QUESTION',
    question
})

export const answerResponse = answersCorrect => ({
    type: 'ANSWER_RESPONSE',
    answersCorrect
})

// export const fetchStats = userId => dispatch => {
//     return fetch(`${API_BASE_URL}/users/userstats/${userId}`)
//         .then(res => {
//             return res.json();
//         })
//         .then(stats => {
//             return dispatch(postStats(stats))
//         })
// }

// export const fetchQuestion = userId => dispatch => {
//     return fetch(`${API_BASE_URL}/users/userquestion/${userId}`)
//         .then(res => {
//             return res.json();
//         })
//         .then(question => {
//             dispatch(postQuestion(question))
//         })
// }

export const sendAnswer = (userId, answersCorrect ) => dispatch => {
    return fetch(`${API_BASE_URL}/users/userquestion/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
            questionsCorrect: answersCorrect
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (!res.ok) {
                return Promise.reject(res.statusText)
            }
        })
}
