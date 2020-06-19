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
import AlbumService from '../../services/album'
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
  } else if(file.fieldname === 'images' || file.fieldname === 'undercover') {
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
  var tracksUpload: any = upload.fields([{name: 'tracks', maxCount: 10}, {name: 'images', maxCount: 10}])
  var albumUpload: any = upload.fields([{name: 'tracks', maxCount: 10}, {name: 'undercover', maxCount: 1}])
  var tracksToExistingAlbumUpload: any = multer({ dest: '/temp', limits: {fileSize: 5120 * 5120}, fileFilter: addTracksToExistingAlbumFilter}).array('tracks', 10)
  route.use(isAuth)
  app.use('/upload', route)


  // MARK: Tracks routes 

  route.post('/tracks', tracksUpload, async (req: Request, res: Response) => {
    /* 
    req.body.tracks = {tracks: [{
    "title": , "inspiredArtists": ["", ""], "genres": [], "isPremium": false
    , "hasImage": false}]} 
    req.files = {tracks: [], images: []}
    */
    if(!req.files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
    const trackService = Container.get(TrackService)
    const authServiceInstance = Container.get(AuthService)
    const trackObjects = JSON.parse(req.body.tracks)
    if(req.files['tracks'].length != trackObjects.tracks.length || req.files['images'].length != trackObjects.tracks.length) 
    { errorHandle(res, 'Length of uploaded tracks and uploaded files not matching', 400) }
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const successMessage = await trackService.uploadTracks(userId, trackObjects.tracks, req.files['tracks'], req.files['images'])
      responseHandle(res, successMessage)
    } catch(err) {
      errorHandle(res, err.message, err.code)
    }
  })
  // Edit track image 
  route.put('/tracks/:id', multer({dest: '/temp', limits: { fieldSize: 8 * 1024 * 1024 }}).single('image'), 
  async (req: Request, res: Response) => {
    if(!req.files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
    const trackService = Container.get(TrackService)
    const authServiceInstance = Container.get(AuthService)
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const imageUrl = await trackService.editTrackImage(userId.toString(), mongoose.Types.ObjectId(req.params.id), req.file)
      responseHandle(res, {imageUrl: imageUrl})
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.delete('/tracks/:id', (req: Request, res: Response) => {
    // Delete a single track 
  })

  // MARK: Album routes 

  route.post('/album', albumUpload, async (req: Request, res: Response) => {
    /* 
    req.body.album : {title: '', tracks: [{
      "title": , "inspiredArtists": ["", ""], "genres": [], "isPremium": 
    }]}
    req.files : {undercover: [], tracks: []}
    */ 
    if(!req.files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
    const albumService = Container.get(AlbumService)
    const authServiceInstance = Container.get(AuthService)
    const albumObject = JSON.parse(req.body.album)
    if(req.files['tracks'].length != albumObject.tracks.length) 
    { errorHandle(res, 'Length of uploaded tracks and uploaded files not matching', 400) }
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const successMessage = await albumService.uploadAlbum(userId, albumObject, req.files['tracks'], req.files['undercover'][0])
      responseHandle(res, successMessage)
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.post('/album/:id', tracksToExistingAlbumUpload, async (req: Request, res: Response) => {
    /* 
    req.body.tracks = {tracks: [{
    "title": , "inspiredArtists": ["", ""], "genres": [], "isPremium": false
    , "hasImage": false}]} 
    req.files = {tracks: [], images: []}
    */
    if(!req.files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
    const albumService = Container.get(AlbumService)
    const authServiceInstance = Container.get(AuthService)
    const trackObjects = JSON.parse(req.body.tracks)
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const successMessage = await albumService.addTracksToExistingAlbum(userId, mongoose.Types.ObjectId(req.params.id), trackObjects, req.files)
      responseHandle(res, successMessage)
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.put('/album/:name', (req: Request, res: Response) => {

  })

  route.delete('/album/:id', (req: Request, res: Response) => {

  })

  route.delete('/album/:trackId', (req: Request, res: Response) => {
    /* Delete a song from an album 
    */
  })

  route.post('/album/:albumId/:songId', (req: Request, res: Response) => {
    /*  Add an existing song to album 
    */
  })
}