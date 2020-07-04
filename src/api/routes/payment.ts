/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/
// This route will manage the subscription, tutorials and beat payments 

import { Container } from 'typedi'
import { Request, Response, Router } from 'express'
import PaymentService from '../../services/payment'

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
  app.use('/payments', route)

  route.post('/apply_discount', (req: Request, res: Response) => {

  })

  route.get('/show_shopping_cart', (req: Request, res: Response) => {

  })

  route.post('/add_to_shopping_cart', (req: Request, res: Response) => {

  })

  route.get('/clear_shopping_cart', (req: Request, res: Response) => {
    
  })

  route.post('/buy_shopping_cart_items', (req: Request, res: Response) => {

  })

}