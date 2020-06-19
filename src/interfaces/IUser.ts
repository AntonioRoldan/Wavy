/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import mongoose, { Schema, Model, Document } from 'mongoose'
export interface IUser extends Document {
  username: string

  email: string

  password: string
  
  follows?: mongoose.Schema.Types.ObjectId[]

  followers?: mongoose.Schema.Types.ObjectId[]

  mutuals?: mongoose.Schema.Types.ObjectId[]

  description: string

  twitterLink: string

  instagramLink: string

  facebookLink: string 

  playlists: Array<{ id: mongoose.Schema.Types.ObjectId; name: String }>

  refreshToken: string

  createdAt?: Date

  token?: string

  jwtToken: string

  activated?: boolean

  avatarURL?: string

  moneyGenerated: Number

  subscribers: Array<{
    subscribername: string
    subscriberid: mongoose.Schema.Types.ObjectId
    duepaymentsum: Number
  }>

  subscriptions: Array<{
    subscriptionname: string
    subscriptionid: mongoose.Schema.Types.ObjectId
    duepaymentsum: Number
  }>

  albums: Array<{undercover: mongoose.Schema.Types.ObjectId,
    id: mongoose.Schema.Types.ObjectId,
    title: string,
    collaborators: [{
      id: mongoose.Schema.Types.ObjectId,
      name: string
    }]}>
  
  tracks: mongoose.Schema.Types.ObjectId[]

  inspiredGenres: string[]

  favoriteGenres: string[]

  lastDayDate: Date

  lastWeekDate: Date

  lastMonthDate: Date

  lastDayListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : { inspiredArtist: string}[]
    numberoflistens: Number
    numberoftrackslistened: Number
    numberofrepeatedtracks: Number //Number of tracks that have been listened to more than once
    numberofrepeatedlistens: Number
  }>

  lastWeekListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : { inspiredArtist: string}[]
    numberoflistens: Number
    numberoftrackslistened: Number
    numberofrepeatedtracks: Number //Number of tracks that have been listened to more than once
    numberofrepeatedlistens: Number
  }>

  lastMonthListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : { inspiredArtist: string}[]
    numberoflistens: Number
    numberoftrackslistened: Number
    numberofrepeatedtracks: Number //Number of tracks that have been listened to more than once
    numberofrepeatedlistens: Number
  }>

  currentDayListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : { inspiredArtist: string}[]
    numberoflistens: Number
    numberoftrackslistened: Number
    numberofrepeatedtracks: Number //Number of tracks that have been listened to more than once
    numberofrepeatedlistens: Number
  }>

  currentWeekListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : { inspiredArtist: string}[]
    numberoflistens: Number
    numberoftrackslistened: Number
    numberofrepeatedtracks: Number //Number of tracks that have been listened to more than once
    numberofrepeatedlistens: Number
  }>

  currentMonthListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : { inspiredArtist: string}[]
    numberoflistens: Number
    numberoftrackslistened: Number
    numberofrepeatedtracks: Number //Number of tracks that have been listened to more than once
    numberofrepeatedlistens: Number
  }>
}

export interface IUserModel extends Model<IUser> {
  removeUnactivated(): Promise<any>

  activateAccount(id: Schema.Types.ObjectId): Promise<IUser>
}
