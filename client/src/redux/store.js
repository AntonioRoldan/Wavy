import { createStore, applyMiddleware, compose } from 'redux'
import { rootReducer } from './reducer'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import thunk from 'redux-thunk'
import logger from 'redux-logger'

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE || compose

const middleWare = [thunk, logger]
const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = createStore(persistedReducer, storeEnhancers(applyMiddleware(...middleWare)))
const persistor = persistStore(store)
export { store, persistor }
