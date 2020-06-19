import mongoose, { Schema } from 'mongoose'
import { ITrack } from '../interfaces/ITrack'

const trackSchema = new Schema({
  authorId: { // We create an array to allow collaborations
    type: mongoose.Schema.Types.ObjectId
  },
  authorName: {
    type: String
  },
  imageUrl: { // Reference to the image stored in grid fs
    type: String
  },
  genres: [{
    type: String,
    required: true,
    trim: true
  }],
  isSingleTrack: {
    type: Boolean,
    default: true
  },
  trackUrl: {
    type: String
  },
  album: {
    type: mongoose.Schema.Types.ObjectId
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  inspiredArtists: [{
    type: String,
    required: true
  }],
  type: { // It could be a loop, a drumkit or a normal song 
    type: String,
    default: 'normal'
  },
  numberoflistens: {
    type: Number,
    default: 0
  }
})

export default mongoose.model < ITrack > ('Track', trackSchema)
