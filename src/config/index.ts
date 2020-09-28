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

  multerDestinationPath: `/Users/${process.env.WHOAMI}/temp`,

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
    prefix: '/api',
    profile: {
      root: '/profile', 
      search: '/search', // ?term=value 
      generalSearch: '/genearl_search', // ?term=value
      showInfo: '/show_user_info' // /:userId
    },
    album: {
      root: '/albums',
      upload: '/upload',
      search: '/search', // /search?term=value
      getUserAlbums: '/user_albums', // parameters :/userId
      addNewTracks: '/add_new_tracks', // parameters: /:albumId
      show: '/show', // paramters: /:id
      editName: '/edit_name', // parameters: /:id/:name
      editCover: '/edit_cover', // parameters: /:albumId
      delete: '/delete', // parameters: /:id
      deleteTrack: '/delete_track', // parameters: /:trackId
      addExistingSong: '/add_existing_song' // /:albumId/:songId
    },
    beat: {
      root: '/beats',
      upload: '/upload',
      shop: '/beats_shop', // ?skip=value&=limit=value 
      search: '/search', // /search?term=value
      getUserBeats: '/user_beats', // /parameters :userId
      addNewTracks: '/add_new_tracks', // parameters: /:beatId
      show: '/show', // paramters: /:id
      editName: '/edit_name', // parameters: /:id/:name
      editCover: '/edit_cover', // parameters: /:beatId
      delete: '/delete', // parameters: /:id
      deleteTrack: '/delete_track' // parameters: /:trackId
    },
    track: {
      root: '/tracks',
      upload: '/upload',
      editCover: '/edit_cover', // parameters: /:id
      editName: '/edit_name', // parameters: /:trackId/:name
      search: '/search', // /search?term=value
      getUserTracks: '/user_tracks', // /parameters :userId
      delete: '/delete' // parameters: /:id
    },
    payment: {
      root: '/payments',
      addToCart: '/add_to_shopping_cart', // /:itemId
      showCart: '/show_shopping_cart',
      clearCart: '/clear_shopping_cart',
      removeFromCart: '/remove_from_cart' // /:itemId
    },
    playlist: {
      root: '/playlists',
      create: '/create', // parameters: /:name
      addAlbum: '/add_album', // parameters: /:paylist_id/:album_id
      addSong: '/add_song',
      search: '/search', // parameters: /:search?term=value
      show: '/show', // parameters: /:id
      editName: '/edit_name', // parameters /:name/:playlist_id
      delete: '/delete', // parameters /:id
      removeSong: '/remove_song' // parameters: /:playlist_id/:song_id
    }
  },

  amqpURL: process.env.AMQP_URL,

  queues: {
    album: {
      upload: 'upload-album',
      addNewTracks: 'add-new-tracks-to-album',
      editCover: 'edit-album-cover',
      delete: 'delete-album',
      deleteTrack: 'delete-album-track'
    },
    track: {
      upload: 'upload-tracks',
      editCover: 'edit-track-cover',
      delete: 'delete-track'
    },
    beat: {
      upload: 'upload-beat',
      addNewTracks: 'add-new-tracks-to-beat',
      editCover: 'edit-beat-cover',
      delete: 'delete-beat',
      deleteTrack: 'delete-beat-track'
    },
    payment: {
      beat: 'beat-payment',
      tutorial: 'tutorial-payment',
      subscription: 'subscription-payment'
    }
  }
}

export default config
