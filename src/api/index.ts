/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import { Router } from 'express'
import auth from './routes/auth'
import explore from './routes/explore'
import userConfig from './routes/user-config'
export default () => {
  const app = Router()
  auth(app)
  explore(app)
  userConfig(app)
  return app
}