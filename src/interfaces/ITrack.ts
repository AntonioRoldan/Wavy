/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import mongoose, { Document } from 'mongoose'
export interface ITrack extends Document {
  authorId: mongoose.Schema.Types.ObjectId
  authorName: string

  trackUrl: string

  imageUrl: string

  inspiredArtists: string[]

  genres: string[]

  isSingleTrack: boolean

  isPremium: Boolean

  price: Number

  type: String 

  numberOfListens: Number 

  album: mongoose.Schema.Types.ObjectId

  beat: mongoose.Schema.Types.ObjectId

  title: string
}
