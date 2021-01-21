/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


/* 
TODO: Refactor, call the route album, the create routes will be /album/create, edit /album/delete, edit /album/edit and so on 
This route handles file uploads to S3 
regex for password longer than 6 characters containing at least one weird character 
 return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*:])(?=.{6,})/.test(value)
 react-material-ui-form-validator 
*/

import multer from 'multer'
import mongoose from 'mongoose'
import AuthService from '../../services/authentication/auth'
import BeatService from '../../services/beat'
import { publishToQueue } from '../../services/mq'
import events from '../../subscribers/events'
import config from '../../config'
import { EventDispatcher } from 'event-dispatch'
import { Container } from 'typedi'
const isAuth = require('../middleware/isAuth')
import { Request, Response, Router } from 'express'

const eventDispatcher = new EventDispatcher()


export const route = Router()

const errorHandle = (res: Response, errorMessage: string, code: number): void => {
  errorMessage = errorMessage || 'Unknown error'
  code = code || 500

  res.status(code).send(errorMessage)
}

const responseHandle = (res: Response, data: any, code: number = 200): void => {
  res.status(code).send(data)
}

const tracksFileFilter = (req: Request, file: any, cb: any) => {
  if(file.fieldname === 'tracks'){
    if(file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/vnd.wav'){
      cb(null, true)
    } else {
      cb(null, false)
    }
  } else if(file.fieldname === 'images' || file.fieldname === 'cover') {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
      cb(null, true)
    } else {
      cb(null, false)
    }
  }
}

const addTracksToExistingAlbumFilter = (req: Request, file: any, cb: any) => {
  if(file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/vnd.wav'){
    cb(null, true)
  } else {
    cb(null, false)
  }
}

export default (app: Router) => {
  var upload = multer({ dest: config.multerDestinationPath, limits: {fileSize: 5120 * 5120}, fileFilter: tracksFileFilter})
  var beatUpload: any = upload.fields([{name: 'tracks', maxCount: 10}, {name: 'cover', maxCount: 1}])
  var tracksToExistingBeatUpload: any = multer({ dest: config.multerDestinationPath, limits: {fileSize: 5120 * 5120}, fileFilter: addTracksToExistingAlbumFilter}).array('tracks', 10)
  route.use(isAuth)
  app.use('/beats', route)

  // MARK: Album routes 

  route.post('/upload', beatUpload, async (req: Request, res: Response) => {
    /* 
    req.body.beat = {title: '', price: 0, tracks: [{
      "title": , "inspiredArtists": ["", ""], "genres": [],
    }]}
    req.files : {cover: [], tracks: []}
    */ 
    // TODO: USER SECURITY CHECK

    
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] }
      if(!files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
      const authServiceInstance = Container.get(AuthService)
      const beatObject = JSON.parse(req.body.beat)
      if(files['tracks'].length != beatObject.tracks.length) 
      { errorHandle(res, 'Length of uploaded tracks and uploaded files not matching', 400) }
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      publishToQueue(config.queues.beat.upload, JSON.stringify({userId, beatObject, trackFiles: files['tracks'], coverFile: files['cover'][0]}))
      .then(() => {
        eventDispatcher.dispatch(events.beat.upload) // We run the queue's worker 
        responseHandle(res, 'Beat is uploading')
      }).catch((err) => {
        errorHandle(res, err.msg || err.message, err.code)
      })
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.get('/search/', async (req: Request, res: Response) => {
     // /search?term=value 
     try {
      const searchTerm = req.query.term as string
      const beatServiceInstance = Container.get(BeatService)
      const responseData = await beatServiceInstance.searchBeat(searchTerm)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.post('/add_new_tracks/:beatId', tracksToExistingBeatUpload, async (req: Request, res: Response) => {
    /* 
    req.body.tracks = {"tracks": [{
    "title": , "inspiredArtists": ["", ""], "genres": [], "isPremium": false
    , "hasImage": false, "type": ""}]} 
    req.files = {tracks: [], images: []}
    */

    try {
      const files = req.files as Express.Multer.File[]
      if(files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
      const authServiceInstance = Container.get(AuthService)
      const trackObjects = JSON.parse(req.body.tracks)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      publishToQueue(config.queues.beat.addNewTracks, JSON.stringify({userId, beatId: req.params.beatId, trackObjects, trackFiles: files}))
      .then(() => {
        eventDispatcher.dispatch(events.beat.addNewTracks) // We run the queue's worker 
        responseHandle(res, 'New tracks being added to beat')
      })
      .catch((err) => {
        errorHandle(res, err.msg || err.message, err.code)
      })
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.get('/show/:id', async (req: Request, res: Response) => {
   /* 
   Response 
   {tracks: [{title: track.title, audio: track.trackUrl}],
    beat: {title: beatDocument.title, authorId: author._id, author: author.username, cover: beatDocument.coverUrl, id: beatDocument._id}}
   */
    try {
      const beatId = req.params.id 
      const beatServiceInstance = Container.get(BeatService)
      const beatData = await beatServiceInstance.getBeatTracks(new mongoose.Types.ObjectId(beatId))
      responseHandle(res, beatData)
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.put('/edit_name/:id/:name', async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
    try {
      const beatId = req.params.id 
      const beatName = req.params.name
      const beatServiceInstance = Container.get(BeatService)
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await beatServiceInstance.editBeatName(userId, beatId, beatName)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.get('/user_beats/:userId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId
      const beatServiceInstance = Container.get(BeatService)
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const loggedInUserId = await authServiceInstance.getUserId(token)
      const responseData = await beatServiceInstance.getUserBeats(userId, loggedInUserId)
      responseHandle(res, responseData)
    } catch (err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.get('/beats_shop/', async (req: Request, res: Response) => {
    try {
      const skip = Number(req.query.skip)
      const limit = Number(req.query.limit)
      const authServiceInstance = Container.get(AuthService)
      const beatServiceInstance = Container.get(BeatService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await beatServiceInstance.getBeats(userId, skip, limit)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.put('/edit_cover/:beatId', async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
     try {
      const beatId = req.params.id 
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      publishToQueue(config.queues.beat.editCover, JSON.stringify({userId, beatId, coverFile: req.file}))
      .then(() => {
        eventDispatcher.dispatch(events.beat.editCover)
        responseHandle(res, 'Editing beat cover')
      })
      .catch((err) => {
        errorHandle(res, err.msg || err.message, err.code)
      })
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.delete('/delete/:id', async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
    // Delete album 
     try {
      const beatId = req.params.id
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      publishToQueue(config.queues.beat.delete, JSON.stringify({userId, beatId}))
      .then(() => {
        eventDispatcher.dispatch(events.beat.delete)
        responseHandle(res, 'Beat being deleted')
      })
      .catch((err) => {
        errorHandle(res, err.msg || err.message, err.code)
      })
    } catch(err) { 
      errorHandle(res, err.msg, err.code)
    }
  })

  route.delete('/delete_track/:trackId', async (req: Request, res: Response) => {
    /* TODO: write this with user security check 

    */
   try {
      const trackId = req.params.trackId
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      publishToQueue(config.queues.beat.deleteTrack, JSON.stringify({userId, trackId}))
      .then(() => {
        eventDispatcher.dispatch(events.beat.deleteTrack)
        responseHandle(res, 'Deleting track from beat')
      })
      .catch((err) => {
        errorHandle(res, err.msg || err.message, err.code)
      })
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })
}