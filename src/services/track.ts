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

  // MARK: Create 

  public uploadTracks(
    userId: ObjectId,
    tracksObjects: any[],
    trackFiles: any[],
    imageFiles: any[]
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // TODO: Store audio file duration 
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

  // MARK: Read 

  public getUserTracks(userId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let userTracks =[] 
        const userTracksDocuments = await this.trackModel.find({authorId: userId})
        userTracks = userTracksDocuments.filter(track => {
          return track.type != 'drumkit' && track.type != 'loop'
        }).map(track => {
          return {title: track.title, author: track.authorName, image: track.imageUrl, audio: track.trackUrl, type: track.type}
        }) 
        resolve(userTracks)
      } catch(err){
        reject({code: 500, msg: err.message || err.msg})
      }
    })
  }

  public searchTracks(search: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let matchingTracks = []
        const matchingTracksDocuments = await this.trackModel.find({title: new RegExp(search, 'i')})
        matchingTracks = matchingTracksDocuments.map(track => {
          return {title: track.title, author: track.authorName, image: track.imageUrl, audio: track.trackUrl}
        })
        resolve(matchingTracks)
      } catch(err){
        reject({code: 500, msg: err.message || err.msg})
      }
    })
  }

  // MARK: Update 

  public editTrackName(trackId: ObjectId, trackName: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if(!trackName) reject({code: 400, msg: 'Track name cannot be empty'})
        const track = await this.trackModel.findById(trackId)
        track.title = trackName
        const modifiedTrack = await track.save()
        console.log('modifiedTrack :', modifiedTrack)
        resolve(trackName)
      } catch (err){
        reject({code: 500, msg: err.message || err.msg})
      }
    })
  }

  public editTrackImage(userId:string, trackId: ObjectId, imageFile: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const track = await this.trackModel.findById(trackId)
        if(!track.isSingleTrack) reject({code: 400, msg: 'Change album undercover to change this track image'})
        if(track.imageUrl) { 
          const track = await this.trackModel.findById(trackId)
          if(!track) reject({code: 400, msg: 'This track does not exist'})
          const deletedImage = await this.s3Service.deleteFile(track.imageUrl)
          console.log('deletedImage :', deletedImage)
          const imageUrl = await this.s3Service.uploadTracksImages(userId, [imageFile])
          track.imageUrl = imageUrl[0]
          const updatedTrack = await track.save()
          console.log('updatedTrack :', updatedTrack)
          resolve(imageUrl)
        } else { // If track did not have an image we just add it 
          const imageUrl = await this.s3Service.uploadTracksImages(userId, [imageFile])
          track.imageUrl = imageUrl[0]
          const updatedTrack = await track.save()
          console.log('updatedTrack :', updatedTrack)
          resolve(imageUrl)
        }
      } catch(err) {
        reject({code: 500, msg: err.msg})
      }
    })
  }

  // MARK: Delete
  public deleteTrack(trackId: string): Promise<any> {
    return new Promise( async (resolve, reject) => {
      try {
        const track = await this.trackModel.findById(trackId)
        const deletedTrackImage = await this.s3Service.deleteFile(track.imageUrl)
        console.log('deletedTrackImage :', deletedTrackImage)
        const deletedTrackAudio = await this.s3Service.deleteFile(track.trackUrl)
        console.log('deletedTrackAudio :', deletedTrackAudio)
        const deletedTrack =  await this.trackModel.deleteOne(trackId)
        console.log('deletedTrack :', deletedTrack)
        resolve('Track was deleted')
      } catch(err) {
        reject({code: 500, msg: err.msg})
      }
    })
  }
}
