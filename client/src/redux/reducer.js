import { SET_LOGGEDIN, SET_SCROLL_DOWN, CLEAR } from './constants'

const rootState = {
  scrollDown: false,
  loggedIn: false
}

export function rootReducer (state = rootState, action) {
  switch (action.type) {
    case SET_LOGGEDIN:
      return { ...state,
        loggedIn: action.payload
      }
    case SET_SCROLL_DOWN:
      return { ...state,
        scrollDown: action.payload
      }
    case CLEAR:
      state = undefined
      break
    default:
      return state
  }
}

export default rootReducer
