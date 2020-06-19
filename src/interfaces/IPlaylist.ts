import mongoose, { Document } from 'mongoose'
export interface IPlaylist extends Document {

  name: string

  author: mongoose.Schema.Types.ObjectId

  tracks: mongoose.Schema.Types.ObjectId[]

  images: mongoose.Schema.Types.ObjectId[]

}
