/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import mongoose, { Schema } from 'mongoose'
import { IPlaylist } from '../interfaces/IPlaylist'

const playlistSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    trim: true
  },
  images: [{ // Reference to the image file stored in a grid fs collection we store a maximum of 4 to recreate spotify
    type: String
  }],
  author: {
    name: String,
    id: mongoose.Schema.Types.ObjectId
  },
  tracks: [ // When we retrieve it we have to access the tracks database to know whether it is premium or not
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ]
})

export default mongoose.model < IPlaylist > ('Playlist', playlistSchema)
