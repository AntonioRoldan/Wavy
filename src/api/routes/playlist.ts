/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
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
  app.use('/playlist', route)

  route.post('/create', (req: Request, res: Response) => {

  })

  route.post('/add_album', (req:Request, res:Response) => {

  })

  route.post('/add_song', (req: Request, res: Response) => {
    
  })

  route.post('/add')

}