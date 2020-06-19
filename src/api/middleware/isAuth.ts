import { Request, Response, NextFunction } from 'express'
const jwt = require('jsonwebtoken')
import config from '../../config'

module.exports = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-access-token']
  if(!token) return res.status(403).send('No token provided')
  jwt.verify(token, config.jwtsecret, (err: any, payload: any) => {
    if(err) {
      return res.status(401).send('Unauthorized access')
    }
    next()
  })
}