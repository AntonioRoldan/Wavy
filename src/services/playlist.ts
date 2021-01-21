/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import { Service, Inject } from 'typedi'
import S3Service from './s3'
import mongoose from 'mongoose'
import TrackService from './track'
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';


@Service()
export default class PlaylistService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('playlistModel') private playlistModel: Models.PlaylistsModel,

    @Inject('trackModel') private trackModel: Models.TrackModel,

  ) {}

  // CREATE METHODS
  public createPlaylist(userId: string, name: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.userModel.findById(userId)
        const playlist = await this.playlistModel.create({
          author: { name: user.username, id: user._id },
          name: name,
        })
        console.log('playlist created :', playlist)
        resolve(playlist)
      } catch (err) {
        reject({ code: 500, msg: err.message || err.msg })
      }
    })
  }

  public addSongToPlaylist(userId: string, songId: string, playlistId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let playlist = await this.playlistModel.findById(playlistId)
        const song = await this.trackModel.findById(songId)
        if (String(playlist.author) !== String(userId))
          reject({ code: 400, msg: 'This Playlist does not belong to you' }) //If the playlist and the song exist
        playlist.tracks.push(song._id)
        playlist = await playlist.save()
        if(playlist.images.length < 4){
          playlist.images.push(song.imageUrl)
        }
        await playlist.save()
        console.log(`New song added to playlist ${playlist.name}:`, playlist.tracks)
        resolve(`Song was added to ${playlist.name}`)
        reject({ code: 400, msg: 'Album does not exist' })
      } catch (err) {
        reject({ code: 500, msg: err.message || err.msg })
      }
    })
  }

  public showPlaylistTracks(playlistId: string): Promise<any> {
    //TODO: Test this
    return new Promise(async (resolve, reject) => {
      try {
        let playlistData: any = {}
        let imageIsCollage: Boolean = false // To achieve the collage effect of spotify in the playlist cover
        const playlist = await this.playlistModel.findById(playlistId)
        imageIsCollage = playlist.tracks.length >= 4
        playlistData.tracks = playlist.tracks.map(async (id, index) => {
          const trackDocument = await this.trackModel.findById(id)
          if (imageIsCollage && index <= 3) {
            playlistData.images.push(trackDocument.imageUrl)
          } else if (index === 0) {
            playlistData.images.push(trackDocument.imageUrl)
          }
          return { title: trackDocument.title, id: trackDocument.id, audio: trackDocument.trackUrl }
        })
        playlistData.data = { author: playlist.author, id: playlist._id, title: playlist.name }
        resolve(playlistData) // author is {name: , id:}
      } catch (err) {
        reject({ code: 500, msg: err.message || err.msg })
      }
    })
  }

  public addAlbumToPlaylist(userId: string, playlistId: string, albumId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let playlist = await this.playlistModel.findById(playlistId)
        const tracksDocuments = await this.trackModel.find({
          album: new mongoose.Types.ObjectId(albumId),
        })
        console.log('playlist.tracks before :', playlist.tracks)
        if (!playlist)
          reject({ code: 400, msg: 'The playlist you are trying to modify does not exist' })
        if (userId !== String(playlist.author.id))
          reject({ code: 400, msg: 'You do not have access to this playlist' })
        tracksDocuments.forEach(trackDocument => {
          playlist.tracks.push(trackDocument._id)
        })
        if(playlist.images.length < 4) {
          playlist.images.push(tracksDocuments[0].imageUrl)
        }
        playlist = await playlist.save()
        console.log('newly added tracks :', playlist.tracks)
        resolve('Album added to playlist')
      } catch (err) {
        reject({ code: 500, msg: err.message || err.msg })
      }
    })
  }

  public searchPlaylist(search: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let matchingPlaylists = []
        const matchingPlaylistsDocuments = await this.playlistModel.find({
          title: new RegExp(search, 'i'),
        })
        matchingPlaylists = matchingPlaylistsDocuments.map(playlist => {
          return {
            id: playlist._id,
            author: playlist.author,
            title: playlist.name,
            images: playlist.images,
          }
        })
        resolve(matchingPlaylists)
      } catch (err) {
        reject({ code: 500, msg: err.message || err.msg })
      }
    })
  }

  public showUserPlaylists(userId: string): Promise<any> {
    // TODO: Test this MONGO THING
    return new Promise(async (resolve, reject) => {
      try {
        let playlistsData: Array<any> = []
        const user = await this.userModel.findById(userId)
        const playlists = await this.playlistModel.find({ 'author.id': user._id })
        playlistsData = playlists.map(async playlistDocument => {
          return { id: playlistDocument._id, title: playlistDocument.name, images: playlistDocument.images }
        })
        resolve(playlistsData)
      } catch (err) {
        reject({ code: 500, msg: err.message || err.msg })
      }
    })
  }

  //UPDATE METHODS

  public editPlaylistName(userId: string, name: string, playlistId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.userModel.findById(userId)
        let playlist = await this.playlistModel.findById(playlistId)
        if (userId !== String(playlist.author.id))
          reject({ code: 400, msg: 'You cannot modify this playlist' })
        if (!playlist) reject({ code: 400, msg: 'No matching playlist for id' })
        if (!name) reject({ code: 400, msg: 'Name cannot be empty' })
        playlist.name = name
        playlist = await playlist.save()
        console.log('Playlists modified name: ', playlist.name)
        resolve(playlist.name)
      } catch (err) {
        reject({ code: 500, msg: err.message || err.msg })
      }
    })
  }
  // DELETE METHODS

  public removeSongFromPlaylist(userId: string, songId: string, playlistId: string): Promise<any> {
    return new Promise( async (resolve, reject) => {
      try {
        const song = await this.trackModel.findById(songId)
        let playlist = await this.playlistModel.findById(playlistId)
        if(String(playlist.author.id) !== String(userId)) reject({code: 400, msg: `You don't have permission to modify this playlist`})
        console.log('Playlist tracks before removing:', playlist.tracks)
        playlist.tracks = playlist.tracks.filter(trackId => {
          return String(trackId) !== songId
        })
        if(playlist.tracks.length < 4) { // If we have less than four tracks we remove the spotify collage for the playlist image
          playlist.images = [playlist.images[0]]
        }
        playlist = await playlist.save()
        console.log('Playlist tracks after removing:', playlist.tracks)
        resolve(`${song.title} removed from playlist`)
      } catch (err) {
        reject({code: 400, msg: err.message || err.msg})
      }
    })
  }

  public deletePlaylist(userId: string, playlistId: string): Promise<any> {
    return new Promise( async (resolve, reject) => {
      try {
        const playlistTobeDeleted = await this.playlistModel.findById(playlistId)
        if(String(playlistTobeDeleted.author.id) !== String(userId)) reject({code: 400, msg: `You don't have permission to modify this playlist`})
        
        const deletedPlaylist = await this.playlistModel.deleteOne({_id: new mongoose.Types.ObjectId(playlistId)})
        console.log('Deleted playlist :', deletedPlaylist)
        resolve(`${playlistTobeDeleted.name} playlist was deleted`)
      } catch (err) {
        reject({code: 500, msg: err.message || err.msg})
      }
    })
  }
}
