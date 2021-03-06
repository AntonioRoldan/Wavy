/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
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
    default: 0.0 // A value between 0.0 and 1.0
  },
  price: {
    type: Number, // We will store whole numbers and divide them by 100 to get the decimals when displaying price
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
