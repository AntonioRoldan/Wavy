import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import routes from '../api'
import config from '../config'
import path from 'path'
import errorHandler from 'errorhandler'


export default ({app}: { app: any }) => {
  const passport = require('passport')
  const compression = require('compression')
  const cookieParser = require('cookie-parser')
  app.enable('trust proxy')

  app.use(bodyParser.json())
  app.use(cookieParser())

  app.use(errorHandler())
  app.use(compression()) //We use gzip to compress files sent through the network for better performance 
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(bodyParser.urlencoded({ extended: true })) 
  app.use(express.static(path.join(__dirname, '../client/build'))) //Server side rendering 
  app.use(function(req : Request, res  : Response, next : NextFunction) { // This will help with sending access tokens for authorization 
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use(config.api.prefix, routes()), (req: Request, res: Response) => res.sendStatus(401)

}

if (process.env.NODE_ENV !== 'production') {
  process.once('uncaughtException', function(err) {
    console.error('FATAL: Uncaught exception.')
    console.error(err.stack || err)
    setTimeout(function() {
      process.exit(1)
    }, 100)
  })
}