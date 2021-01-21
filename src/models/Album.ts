/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */



import mongoose, { Schema } from 'mongoose'
import { IAlbum } from '../interfaces/IAlbum'

const albumSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  authorId: { // We create an array to allow collaborations
    type: mongoose.Schema.Types.ObjectId
  },
  authorName: {
    type: String
  },
  coverUrl: { // Reference to album's image file stored in a gridFS collection
    type: String
  },
  genres: [{
    type: String,
    required: true,
    trim: true
  }],
  releaseDate: {
    type: Date,
    default: Date.now
  },
  isPremium: {
    type: Boolean,
    default: false
  }
})

export default mongoose.model < IAlbum > ('Album', albumSchema)
