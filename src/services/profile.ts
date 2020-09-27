/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import { Service, Inject } from 'typedi'
import S3Service from './s3'
import AlbumService from './album'
import BeatService from './beat'
import TrackService from './track'
import { ObjectId } from 'bson'

@Service()
export default class UserService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    private s3Service: S3Service,

    private albumService: AlbumService,

    private beatService: BeatService, 

    private trackService: TrackService,
    @Inject('trackModel') private trackModel: Models.TrackModel,
  ) {}

  public editUserInfo(userId: ObjectId, userInfo: any, imageFile: any): Promise<any> {
     /*
      userInfo: {
        description: {data: '', edit: true/false}, 
        twitter: {data: '', edit: true/false},
        instagram: {data: '', edit: true/false},
        facebook: {data: '', edit: true/false},
        editAvatar: true/false 
      } 
      image file 
    */
    return new Promise(async (resolve, reject) => {
      if(userInfo.description.edit) {
        try {
          const user = await this.userModel.findById(userId)
          user.description = userInfo.description.data
          await user.save()
        } catch(err) {
          reject({code: 500, msg: err.msg || err.message})
        }
      }
      if(userInfo.twitter.edit) {
        try {
          const user = await this.userModel.findById(userId)
          user.twitterLink = userInfo.twitter.data
          await user.save()
        } catch(err) {
          reject({code: 500, msg: err.msg || err.message})
        }
      }
      if(userInfo.instagram.edit){
        try {
          const user = await this.userModel.findById(userId)
          user.instagramLink = userInfo.instagram.data
          await user.save()
        } catch(err) {
          reject({code: 500, msg: err.msg || err.message})
        }
      }
      if(userInfo.facebook.edit){
        try {
          const user = await this.userModel.findById(userId)
          user.facebookLink= userInfo.facebook.data
          await user.save()
        } catch(err) {
          reject({code: 500, msg: err.msg || err.message})
        }
      }
      if(userInfo.editAvatar){
        try {
          const user = await this.userModel.findById(userId)
          if(user.avatarURL) 
          await this.s3Service.uploadProfileImage(userId, imageFile)
        } catch(err) {
          reject(err)
        }
      }
      resolve('User info edited')
    })
  }

  public showUserInfo(userId: string, loggedInUserId: string) {
    /*
    Returns 
    {avatar: "", username: "", email: "", id: "", followeeCount: 0, followerCount: 0, albumsCount: 0, beatsCount: 0, tracksCount: 0, 
    tracks: [{title: track.title, author: track.authorName, image: track.imageUrl, audio: track.trackUrl, type: track.type, canEdit: userId === loggedInUserId}],
    beats: [{ id: beat._id,  undercover: beat.coverUrl, title: beat.title, author: author.username,  subDiscount: subDiscount, normalDiscount: normalDiscount, canEdit: userId === loggedInUserId}], 
    albums: [{ id: album._id,  cover: album.coverUrl, title: album.title, author: author.username, canEdit: userId === loggedInUserId}], 
    followers: [array of id's ]
    followees: [array of id's]
    }
    */
    return new Promise( async (resolve, reject) => {
      try {
        const userInfo: any = {}
        const user = await this.userModel.findById(userId)
        const albums = await this.albumService.getUserAlbums(userId, loggedInUserId)
        const beats = await this.beatService.getUserBeats(userId, loggedInUserId)
        const tracks = await this.trackService.getUserTracks(userId, loggedInUserId) // TODO It should return the top ten tracks only
        userInfo.avatar = user.avatarURL
        userInfo.followerCount = user.followers.length
        userInfo.followeeCount = user.follows.length
        userInfo.followees = user.follows
        userInfo.followers = user.followers
        userInfo.username = user.username
        userInfo.email = user.email
        userInfo.id = userId
        userInfo.albumsCount = albums.length
        userInfo.beatsCount = beats.length 
        userInfo.tracksCount = tracks.length 
        userInfo.albums = albums.length >= 4 ? albums.slice(0, 4) : albums 
        userInfo.beats= beats.length >= 4 ? beats.slice(0, 4) : beats
        userInfo.tracks = tracks.length >= 5 ? tracks.slice(0, 5) : tracks 
        resolve(userInfo)
      } catch(err) {
        reject({code: err.code || 500, msg: err.message || err.msg})
      }
    })
  }

  public search() { // Search artists or users 
    return new Promise( async(resolve, reject) => {

    })
  }

}