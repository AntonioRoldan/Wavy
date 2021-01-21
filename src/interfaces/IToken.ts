/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */



import mongoose, { Document } from 'mongoose'
export interface IToken extends Document {
  userId: mongoose.Schema.Types.ObjectId
  artistId: mongoose.Schema.Types.ObjectId
  token: string
  createdAt: Date
}