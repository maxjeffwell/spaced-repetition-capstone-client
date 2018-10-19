import {API_BASE_URL} from '../config';
import {normalizeResponseErrors} from './utils';

export const FETCH_PROTECTED_DATA_SUCCESS = 'FETCH_PROTECTED_DATA_SUCCESS';
export const fetchProtectedDataSuccess = data => ({
    type: FETCH_PROTECTED_DATA_SUCCESS,
    data
});

export const FETCH_PROTECTED_DATA_ERROR = 'FETCH_PROTECTED_DATA_ERROR';
export const fetchProtectedDataError = error => ({
    type: FETCH_PROTECTED_DATA_ERROR,
    error
});

export const fetchProtectedData = () => (dispatch, getState) => {

    const authToken = getState().auth.authToken;
    const userId = getState().auth.currentUser._id;
    console.log(userId);
    return fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
            // Provide our auth token as credentials

            Authorization: `Bearer ${authToken}`
        }
    })
        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        // .then(console.log(res))
        .then((res) => dispatch(fetchProtectedDataSuccess(res)))
        .catch(err => {
            dispatch(fetchProtectedDataError(err));
        });
};

// export const updateOnCorrAns = () => (dispatch, getState) => {
//     const authToken = getState().auth.authToken;
//     const userId = getState().auth.currentUser._id;

//
//     return fetch(`${API_BASE_URL}/users/${userId}`, {
//         method: 'PATCH',
//         headers: {
//             // Provide our auth token as credentials
//             Authorization: `Bearer ${authToken}`,
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             head:
//             memoryStrength: (memoryStrength *= 2),
//             next
//         })
//
//     })
//         .then(res => normalizeResponseErrors(res))
//         .then(res => res.json())
//         // .then(console.log(res))
//         .then((res) => dispatch(fetchProtectedDataSuccess(res)))
//         .catch(err => {
//             dispatch(fetchProtectedDataError(err));
//         });
// };
// }
