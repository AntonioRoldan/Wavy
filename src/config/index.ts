/*
  Copyright (c) 2020 Antonio Roldan
  All rights reserved
*/

import dotenv from 'dotenv'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const envFound = dotenv.config()
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️")
}

const config = {

  validImageExtensions: ['jpeg', 'png'],

  s3AccessKeyID: process.env.S3_ACCESS_KEY_ID,

  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,

  s3Region: process.env.S3_REGION,

  s3BucketName: process.env.S3_BUCKET_NAME,

  port: parseInt(process.env.PORT, 10),

  jwtsecret: process.env.JWT_SECRET,

  databaseURL: process.env.MONGODB_URI,

  redisHost: process.env.REDIS_HOST,

  redisPort: process.env.REDIS_PORT,

  email: process.env.WAVY_EMAIL,

  password: process.env.WAVY_PASS,

  api: {
    prefix: '/api'
  },

  amqpURL: process.env.AMQP_URL,

  queues: {
    uploadAlbum: 'upload-album',
    addNewTracksToAlbum: 'add-new-tracks-to-album',
    editAlbumCover: 'edit-album-cover',
    deleteAlbum: 'delete-album',
    deleteAlbumTrack: 'delete-album-track',
    uploadTracks: 'upload-tracks',
    editTrackCover: 'edit-track-cover',
    deleteTrack: 'delete-track'
  }
}

export default config
