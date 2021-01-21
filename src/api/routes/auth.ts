/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import { Container } from 'typedi'
import { Request, Response, Router } from 'express'
import AuthService from '../../services/authentication/auth'

export const route = Router()

const errorHandle = (res: Response, errorMessage: string, code: number): void => {
  errorMessage = errorMessage || 'Unknown error'
  code = code || 500

  res.status(code).send(errorMessage)
}

const responseHandle = (res: Response, data: any, code: number = 200): void => {
  res.status(code).send(data)
}

export default (app: Router) => {
  app.use('/auth', route)

  route.post('/signup', (req: Request, res: Response) => {
    const authServiceInstance = Container.get(AuthService)
    const host = 'localhost:3000'
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    }
    authServiceInstance
      .register(user, host)
      .then(message => responseHandle(res, message))
      .catch(err => {
        console.log('err :', err)
        errorHandle(res, err.msg, err.code)
      })
  })

  route.get('/refresh_token', (req: Request, res: Response) => {
    const refreshToken = req.cookies['refresh_token'] // We send and receive our refresh_token as http only to avoid
    const authServiceInstance = Container.get(AuthService) //
    authServiceInstance
      .refreshToken(refreshToken)
      .then(tokens => {
        res.cookie('refresh_token', tokens.refreshToken, {
          httpOnly: true,
          maxAge: 2592000000, // Thirty days in miliseconds
          secure: false,
        }) // TODO
        responseHandle(res, { jwt_token: tokens.token, refresh_token: tokens.refreshToken })
      })
      .catch(err => {
        errorHandle(res, err.msg, err.code)
      })
  })

  route.get('/verify', (req: Request, res: Response) => {
    const authServiceInstance = Container.get(AuthService)
    const token: string = req.query.id as string
    authServiceInstance
      .checkToken(token) //We check the if the verification token has expired
      .then(tokens => {
        res.cookie('refresh_token', tokens.refreshToken, {
          httpOnly: true,
          maxAge: 2592000000, // Thirty days in miliseconds
          secure: false,
        })
        responseHandle(res, tokens)
      })
      .catch(err => {
        errorHandle(res, err.msg, err.code)
      })
  })

  route.get('/hello', (req: Request, res: Response) => {
    responseHandle(res, 'hi')
  })

  route.post('/logout', (req: Request, res: Response) => {
    const refreshToken = req.cookies['refresh_token']
    const authServiceInstance = Container.get(AuthService)
    try {
      authServiceInstance.logout(refreshToken)
      responseHandle(res, 'Logged out successfully')
    } catch (error) {
      errorHandle(res, error.message, 500)
    }
  })

  route.post('/login', (req: Request, res: Response) => {
    const authServiceInstance = Container.get(AuthService)
    const userObj = {
      email: req.body.email,
      password: req.body.password,
    }
    authServiceInstance
      .login(userObj, false)
      .then(tokens => {
        if (tokens.refreshToken) {
          res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 2592000000, // Thirty days in miliseconds
          })
        }
        responseHandle(res, tokens)
      })
      .catch(err => {
        errorHandle(res, err.msg, err.code)
      })
  })
}
