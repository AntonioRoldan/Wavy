/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */



import mongoose, { Schema } from 'mongoose'
import { ISession } from '../interfaces/ISession'

const sessionSchema = new Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  APIkey: {
    type: String,
    required: true,
    minlength: 10
  },
  expire_at: {
    type: Date,
    default: Date.now,
    expires: 86400
  }
})

export default mongoose.model < ISession > ('Session', sessionSchema)
