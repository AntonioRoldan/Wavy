/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
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
  author: { // We create an array to allow collaborations
    name: mongoose.Schema.Types.ObjectId
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
