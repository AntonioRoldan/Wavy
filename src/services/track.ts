/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import { Service, Inject } from 'typedi'
import S3Service from './s3'
import { ObjectId } from 'bson'

@Service()
export default class TrackService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    private s3Service: S3Service,
    @Inject('trackModel') private trackModel: Models.TrackModel,
    @Inject('albumModel') private albumModel: Models.AlbumModel
  ) {}

  public uploadTracks(
    userId: ObjectId,
    tracksObjects: any[],
    trackFiles: any[],
    imageFiles: any[]
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        var trackIndex = 0 // READ THIS COMMENT TO UNDERSTAND THIS VARIABLE If we have tracks with no images we increase this index everytime a track with an image has been found to access its corresponding image url in the array while iterating through other track objects that may not have images
        const trackUrls = await this.s3Service.uploadTracks(userId.toString(), trackFiles)
        const imageUrls = imageFiles
          ? await this.s3Service.uploadTracksImages(userId.toString(), imageFiles)
          : []
        const artist = await this.userModel.findById(userId)
        const artistName = artist.username
        tracksObjects.forEach(async (track, index) => {
          const trackDocument = track.hasImage
            ? await this.trackModel.create({
                authorId: userId,
                authorName: artistName,
                imageUrl: imageUrls[trackIndex],
                genres: track.genres,
                isSingleTrack: true,
                trackUrl: trackUrls[index],
                title: track.title,
                isPremium: track.isPremium,
                inspiredArtists: track.inspiredArtists,
              })
            : await this.trackModel.create({
                authorId: userId,
                authorName: artistName,
                genres: track.genres,
                isSingleTrack: true,
                trackUrl: trackUrls[index],
                title: track.title,
                isPremium: track.isPremium,
                inspiredArtists: track.inspiredArtists,
              })
          trackIndex = track.hasImage ? trackIndex++ : trackIndex
          console.log('trackDocumentUploaded :', trackDocument)
        })
        resolve('Tracks were uploaded successfully')
      } catch (err) {
        reject({ code: 500, msg: err.msg })
      }
    })
  }


  public uploadImageForExistingTrack(userId:string, trackId: ObjectId, imageFile: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const track = await this.trackModel.findById(trackId)
        const imageUrl = await this.s3Service.uploadTracksImages(userId, [imageFile])
        track.imageUrl = imageUrl[0]
        const updatedTrack = await track.save()
        resolve(imageUrl)
      } catch(err) {
        reject({code: 500, msg: err.msg})
      }
    })
  }

}
