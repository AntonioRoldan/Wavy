// This route is responsible for content recommendations
/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import express, { Request, Response, Router } from 'express'
const isAuth = require('../middleware/isAuth')
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
  route.use(isAuth) // Because this is a secure route, we add the isAuth middleware 
  app.use('/explore', route)

  route.get('/secure', (req: Request, res: Response) => {
    res.send('I am secured...')
  })

}