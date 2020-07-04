/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import { Service, Inject } from 'typedi'
import S3Service from './s3'
import mongoose from 'mongoose'
import TrackService from './track'
import { ObjectId } from 'bson'

@Service()
export default class PlaylistService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    private s3Service: S3Service,

    private trackService: TrackService,
    @Inject('trackModel') private trackModel: Models.TrackModel,
    @Inject('albumModel') private albumModel: Models.AlbumModel
  ) {}

  public createPlaylist(userId: string): Promise<any>{
    return new Promise((resolve, reject) => {

    })
  }

  public addSongToPlaylist(userId: string, songId: string, playlistId: string): Promise<any>{
    return new Promise((resolve, reject) => {
      
    })
  }

  public addAlbumToPlaylist(userId: string, playlistId:string, albumId: string): Promise<any>{
    return new Promise((resolve, reject) => {
      
    })
  }

  public editPlaylistName(name: string, playlistId: string): Promise<any>{
    return new Promise((resolve, reject) => {
      
    })
  }

  public searchPlaylist(search: string): Promise<any>{
    return new Promise((resolve, reject) => {
      
    })
  }

  // DELETE METHODS 

  public deleteSongFromPlaylist(userId: string, songId: string, playlistId: string): Promise<any>{
    return new Promise((resolve, reject) => {
      
    })
  }

  public deletePlaylist(userId: string, playlistId: string) {

  }
}
