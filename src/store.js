import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import authReducer from './reducers/auth';
import protectedDataReducer from './reducers/protected-data';
import answerSubmitReducer from './reducers/answer-submit';
import scoreReducer from './reducers/score';
import {fetchCurrentUser} from './actions/auth';
import thunk from "redux-thunk";

// Use Redux DevTools in development, regular compose in production
const composeEnhancers =
    (process.env.NODE_ENV === 'development' &&
     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(
    combineReducers({
        auth: authReducer,
        protectedData: protectedDataReducer,
        answerSubmit: answerSubmitReducer,
        score: scoreReducer
    }),
    composeEnhancers(applyMiddleware(thunk))
);

// Check for existing session via httpOnly cookie
// The server will validate the cookie and return user info if authenticated
store.dispatch(fetchCurrentUser());

export default store;
