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
export default class BeatService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    private s3Service: S3Service,

    private trackService: TrackService,
    @Inject('trackModel') private trackModel: Models.TrackModel,
    @Inject('beatModel') private beatModel: Models.BeatModel
  ) {}

  // MARK: Create methods 
  public addTracksToExistingBeat(userId: ObjectId, beatId: ObjectId, trackObjects: any[], trackFiles: any[]): Promise<any> {
    /*
    Allows user to add new tracks to an already uploaded album  
    */
       //TODO: Test this 
   return new Promise( async (resolve, reject) => {
     try {
      const trackUrls = await this.s3Service.uploadTracks(userId.toString(), trackFiles, undefined, beatId.toString())
      const beat = await this.beatModel.findById(beatId)
      const user = await this.userModel.findById(userId)
      trackObjects.forEach(async (trackObject, index) => {
        if(trackObject.type !== 'drumkit' || trackObject.type !== 'loop'){
          reject({code: 400, msg: 'The type specified for track belonging to a beat has to be drumkit or loop'})
        }
        const createdTrack = await this.trackModel.create({
          authorId: userId,
          authorName: user.username,
          imageUrl: beat.coverUrl,
          genres: beat.genres,
          isSingleTrack: false,
          trackUrl: trackUrls[index],
          beat: beat._id,
          title: trackObject.title,
          isPremium: true,
          inspiredArtists: trackObject.inspiredArtists,
          type: trackObject.type
        })
        console.log('createdTrack :', createdTrack)
      })
      resolve('Tracks successfully added to album')
     } catch(err) {
       reject({code: err.code | 500, msg: err.msg | err.message})
     }
   })
  }

  public uploadBeat(userId: ObjectId, beatObject: any, trackFiles: any[], coverFile: any): Promise<any> {
        //TODO: Test this 

    return new Promise( async (resolve, reject) => {
      const user = await this.userModel.findById(userId)
      const beatAuthor = user.username
      const beatTitle = beatObject.title
      const tracksObjects: any = beatObject.tracks // Same as track object for an album but we add a type property to specify whether it is a loop or a drumkit 
      try {
        if(!coverFile) reject({code: 400, msg: 'Cover image not provided'})
        const coverUrl = await this.s3Service.uploadBeatCover(userId.toString(), coverFile)
        var beatModel: any = await this.beatModel.create({
          title: beatTitle,
          author: beatAuthor,
          coverUrl: coverUrl,
          genres: beatObject.genres,
          price: beatModel.price,
          discount: beatModel.discount
        })
        const trackUrls = await this.s3Service.uploadTracks(userId.toString(), trackFiles, undefined, beatModel._id.toString())
        tracksObjects.forEach(async (track: any, index: any) => {
          if(track.type !== 'drumkit' || track.type !== 'loop') {
            reject({code: 400, msg: 'The type specified for track belonging to a beat has to be drumkit or loop'})
          }
          const trackCreated = await this.trackModel.create({
            authorId: userId,
            authorName: beatAuthor,
            imageUrl: coverUrl,
            genres: beatObject.genres,
            isSingleTrack: false,
            trackUrl: trackUrls[index],
            beat: beatModel._id,
            title: track.title,
            isPremium: true,
            inspiredArtists: track.inspiredArtists,
            type: track.type
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

  public searchBeat(search: string): Promise<any> {
    // TODO: Test this 
    return new Promise( async (resolve, reject) => {
      try{
        let matchingSearchBeats = [] //Array of objects which we will fill with the albums data 
        const searchMatchingBeatsDocuments = await this.beatModel.find({title: new RegExp(search, 'i')})
        matchingSearchBeats = searchMatchingBeatsDocuments.map(async beat => {
          const author = await this.userModel.findById(beat.authorId)
          return { id: beat._id,  undercover: beat.coverUrl, title: beat.title, author: author.username}
        })
        console.log('matchingSearchAlbums :', matchingSearchBeats)
        resolve(matchingSearchBeats)
      } catch(err) {
        reject({code: 500, msg: err.message | err.msg})
      }
    })
  }

  public getUserBeats(userId: ObjectId): Promise<any> {
        //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try{
        let userBeats = []
        const author = await this.userModel.findById(userId)
        const beatsDocuments = await this.beatModel.find({author: userId})
        userBeats = beatsDocuments.map(beat => {
          return { id: beat._id,  undercover: beat.coverUrl, title: beat.title, author: author.username}
        })
        resolve(userBeats)
      }catch(err){
        reject({code: 500, msg: err.message | err.msg})
      }
    })
  }

  // public getSavedAlbums(): Promise<any> {
  //       //TODO: Test this 
  // }

  public getBeatTracks(userId: ObjectId, beatId: ObjectId): Promise<any> {
        //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try{
        let albumData: any = {} // {album: {title: , author:, undercover: }, tracks: [{title: , audio: }]}
        const beatDocument = await this.beatModel.findById(beatId)
        const author = await this.userModel.findById(beatDocument.authorId)
        const albumTracks = await this.trackModel.find({album: beatDocument._id})
        albumData.tracks = albumTracks.map(track => {
          return {title: track.title, audio: track.trackUrl}
        })
        albumData.album = {title: beatDocument.title, author: author.username, cover: beatDocument.coverUrl}
        resolve(albumData)
      } catch(err) {
        reject({code: 500, msg: err.message | err.msg})
      }
    })
  }

  // Update 

  public editBeatCover(userId: string, beatId: ObjectId, coverFile: any): Promise<any> {
    //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try{
        const beat = await this.beatModel.findById(beatId)
        const deletedFile = await this.s3Service.deleteFile(beat.coverUrl)
        console.log('deletedFile :', deletedFile)
        const coverUrl = await this.s3Service.uploadBeatCover(userId, coverFile)
        beat.coverUrl = coverUrl
        const modifiedBeat = await beat.save()
        console.log('modifiedBeat :', modifiedBeat)
        resolve(modifiedBeat)
      } catch(err){ 
        reject({code: err.code, msg: err.message | err.msg})
      }
    })
  }
  public editBeatName(beatId: string, beatName: string): Promise<any> {
        //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try {
        const beat = await this.beatModel.findById(beatId)
        beat.title = beatName
        const modifiedTrack = await beat.save()
        console.log('modifiedBeat :', modifiedTrack)
        resolve(beatName)
      } catch (err){
        reject({code: 500, msg: err.message | err.msg})
      }
    })
  }

  // MARK: Delete methods 
  public deleteBeat(beatId: string): Promise<any> {
        //TODO: Test this 
    return new Promise(async (resolve, reject) => {
      try {
        const tracksToBeDeleted = await this.trackModel.find({beat: mongoose.Types.ObjectId(beatId)})
        if(!tracksToBeDeleted) reject({code: 400, msg: 'Beat does not exist'})
        tracksToBeDeleted.forEach(async track => {
          this.trackService.deleteTrack(track._id) 
          const deletedMongoTrack = await this.trackModel.deleteOne({_id: track._id})
          console.log('deletedMongoTrack :', deletedMongoTrack)
        })
        const beat = await this.beatModel.findById(mongoose.Types.ObjectId(beatId))
        const deletedCover = await this.s3Service.deleteFile(beat.coverUrl)
        console.log('deletedCover :', deletedCover)
        const deletedBeat = await this.beatModel.deleteOne({_id: mongoose.Types.ObjectId(beatId)})
        console.log('deletedBeat :', deletedBeat)
        resolve('Beat was deleted')
      } catch(err){
        reject({code:500, msg: err.msg | err.message})
      }
    })
  }
}