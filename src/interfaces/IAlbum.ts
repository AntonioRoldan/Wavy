import mongoose, { Document } from 'mongoose'
export interface IAlbum extends Document {
  title: string
  author: mongoose.Schema.Types.ObjectId
  undercoverUrl: String
  isPremium: Boolean
  genres: string[]
  releaseDate: Date
}
