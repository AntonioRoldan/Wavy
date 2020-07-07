/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import mongoose, { Document } from 'mongoose'
export interface IPlaylist extends Document {

  name: string

  author: { id: mongoose.Schema.Types.ObjectId, name: string }

  tracks: mongoose.Schema.Types.ObjectId[]

  images: string[]

}
