/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import mongoose, { Document } from 'mongoose'
export interface IAlbum extends Document {
  title: string
  authorId: mongoose.Schema.Types.ObjectId
  authorName: string
  coverUrl: string
  isPremium: Boolean
  genres: string[]
  releaseDate: Date
}
