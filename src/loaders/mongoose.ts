/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import mongoose from 'mongoose'
import config from '../config'
mongoose.set('useNewUrlParser', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useFindAndModify', false)
// mongoose.set('use')
export default () => {
  const connection = mongoose.connect(config.databaseURL)
  return connection
}