import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import {reducer as formReducer} from 'redux-form';
import {loadAuthToken} from './local-storage';
import authReducer from './reducers/auth';
import protectedDataReducer from './reducers/protected-data';
import answerSubmitReducer from './reducers/answer-submit';
import scoreReducer from './reducers/score';
import {setAuthToken, refreshAuthToken} from './actions/auth';
import thunk from "redux-thunk";

// Use Redux DevTools in development, regular compose in production
const composeEnhancers =
    (process.env.NODE_ENV === 'development' &&
     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(
    combineReducers({
        form: formReducer,
        auth: authReducer,
        protectedData: protectedDataReducer,
        answerSubmit: answerSubmitReducer,
        score: scoreReducer
    }),
    composeEnhancers(applyMiddleware(thunk))
);

// Hydrate the authToken from localStorage if it exist
const authToken = loadAuthToken();
if (authToken) {
    console.log('there is an auth token');
    const token = authToken;
    store.dispatch(setAuthToken(token));
    store.dispatch(refreshAuthToken());
}

export default store;
