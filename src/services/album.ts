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
export default class AlbumService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    private s3Service: S3Service,

    private trackService: TrackService,
    @Inject('trackModel') private trackModel: Models.TrackModel,
    @Inject('albumModel') private albumModel: Models.AlbumModel
  ) {}

  // MARK: Create methods 
  public addTracksToExistingAlbum(userId: ObjectId, albumId: ObjectId, trackObjects: any[], trackFiles: any[]): Promise<any> {
    /*
    Allows user to add new tracks to an already uploaded album  
    */
       //TODO: Test this 
   return new Promise( async (resolve, reject) => {
     try {
      const trackUrls = await this.s3Service.uploadTracks(userId.toString(), trackFiles, albumId.toString())
      const album = await this.albumModel.findById(albumId)
      const user = await this.userModel.findById(userId)
      trackObjects.forEach(async (trackObject, index) => {
        const createdTrack = await this.trackModel.create({
          authorId: userId,
          authorName: user.username,
          imageUrl: album.undercoverUrl,
          genres: album.genres,
          isSingleTrack: false,
          trackUrl: trackUrls[index],
          album: album._id,
          title: trackObject.title,
          isPremium: trackObject.isPremium,
          inspiredArtists: trackObject.inspiredArtists
        })
        console.log('createdTrack :', createdTrack)
      })
      resolve('Tracks successfully added to album')
     } catch(err) {
       reject({code: 500, msg: err.msg})
     }
   })
  }

  public uploadAlbum(userId: ObjectId, albumObject: any, trackFiles: any[], undercoverFile: any): Promise<any> {
        //TODO: Test this 

    return new Promise( async (resolve, reject) => {
      const user = await this.userModel.findById(userId)
      const albumAuthor = user.username
      const albumTitle = albumObject.title
      const tracksObjects: any = albumObject.tracks
      try {
        if(!undercoverFile) reject({code: 400, msg: 'Undercover image not provided'})
        const undercoverUrl = await this.s3Service.uploadAlbumUnderCover(userId.toString(), undercoverFile)
        var albumModel: any = await this.albumModel.create({
          title: albumTitle,
          author: albumAuthor,
          undercoverUrl: undercoverUrl,
          genres: albumObject.genres,
          isPremium: albumModel.isPremium
        })
        const trackUrls = await this.s3Service.uploadTracks(userId.toString(), trackFiles, albumModel._id.toString())
        tracksObjects.forEach(async (track: any, index: any) => {
          const trackCreated = await this.trackModel.create({
            authorId: userId,
            authorName: albumAuthor,
            imageUrl: undercoverUrl,
            genres: albumObject.genres,
            isSingleTrack: false,
            trackUrl: trackUrls[index],
            album: albumModel._id,
            title: track.title,
            isPremium: albumModel.isPremium ? true : track.isPremium,
            inspiredArtists: track.inspiredArtists,
            type: 'album'
          })
          console.log('Track created :', trackCreated)
        })
        resolve('Album was uploaded successfully')
      } catch(err) {
        reject({code: err.code, msg: err.msg})
      }
    })
  }

  // MARK: Read 

  public searchAlbum(search: string): Promise<any> {
    // TODO: Test this 
    return new Promise( async (resolve, reject) => {
      try{
        let matchingSearchAlbums = [] //Array of objects which we will fill with the albums data 
        const searchMatchingAlbumsDocuments = await this.albumModel.find({title: new RegExp(search, 'i')})
        matchingSearchAlbums = searchMatchingAlbumsDocuments.map(async album => {
          const author = await this.userModel.findById(album.author)
          return { id: album._id,  undercover: album.undercoverUrl, title: album.title, author: author.username}
        })
        console.log('matchingSearchAlbums :', matchingSearchAlbums)
        resolve(matchingSearchAlbums)
      } catch(err) {
        reject({code: 500, msg: err.message | err.msg})
      }
    })
  }

  public getUserAlbums(userId: ObjectId): Promise<any> {
        //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try{
        let userAlbums = []
        const author = await this.userModel.findById(userId)
        const albumsDocuments = await this.albumModel.find({author: userId})
        userAlbums = albumsDocuments.map(album => {
          return { id: album._id,  undercover: album.undercoverUrl, title: album.title, author: author.username}
        })
        resolve(userAlbums)
      }catch(err){
        reject({code: 500, msg: err.message | err.msg})
      }
    })
  }

  // public getSavedAlbums(): Promise<any> {
  //       //TODO: Test this 
  // }

  public getAlbumTracks(userId: ObjectId, albumId: ObjectId): Promise<any> {
        //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try{
        let albumData: any = {} // {album: {title: , author:, undercover: }, tracks: [{title: , audio: }]}
        const albumDocument = await this.albumModel.findById(albumId)
        const author = await this.userModel.findById(albumDocument.author)
        const albumTracks = await this.trackModel.find({album: albumDocument._id})
        albumData.tracks = albumTracks.map(track => {
          return {title: track.title, audio: track.trackUrl, isPremium: track.isPremium}
        })
        albumData.album = {title: albumDocument.title, author: author.username, undercover: albumDocument.undercoverUrl}
        resolve(albumData)
      } catch(err) {
        reject({code: 500, msg: err.message | err.msg})
      }
    })
  }

  // Update 

  public editAlbumUndercover(userId: string, trackId: ObjectId, undercoverFile: any): Promise<any> {
    //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try{
        const album = await this.albumModel.findById(trackId)
        const deletedFile = await this.s3Service.deleteFile(album.undercoverUrl)
        console.log('deletedFile :', deletedFile)
        const undercoverUrl = await this.s3Service.uploadAlbumUnderCover(userId, undercoverFile)
        album.undercoverUrl = undercoverUrl
        const modifiedAlbum = await album.save()
        console.log('modifiedAlbum :', modifiedAlbum)
        resolve(modifiedAlbum)
      } catch(err){ 
        reject({code: err.code, msg: err.message | err.msg})
      }
    })
  }
  public editAlbumName(albumId: string, albumName: string): Promise<any> {
        //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try {
        const album = await this.albumModel.findById(albumId)
        album.title = albumName
        const modifiedTrack = await album.save()
        console.log('modifiedTrack :', modifiedTrack)
        resolve(albumName)
      } catch (err){
        reject({code: 500, msg: err.message | err.msg})
      }
    })
  }

  // MARK: Delete methods 
  public deleteAlbum(albumId: string): Promise<any> {
        //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try {
        const tracksToBeDeleted = await this.trackModel.find({album: mongoose.Types.ObjectId(albumId)})
        if(!tracksToBeDeleted) reject({code: 400, msg: 'Album does not exist'})
        tracksToBeDeleted.forEach(async track => {
          this.trackService.deleteTrack(track._id) 
          const deletedMongoTrack = await this.trackModel.deleteOne({_id: track._id})
          console.log('deletedMongoTrack :', deletedMongoTrack)
        })
        const album = await this.albumModel.findById(mongoose.Types.ObjectId(albumId))
        const deletedUndercover = await this.s3Service.deleteFile(album.undercoverUrl)
        console.log('deletedUndercover :', deletedUndercover)
        const deletedAlbum = await this.albumModel.deleteOne({_id: mongoose.Types.ObjectId(albumId)})
        console.log('deletedAlbum :', deletedAlbum)
        resolve('Album was deleted')
      } catch(err){
        reject({code:500, msg: err.msg | err.message})
      }
    })
  }
}