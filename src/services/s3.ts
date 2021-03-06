/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */



import { Service, Inject } from 'typedi'
import config from '../config'
import aws from 'aws-sdk'
import fs from 'fs'
import { ObjectId } from 'bson'
import { v4 as uuidv4 } from 'uuid'
const AmazonS3URI = require('amazon-s3-uri')
import mime from 'mime-types'

/* 
In case read stream does not work we could use buffer 
https://stackoverflow.com/questions/51662622/how-to-get-a-wav-file-from-a-post-body-to-upload-it-using-node-js-express
Try this to delete an object by its url 
https://stackoverflow.com/questions/40263691/deleting-aws-s3-resource-with-resource-url-java-sdk 
https://stackoverflow.com/questions/44160422/aws-s3-get-object-using-url 
*/

@Service()
export default class S3Service {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('trackModel') private trackModel: Models.TrackModel,
    @Inject('albumModel') private albumModel: Models.AlbumModel
  ) {}

  private storeProfileImageReferenceInDB(userId: ObjectId, imageURL: string): Promise<any> {
    // TODO: transfer this to the db-service module 
    return new Promise((resolve, reject) => {
      this.userModel.findById(userId, async (err, user) => {
        user.avatarURL = imageURL // We will use the url in <img src=''/> to show the image 
        user
          .save()
          .then(user => resolve(user))
          .catch(err => reject({ code: 500, msg: err.msg || err.message }))
      })
    })
  }
  public uploadProfileImage(userId: ObjectId, imageFile: any) {
    /*  We store it in the wavyfiles bucket as /userAvatar/userId/imageId
    */
    return new Promise( async (resolve, reject) => {
      if(!imageFile) {
        reject({code: 400, msg:'No input file received'})
      }
      const { data, name, encoding, mimetype, size, } = imageFile
      const extension = mime.extension(mimetype)
      if(!extension || !config.validImageExtensions.includes(extension)){
        reject({code: 400, msg: 'Only png and jpeg formats supported'})
      }
      const imageId = uuidv4() // We use this id to generate our S3 object key 
      aws.config.update({
        accessKeyId: config.s3AccessKeyID,
        secretAccessKey: config.s3SecretAccessKey,
        region: config.s3Region,
      })
      const s3 = new aws.S3({
        credentials: {
          accessKeyId: config.s3AccessKeyID,
          secretAccessKey: config.s3SecretAccessKey
        }
      })
      var params = {
        ACL: 'public-read',
        Bucket: config.s3BucketName,
        Body: fs.createReadStream(imageFile.path),
        Key: `userAvatar/${userId.toString()}/${imageId}`, // There will be a userAvatar with a user subfolder where the image id will be stored
      }
      s3.upload(params, async (err: Error, data: any) => {
        if(err) reject({code: 500, msg: err.message})
        fs.unlinkSync(imageFile.path) // We empty the temp folder where we stored the image in multer's middleware
        const avatarURL = data.Location
        try {
          await this.storeProfileImageReferenceInDB(userId, avatarURL)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  public uploadAlbumCover(userId: string, coverFile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const underCoverId = uuidv4()
      var key = `userAlbums/${userId}/undercovers/${underCoverId}`
      aws.config.update({
        accessKeyId: config.s3AccessKeyID,
        secretAccessKey: config.s3SecretAccessKey,
        region: config.s3Region,
      })
      const s3 = new aws.S3({
        credentials: {
          accessKeyId: config.s3AccessKeyID,
          secretAccessKey: config.s3SecretAccessKey
        }
      })
      var params = {
        ACL: 'public-read',
        Bucket: config.s3BucketName,
        Body: fs.createReadStream(coverFile.path), // TODO: We might have to create a buffer to store the audio file we will test this
        Key: key, // There will be a userAvatar with a user subfolder where the image id will be stored
      }
      s3.upload(params, (err: Error, data: any) => {
        if(err) reject({code: 500, msg: err.message})
        fs.unlinkSync(coverFile.path) // We empty the temp folder where we stored the image in multer's middleware
        resolve(data.Location)
      })
    })
  }

  public uploadSingleTrack(userId: string, trackFile: any, albumId: string = '', beatId: string = ''): Promise<any> {
    return new Promise((resolve, reject) => {
      const trackId = uuidv4()
      var key = ''
      key = albumId ? `userAlbums/${userId}/audios/${albumId}/${trackId}` : beatId ? `userBeats/${userId}/audios/${beatId}/${trackId}` : `userTracks/${userId}/audios/${trackId}`
      aws.config.update({
        accessKeyId: config.s3AccessKeyID,
        secretAccessKey: config.s3SecretAccessKey,
        region: config.s3Region,
      })
      const s3 = new aws.S3({
        credentials: {
          accessKeyId: config.s3AccessKeyID,
          secretAccessKey: config.s3SecretAccessKey
        }
      })
      var params = {
        ACL: 'public-read',
        Bucket: config.s3BucketName,
        Body: fs.createReadStream(trackFile.path), // TODO: We might have to create a buffer to store the audio file we will test this
        Key: key, // There will be a userAvatar with a user subfolder where the image id will be stored
      }
      s3.upload(params, (err: Error, data: any) => {
        if(err) reject({code: 500, msg: err.message})
        fs.unlinkSync(trackFile.path) // We empty the temp folder where we stored the image in multer's middleware
        resolve(data.Location)
      })
    })
  }

  private uploadSingleTrackImage(userId: string, imageFile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const imageId = uuidv4()
      var key = `userTracks/${userId}/images/${imageId}`
      aws.config.update({
        accessKeyId: config.s3AccessKeyID,
        secretAccessKey: config.s3SecretAccessKey,
        region: config.s3Region,
      })
      const s3 = new aws.S3({
        credentials: {
          accessKeyId: config.s3AccessKeyID,
          secretAccessKey: config.s3SecretAccessKey
        }
      })
      var params = {
        ACL: 'public-read',
        Bucket: config.s3BucketName,
        Body: fs.createReadStream(imageFile.path), // TODO: We might have to create a buffer to store the audio file we will test this
        Key: key, 
      }
      s3.upload(params, (err: Error, data: any) => {
        if(err) reject({code: 500, msg: err.message})
        fs.unlinkSync(imageFile.path) // We empty the temp folder where we stored the image in multer's middleware
        resolve(data.Location)
      })
    })
  }

  public deleteFile(fileUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const { region, bucket, key } = AmazonS3URI(fileUrl)
      const params: any = {
        Bucket: bucket,
        key: key
      }
      aws.config.update({
        accessKeyId: config.s3AccessKeyID,
        secretAccessKey: config.s3SecretAccessKey,
        region: config.s3Region,
      })
      const s3 = new aws.S3({
        credentials: {
          accessKeyId: config.s3AccessKeyID,
          secretAccessKey: config.s3SecretAccessKey
        }
      })
      s3.deleteObject(params, (err, data) => {
        if(err) reject({code: 500, msg: err.message})
        resolve(data)
      })
    })
  }
  public uploadTracksImages(userId: string, imageFiles: any[]): Promise<any> {
    /* Returns an array of image urls, only used for single tracks 
     */
    return new Promise(async (resolve, reject) => {
      Promise.all(imageFiles.map(imageFile => {
        return this.uploadSingleTrackImage(userId, imageFile)
      })).then(imageUrls => {
        resolve(imageUrls)
      })
      .catch(err => {
        reject({code: 500, msg: err.msg || err.message})
      })
    })
  }

  public uploadTracks(userId: string, trackFiles: any[], albumId: string = '', beatId: string = ''): Promise<any> {
    /* 
      Returns an array of s3 urls 
    */
    return new Promise(async (resolve, reject) => {
      if(!trackFiles.length) {
        reject({code: 400, msg: 'No files uploaded'})
      } 
      Promise.all(trackFiles.map(trackFile => {
          return albumId ? this.uploadSingleTrack(userId, trackFile, albumId) : beatId ? this.uploadSingleTrack(userId, trackFile, undefined, beatId) : this.uploadSingleTrack(userId, trackFile)
      }))
      .then(trackUrls => {
        resolve(trackUrls)
      })
      .catch(err => {
        reject({code: 500, msg: err.msg || err.message})
      })
    })
  }

  public uploadBeatCover(userId: string, coverFile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const coverId = uuidv4()
      var key = `userBeats/${userId}/covers/${coverId}`
      aws.config.update({
        accessKeyId: config.s3AccessKeyID,
        secretAccessKey: config.s3SecretAccessKey,
        region: config.s3Region,
      })
      const s3 = new aws.S3({
        credentials: {
          accessKeyId: config.s3AccessKeyID,
          secretAccessKey: config.s3SecretAccessKey
        }
      })
      var params = {
        ACL: 'public-read',
        Bucket: config.s3BucketName,
        Body: fs.createReadStream(coverFile.path), // TODO: We might have to create a buffer to store the audio file we will test this
        Key: key, // There will be a userAvatar with a user subfolder where the image id will be stored
      }
      s3.upload(params, (err: Error, data: any) => {
        if(err) reject({code: 500, msg: err.message})
        fs.unlinkSync(coverFile.path) // We empty the temp folder where we stored the image in multer's middleware
        resolve(data.Location)
      })
    })
  }
}
