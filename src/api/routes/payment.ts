/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/
// This route will manage the subscription, tutorials and beat payments 

import { Container } from 'typedi'
import { Request, Response, Router } from 'express'
import PaymentService from '../../services/payment'
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
  app.use('/payments', route)

  route.post('/apply_discount', (req: Request, res: Response) => {
    // This is an option for users to apply discounts to their products 
  })

  route.get('/show_shopping_cart', async (req: Request, res: Response) => {
    /*
      Response 
    [{
      id: item.id,
      title: itemDoc.title, 
      price: userIsSubscribedToAuthor ? Number(itemDoc.subscriptionDiscount) * Number(itemDoc.price) : itemDoc.setDiscount ? Number(itemDoc.discount) * Number(itemDoc.price) : Number(itemDoc.price), 
    }]
    */
    try {
      const authServiceInstance = Container.get(AuthService)
      const paymentServiceInstance = Container.get(PaymentService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await paymentServiceInstance.showShoppingCart(userId)
      responseHandle(res, responseData)
    } catch (err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.post('/add_to_shopping_cart/:itemId', async (req: Request, res: Response) => {
    /* 
    Response 
    [{
      id: item.id,
      title: itemDoc.title, 
      price: userIsSubscribedToAuthor ? Number(itemDoc.subscriptionDiscount) * Number(itemDoc.price) : itemDoc.setDiscount ? Number(itemDoc.discount) * Number(itemDoc.price) : Number(itemDoc.price), 
    }]
    */
    try {
      const authServiceInstance = Container.get(AuthService)
      const paymentServiceInstance = Container.get(PaymentService)
      const itemId = req.params.itemId
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await paymentServiceInstance.addToShoppingCart(userId, itemId)
      responseHandle(res, responseData)
    } catch (err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.delete('/clear_shopping_cart', async (req: Request, res: Response) => {
    /* 
    Response: []
    */
    try {
      const authServiceInstance = Container.get(AuthService)
      const paymentServiceInstance = Container.get(PaymentService)
      const itemId = req.params.itemId
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await paymentServiceInstance.clearShoppingCart(userId)
      responseHandle(res, responseData)
    } catch (err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.delete('/remove_from_cart/:itemId', async (req: Request, res: Response) =>{
    /* 
    Response 
    [{
      id: item.id,
      title: itemDoc.title, 
      price: userIsSubscribedToAuthor ? Number(itemDoc.subscriptionDiscount) * Number(itemDoc.price) : itemDoc.setDiscount ? Number(itemDoc.discount) * Number(itemDoc.price) : Number(itemDoc.price), 
    }]
    */
    try {
      const authServiceInstance = Container.get(AuthService)
      const paymentServiceInstance = Container.get(PaymentService)
      const itemId = req.params.itemId
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await paymentServiceInstance.removeFromShoppingCart(userId, itemId)
      responseHandle(res, responseData)
    } catch (err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.post('/buy_shopping_cart_items', (req: Request, res: Response) => {
    // TODO: Write this with stipe 
  })

}