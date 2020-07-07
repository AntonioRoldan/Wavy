/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import { Service, Inject } from 'typedi'
import BeatService from './beat';
import mongoose from 'mongoose'
import { ObjectId } from 'bson';

@Service()
export default class PaymentService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    
    @Inject('beatModel') private beatModel: Models.BeatModel,

    // TODO: Add tutorial model here 

    private beatService: BeatService

    //TODO: Add tutorial service here 
  ) {}
    public addToShoppingCart(userId: ObjectId, itemId: string): Promise<any> {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await this.userModel.findById(userId)
          const beat = await this.beatModel.findById(itemId)
          if(!beat) {
            //TODO: We should check if it is a tutorial here for now we will just reject 
            reject({code: 400, msg: 'Item does not exist'})
          }
          user.shoppingCart.push({id: beat._id, type: 'beat'})
          await user.save()
          resolve('Item successfully added to shopping list')
        } catch (err) {

        }
      })
    }

    public showShoppingCart(userId: string): Promise<any> {
      return new Promise(async (resolve, reject) => {
        try {
          let shoppingCartData = []
          let userIsSubscribedToAuthor = false 
          const user = await this.userModel.findById(userId)
          shoppingCartData = user.shoppingCart.map(async (item) => {
            const itemDoc = /* item.type === 'beat' ? we search for tutorial too */ await this.beatModel.findById(item.id)
            const author = await this.userModel.findById(itemDoc.authorId)
            userIsSubscribedToAuthor = user.subscriptions.includes(author._id) ? true : false
            return {
              id: item.id,
              title: itemDoc.title, 
              price: userIsSubscribedToAuthor ? Number(itemDoc.subscriptionDiscount) * Number(itemDoc.price) : itemDoc.setDiscount ? Number(itemDoc.discount) * Number(itemDoc.price) : Number(itemDoc.price), 
            }
          })
          resolve(shoppingCartData)
        } catch (err) {
          reject({code: 500, msg: err.message || err.msg})
        }
      })
    }

    public buyShoppingCartItems(userId: string): Promise<any> {
      return new Promise(async (resolve, reject) => {
        try {
          //TODO: Use stripe here 

        } catch (err) {

        }
      })
    }

    public removeFromShoppingCart(userId: string, itemId: string): Promise<any> {
      return new Promise( async (resolve, reject) => {
        try {
          const user = await this.userModel.findById(userId)
          user.shoppingCart.filter(item => String(item.id) !== itemId)
          await user.save()
          const shoppingCartData = await this.showShoppingCart(userId)
          resolve(shoppingCartData)
        } catch (err) {
          reject({code: err.code || 500, msg: err.message || err.msg})
        }
      })
    }

    public clearShoppingCart(userId: string): Promise<any> {
      return new Promise( async (resolve, reject) => {
        try {
         const user = await this.userModel.findById(userId)
         user.shoppingCart = []
         await user.save()
         resolve([])
        } catch (err) {
          reject({code: err.code | 500, msg: err.message || err.msg})
        }
      })
    }

  }