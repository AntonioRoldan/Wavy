/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import { Router } from 'express'
import auth from './routes/auth'
import explore from './routes/explore'
import profile from './routes/profile'
import albums from './routes/album'
import tracks from './routes/track'
import beats from './routes/beat'
import playlist from './routes/playlist'
import payment from './routes/payment'
export default () => {
  const app = Router()
  auth(app)
  explore(app)
  profile(app)
  albums(app)
  tracks(app)
  beats(app)
  playlist(app)
  payment(app)
  return app
}
