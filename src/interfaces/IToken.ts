/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import mongoose, { Document } from 'mongoose'
export interface IToken extends Document {
  userId: mongoose.Schema.Types.ObjectId
  artistId: mongoose.Schema.Types.ObjectId
  token: string
  createdAt: Date
}