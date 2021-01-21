/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
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
