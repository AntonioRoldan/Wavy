/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
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
import TrackService from '../../services/track'
import { Container } from 'typedi'

const isAuth = require('../middleware/isAuth')
import { Request, Response, Router } from 'express'

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
  var upload = multer({ dest: '/temp', limits: {fileSize: 5120 * 5120}, fileFilter: tracksFileFilter})
  var beatUpload: any = upload.fields([{name: 'tracks', maxCount: 10}, {name: 'cover', maxCount: 1}])
  var tracksToExistingBeatUpload: any = multer({ dest: '/temp', limits: {fileSize: 5120 * 5120}, fileFilter: addTracksToExistingAlbumFilter}).array('tracks', 10)
  route.use(isAuth)
  app.use('/beats', route)

  // MARK: Album routes 

  route.post('/upload', beatUpload, async (req: Request, res: Response) => {
    /* 
    req.body.album : {title: '', tracks: [{
      "title": , "inspiredArtists": ["", ""], "genres": [], "isPremium": 
    }]}
    req.files : {cover: [], tracks: []}
    */ 
    // TODO: USER SECURITY CHECK

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    if(!files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
    const beatService = Container.get(BeatService)
    const authServiceInstance = Container.get(AuthService)
    const albumObject = JSON.parse(req.body.album)
    if(files['tracks'].length != albumObject.tracks.length) 
    { errorHandle(res, 'Length of uploaded tracks and uploaded files not matching', 400) }
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const successMessage = await beatService.uploadBeat(userId, albumObject, files['tracks'], files['cover'][0])
      responseHandle(res, successMessage)
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.post('/add_new_tracks/:id', tracksToExistingBeatUpload, async (req: Request, res: Response) => {
    /* 
    req.body.tracks = {"tracks": [{
    "title": , "inspiredArtists": ["", ""], "genres": [], "isPremium": false
    , "hasImage": false, "type": ""}]} 
    req.files = {tracks: [], images: []}
    */

    const files = req.files as Express.Multer.File[]
    if(files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
    const beatService = Container.get(BeatService)
    const authServiceInstance = Container.get(AuthService)
    const trackObjects = JSON.parse(req.body.tracks)
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const successMessage = await beatService.addTracksToExistingBeat(userId, mongoose.Types.ObjectId(req.params.id), trackObjects, files)
      responseHandle(res, successMessage)
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.get('/show/:id', async (req: Request, res: Response) => {
    const beatId = req.params.id 
    const beatServiceInstance = Container.get(BeatService)
    try {
      const beatData = await beatServiceInstance.getBeatTracks(new mongoose.Types.ObjectId(beatId))
      responseHandle(res, beatData)
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.put('/edit_name/:id/:name', async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
    const beatId = req.params.id 
    const beatName = req.params.name
    const beatServiceInstance = Container.get(BeatService)
    const authServiceInstance = Container.get(AuthService)
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await beatServiceInstance.editBeatName(userId, beatId, beatName)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.put('/edit_cover/:id', async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
    const beatId = req.params.id 
    const beatServiceInstance = Container.get(BeatService)
    const authServiceInstance = Container.get(AuthService)
     try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await beatServiceInstance.editBeatCover(userId, new mongoose.Types.ObjectId(beatId), req.file)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.delete('/delete/:id', async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
    // Delete album 
    const beatId = req.params.id
    const beatServiceInstance = Container.get(BeatService)
    const authServiceInstance = Container.get(AuthService)
     try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await beatServiceInstance.deleteBeat(userId, beatId)
      responseHandle(res, responseData)
    } catch(err) { 
      errorHandle(res, err.msg, err.code)
    }
  })

  route.delete('/delete_track/:trackId', (req: Request, res: Response) => {
    /* TODO: write this with user security check 

    */
    try {
      
    } catch(err) {
      
    }
  })

}