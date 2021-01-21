/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
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
