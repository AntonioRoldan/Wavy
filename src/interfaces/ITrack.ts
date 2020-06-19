import mongoose, { Document } from 'mongoose'
export interface ITrack extends Document {
  authorId: mongoose.Schema.Types.ObjectId
  authorName: string

  audiofile: mongoose.Schema.Types.ObjectId

  inspiredArtists: string[]

  genres: string[]

  isSingleTrack: boolean

  isPremium: Boolean

  price: Number

  type: String 

  numberOfListens: Number 

  image: mongoose.Schema.Types.ObjectId[]

  albums: mongoose.Schema.Types.ObjectId[]

  title: string
}
