import { INCREMENT_ATT_COUNT, INCREMENT_CORRECT_COUNT, NEXT_QUESTION} from "../actions/scores";

const initialState = {
  currQuestion: 0, //index of current question being displayed
  currSessionCorrect: 0, //# correct for current session
  currSessionAttempted: 0, //# attempted for current session
  allTimeCorrect: 0, //# correct since account creation
  allTimeAttempted: 0 //# attempted since account creation
};

//when answer submitted, dispatch IncrementCount action, which will increment allTimeAttempted and currSessionAttempted by 1;

export default function reducer(state = initialState, action) {
  if (action.type === INCREMENT_ATT_COUNT) {
      return Object.assign({}, state, {
        currSessionAttempted: state.currSessionAttempted + 1,
        allTimeAttempted: state.allTimeAttempted + 1
      })
    }
    else if (action.type === INCREMENT_CORRECT_COUNT) {
      return Object.assign({}, state, {
        currSessionCorrect: state.currSessionCorrect + 1,
        allTimeCorrect: state.allTimeCorrect + 1
      })
    }
    else if (action.type === NEXT_QUESTION) {
      return Object.assign({}, state, {
        currQuestion: state.currQuestion + 1
      })
    }
    return state;
  };