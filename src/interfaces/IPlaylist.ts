/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import mongoose, { Document } from 'mongoose'
export interface IPlaylist extends Document {

  name: string

  author: { id: mongoose.Schema.Types.ObjectId, name: string }

  tracks: mongoose.Schema.Types.ObjectId[]

  images: string[]

}
