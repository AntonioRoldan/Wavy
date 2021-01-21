/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
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

  albums: Array<{coverUrl: string,
    id: mongoose.Schema.Types.ObjectId,
    title: string,
    collaborators: {
      id: mongoose.Schema.Types.ObjectId,
      name: string
    }[]}>
  
  tracks: Array<{imageUrl: string, 
    audioUrl: string, 
    id: mongoose.Schema.Types.ObjectId,
    title: string
  }>

  purchases: {
    beats: mongoose.Schema.Types.ObjectId[],
    tutorials: mongoose.Schema.Types.ObjectId[]
  }

  shoppingCart: {id: mongoose.Schema.Types.ObjectId, type: string}[] // Security check, check that the id that is inserted here is a beat id that does not belong to the user 

  inspiredGenres: string[]

  favoriteGenres: string[]

  lastDayDate: Date

  lastWeekDate: Date

  lastMonthDate: Date

  dayBeforeLastDayListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : string[]
    numberoflistens: Number
    numberoftrackslistened: Number
    numberofrepeatedtracks: Number //Number of tracks that have been listened to more than once
    numberofrepeatedlistens: Number
  }>

  lastDayListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : string[]
    numberoflistens: Number
    numberoftrackslistened: Number
    numberofrepeatedtracks: Number //Number of tracks that have been listened to more than once
    numberofrepeatedlistens: Number
  }>

  weekBeforeLastWeekListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : string[]
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
    inspiredArtists : string[]
    numberoflistens: Number
    numberoftrackslistened: Number
    numberofrepeatedtracks: Number //Number of tracks that have been listened to more than once
    numberofrepeatedlistens: Number
  }>

  monthBeforeLastMonthListens: Array<{
    id: mongoose.Schema.Types.ObjectId
    username: String
    trackslistened: Array<{
      idoftracklistened: mongoose.Schema.Types.ObjectId
    }>
    repeatedtracks: Array<{
      idofrepeatedtrack: mongoose.Schema.Types.ObjectId
    }>
    inspiredArtists : string[]
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
    inspiredArtists : string[]
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
    inspiredArtists : string[]
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
    inspiredArtists : string[]
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
    inspiredArtists : string[]
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
