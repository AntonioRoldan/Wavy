/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import mongoose, { Schema, Document, Model } from 'mongoose'
import { IUser, IUserModel } from '../interfaces/IUser'

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true,
  },
  purchases: {
    beats: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    tutorials: [{
      type: mongoose.Schema.Types.ObjectId
    }]
  },
  description: {
    type: String
  },
  twitterLink: {
    type: String
  },
  instagramLink: {
    type: String
  },
  facebookLink: {
    type: String
  },
  avatarURL: { //Reference to the avatar image stores in grid fs 
    type: String,
  },
  moneyGenerated: {
    type: Number, 
    default: 0
  },
  subscribers: [{
    subscribername: String, 
    subscriberid: mongoose.Schema.Types.ObjectId,
    duepaymentsum: Number 
  }],
  subscriptions: [{
    subscriptionname: String, //Name of user you are subscribed to
    subscriptionid: mongoose.Schema.Types.ObjectId,
    price: Number
  }],
  inspiredgenres: [{
    type: String
  }],
  favoritegenres: [{
    type: String
  }],
  follows: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  ],
  mutuals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  albums: [{
    coverUrl: String,
    id: mongoose.Schema.Types.ObjectId,
    title: String,
    collaborators: [{
      id: mongoose.Schema.Types.ObjectId,
      name: String
    }]
  }],
  tracks: [{
    imageUrl: String, 
    audioUrl: String,
    id: mongoose.Schema.Types.ObjectId,
    title: String
  }],
  playlists: [
    {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
  ],
  beats: [
    {
      id: mongoose.Schema.Types.ObjectId,
      name: String, 
      price: Number, 
      discount: Number,
      tracks: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Track'
        }
      ]
    }
  ],
  shoppingCart: [
    {
      id: mongoose.Schema.Types.ObjectId,
      type: String // Could be a beat or a tutorial 
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  refreshToken: {
    type: String,
    expires: 2592000 // Refresh token will last a month 
  },
  token: {
    type: String
  },
  jwtToken: {
    type: String
  },
  activated: {
    type: Boolean,
    default: false,
  },
  lastdaydate: { // Date from which we started counting the current day, it will get updated when a day has passed
    type: Date,
    default: Date.now,
    index: true
  },
  daybeforelastdaylistens: [{ // When a day passes we transfer the date from current day listens to last day listens
    id: mongoose.Schema.Types.ObjectId, // Artist id 
    username: String, 
    trackslistened: [{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }],
    repeatedtracks : [{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }],
    inspiredArtists : [{ //Artists that served as an inspiration to the artist we are listening 
      inspiredArtist: String
    }],
    numberoflistens: Number,
    numberoftrackslistened: Number,
    numberofrepeatedtracks: Number, //Number of tracks that have been listened to more than once 
    numberofrepeatedlistens: Number
  }],
  lastdaylistens: [{ // When a day passes we transfer the date from current day listens to last day listens
    id: mongoose.Schema.Types.ObjectId, // Artist id 
    username: String, 
    trackslistened: [{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }],
    repeatedtracks : [{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }],
    inspiredArtists : [{ //Artists that served as an inspiration to the artist we are listening 
      inspiredArtist: String
    }],
    numberoflistens: Number,
    numberoftrackslistened: Number,
    numberofrepeatedtracks: Number, //Number of tracks that have been listened to more than once 
    numberofrepeatedlistens: Number
  }],
  currentdaylistens: [{ //We will compare both current and last in order to detect changes in listening behaviour
    id: mongoose.Schema.Types.ObjectId,
    username: String, 
    trackslistened: [{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }],
    repeatedtracks : [{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }],
    inspiredArtists : [{ //Artists that served as an inspiration to the artist we are listening 
      inspiredArtist: String
    }],
    numberoflistens: Number,
    numberoftrackslistened: Number,
    numberofrepeatedtracks: Number, //Number of tracks that have been listened to more than once 
    numberofrepeatedlistens: Number
  }],
  //TODO: Add week, and month 
  lastweekdate : {
    type: Date,
    index: true,
    default: Date.now
  },
  weekbeforelastweeklistens: [{ // When a day passes we transfer the date from current day listens to last day listens
    id: mongoose.Schema.Types.ObjectId,
    username: String, 
    trackslistened: [{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }],
    repeatedtracks : [{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }],
    inspiredArtists : [{ //Artists that served as an inspiration to the artist for the specifig songs the user is listening  
      inspiredArtist: String
    }],
    numberoflistens: Number,
    numberoftrackslistened: Number,
    numberofrepeatedtracks: Number, //Number of tracks that have been listened to more than once 
    numberofrepeatedlistens: Number
  }],
  lastweeklistens: [{ // When a day passes we transfer the date from current day listens to last day listens
    id: mongoose.Schema.Types.ObjectId,
    username: String, 
    trackslistened: [{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }],
    repeatedtracks : [{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }],
    inspiredArtists : [{ //Artists that served as an inspiration to the artist for the specifig songs the user is listening  
      inspiredArtist: String
    }],
    numberoflistens: Number,
    numberoftrackslistened: Number,
    numberofrepeatedtracks: Number, //Number of tracks that have been listened to more than once 
    numberofrepeatedlistens: Number
  }],
  currentweeklistens: [{ //We will compare both current and last in order to detect changes in listening behaviour
    id: mongoose.Schema.Types.ObjectId,
    username: String, 
    trackslistened: [{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }],
    repeatedtracks : [{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }],
    inspiredArtists : [{ //Artists that served as an inspiration to the artist we are listening 
      inspiredArtist: String
    }],
    numberoflistens: Number,
    numberoftrackslistened: Number,
    numberofrepeatedtracks: Number, //Number of tracks that have been listened to more than once 
    numberofrepeatedlistens: Number
  }],
  lastmonthdate : {
    type: Date,
    index: true,
    default: Date.now
  },
  monthbeforelastmonthlistens: [{ // When a day passes we transfer the date from current day listens to last day listens
    id: mongoose.Schema.Types.ObjectId, //Artists' Id 
    username: String, 
    trackslistened: [{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }],
    repeatedtracks : [{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }],
    inspiredArtists : [{ //Artists that served as an inspiration to the artist we are listening 
      inspiredArtist: String
    }],
    numberoflistens: Number,
    numberoftrackslistened: Number,
    numberofrepeatedtracks: Number, //Number of tracks that have been listened to more than once 
    numberofrepeatedlistens: Number
  }],
  lastmonthlistens: [{ // When a day passes we transfer the date from current day listens to last day listens
    id: mongoose.Schema.Types.ObjectId, //Artists' Id 
    username: String, 
    trackslistened: [{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }],
    repeatedtracks : [{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }],
    inspiredArtists : [{ //Artists that served as an inspiration to the artist we are listening 
      inspiredArtist: String
    }],
    numberoflistens: Number,
    numberoftrackslistened: Number,
    numberofrepeatedtracks: Number, //Number of tracks that have been listened to more than once 
    numberofrepeatedlistens: Number
  }],
  currentmonthlistens: [{ //We will compare both current and last in order to detect changes in listening behaviour
    id: mongoose.Schema.Types.ObjectId,
    username: String, 
    trackslistened: [{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }],
    repeatedtracks : [{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }],
    numberoflistens: Number,
    numberoftrackslistened: Number,
    numberofrepeatedtracks: Number, //Number of tracks that have been listened to more than once 
    numberofrepeatedlistens: Number
  }]
})

require('./Statics/UserStatics')(userSchema)

export default mongoose.model < IUser , IUserModel > ('User', userSchema)
