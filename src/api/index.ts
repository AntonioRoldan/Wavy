/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import { Router } from 'express'
import auth from './routes/auth'
import explore from './routes/explore'
import profile from './routes/profile'
export default () => {
  const app = Router()
  auth(app)
  explore(app)
  profile(app)
  return app
}