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
    @Inject('playlistModel') private playlistModel: Models.PlaylistsModel,

    @Inject('trackModel') private trackModel: Models.TrackModel,
    @Inject('albumModel') private albumModel: Models.AlbumModel
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
        if (String(playlist.author) !== userId)
          reject({ code: 400, msg: 'This Playlist does not belong to you' }) //If the playlist and the song exist
        playlist.tracks.push(song._id)
        playlist = await playlist.save()
        if (playlist.tracks.length === 4) {
          playlist.tracks.forEach(async id => {
            const track = await this.trackModel.findById(id)
            playlist.images.push(track.imageUrl)
            playlist = await playlist.save()
            console.log('Playlist collage added :', playlist.images)
          })
        } else if (playlist.tracks.length === 1) {
          const track = await this.trackModel.findById(playlist.tracks[0])
          playlist.images.push(track.imageUrl)
          playlist = await playlist.save()
          console.log('Single image added to playlist:', playlist.images)
        }
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
        const albumExists = await this.albumModel.findById(albumId)
        let playlist = await this.playlistModel.findById(playlistId)
        const tracksDocuments = await this.trackModel.find({
          album: new mongoose.Types.ObjectId(albumId),
        })
        let setCollageImage: Boolean = false
        let setSingleImage: Boolean = false
        console.log('playlist.tracks :', playlist.tracks)
        if (!playlist)
          reject({ code: 400, msg: 'The playlist you are trying to modify does not exist' })
        if (userId !== String(playlist.author.id))
          reject({ code: 400, msg: 'You do not have access to this playlist' })
        if (!playlist.tracks.length) {
          setSingleImage = true
        } else if (playlist.tracks.length < 4) {
          const totalTracks = playlist.tracks.length + tracksDocuments.length
          if (totalTracks >= 4) {
            setCollageImage = true
          } else if (totalTracks === 1) {
            setSingleImage = true
          }
        }
        tracksDocuments.forEach(trackDocument => {
          playlist.tracks.push(trackDocument._id)
        })
        if (setCollageImage) {
          tracksDocuments.forEach(async (track, index) => {
            if (index < 4) playlist.images.push(track.imageUrl)
          })
          console.log('Collage images added:', playlist.images)
        } else if (setSingleImage) {
          playlist.images.push(tracksDocuments[0].imageUrl)
          console.log('Single image added :', playlist.images)
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
        resolve(`Playlist's name successfully modified`)
      } catch (err) {
        reject({ code: 500, msg: err.message || err.msg })
      }
    })
  }
  // DELETE METHODS

  public deleteSongFromPlaylist(userId: string, songId: string, playlistId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        
      } catch (err) {}
    })
  }

  public deletePlaylist(userId: string, playlistId: string) {
    try {
    } catch (err) {}
  }
}
