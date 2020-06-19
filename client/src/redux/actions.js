import { SET_LOGGEDIN, SET_SCROLL_DOWN, CLEAR } from './constants'

export function setLoggedIn (payload) {
  return { type: SET_LOGGEDIN, payload }
}

export function setScrollDown (payload) {
  return { type: SET_SCROLL_DOWN, payload }
}

export function clearStorage () {
  return { type: CLEAR }
}
