/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import { Service, Inject } from 'typedi'
import S3Service from './s3'
import TrackService from './track'
import { ObjectId } from 'bson'

@Service()
export default class AlbumService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    private s3Service: S3Service,
    @Inject('trackModel') private trackModel: Models.TrackModel,
    @Inject('albumModel') private albumModel: Models.AlbumModel
  ) {}

  // MARK: Create methods 
  public addTracksToExistingAlbum(userId: ObjectId, albumId: ObjectId, trackObjects: any[], trackFiles: any[]): Promise<any> {
    /*
    Allows user to add new tracks to an already uploaded album  
    */
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
            isPremium: track.isPremium,
            inspiredArtists: track.inspiredArtists
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

  // Update 

  public editAlbumUndercover() {

  }
  public editAlbumName() {

  }

  // MARK: Delete methods 

}