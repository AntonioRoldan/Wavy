/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import mongoose, { Document } from 'mongoose'
export interface IBeat extends Document {
  authorId: mongoose.Schema.Types.ObjectId
  authorName: string

  coverUrl: string

  inspiredArtists: string[]

  setDiscount: Boolean
  subscriptionDiscount: Number
  discount: Number

  genres: string[]

  price: Number

  numberOfPurchases: Number 

  title: string
}
