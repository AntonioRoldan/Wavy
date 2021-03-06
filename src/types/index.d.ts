/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import { Document, Model } from 'mongoose'
import { IUser, IUserModel } from '../interfaces/IUser'
import { ITrack } from '../interfaces/ITrack'
import { IAlbum } from '../interfaces/IAlbum'
import { IPlaylist } from '../interfaces/IPlaylist'
import { ISession } from '../interfaces/ISession'
import { IToken } from '../interfaces/IToken'
import { IBeat } from '../interfaces/IBeat'

declare global {
  namespace Models {
    export type UserModel  = IUserModel //TODO: IUser extends document so it should work check in either case

    export type TrackModel = Model < ITrack & Document >

    export type AlbumModel = Model < IAlbum & Document >

    export type PlaylistsModel = Model < IPlaylist & Document >

    export type SessionModel = Model < ISession & Document >

    export type TokenModel = Model < IToken & Document >

    export type BeatModel = Model < IBeat & Document > 

  }
}