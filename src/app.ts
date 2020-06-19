/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import 'reflect-metadata' //Allows decorators for typedi 
import express from 'express'
import config from './config/index'
import userModel from './models/User'
require('dotenv').config()


async function startServer() {
  const app = express()
  await require('./loaders').default({expressApp: app})
  app.listen(config.port, err => {
    if (err) {
      console.log(err)
      process.exit(1)
      return 
    }
    console.log(`
    ################################################
    🛡️  Server listening on port: ${config.port} 🛡️ 
    ################################################
    `)
  })
}

setInterval(() => {
  //Every hour we check if there are any unactivated accounts older than one day
  userModel.removeUnactivated()
    .then((output: any) => {
      console.log(output)
    })
    .catch((err: any) => {
      console.log(err.msg)
    })
}, 5 * 60 * 1000)

if (process.env.NODE_ENV !== 'production') {
  process.once('uncaughtException', function(err) {
    console.error('FATAL: Uncaught exception.')
    console.error(err.stack || err)
    setTimeout(function() {
      process.exit(1)
    }, 100)
  })
}


startServer()

