/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import config from '../config'
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt
var passport = require('passport')
var options : { [key: string]: any } = {}

passport.serializeUser((user: any, done: Function) => {
  done(null, user.id)
})

/* We leave it uncommented in case we have to implement new strategies 
passport.deserializeUser(function (username, done) {
  done(null, username)
  })
  */

options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
options.secretKey = config.jwtsecret

passport.use(
  new JwtStrategy(options, (jwtPayload: any, done: any) => {
    //If the token has expiration, raise unauthorized
    var expirationDate = new Date(jwtPayload.exp * 1000)
    if (expirationDate < new Date()) {
      return done(null, false)
    }
    var user = jwtPayload
    done(null, user)
  })
)
