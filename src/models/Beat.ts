/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import mongoose, { Schema } from 'mongoose'
import { IBeat } from '../interfaces/IBeat'

const beatSchema = new Schema({
  authorId: { // We create an array to allow collaborations
    type: mongoose.Schema.Types.ObjectId
  },
  authorName: {
    type: String
  },
  coverUrl: { // Reference to the image stored in grid fs
    type: String
  },
  genres: [{
    type: String,
    required: true,
    trim: true
  }],
  title: {
    type: String,
    required: true,
    trim: true
  },
  subscriptionDiscount: {
    type: Number,
    default: 0.0
  },
  setDiscount: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0.0
  },
  price: {
    type: Number,
    default: 0
  },
  inspiredArtists: [{
    type: String,
    required: true
  }],
  numberOfPurchases: {
    type: Number,
    default: 0
  }
})

export default mongoose.model < IBeat > ('Beat', beatSchema)
