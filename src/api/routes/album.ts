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
  var albumUpload: any = upload.fields([{name: 'tracks', maxCount: 10}, {name: 'cover', maxCount: 1}])
  var tracksToExistingAlbumUpload: any = multer({ dest: '/temp', limits: {fileSize: 5120 * 5120}, fileFilter: addTracksToExistingAlbumFilter}).array('tracks', 10)
  var editCoverUpload: any = multer({dest: '/temp', limits: { fieldSize: 8 * 1024 * 1024 }}).single('cover')
  route.use(isAuth)
  app.use('/albums', route)

  // MARK: Album routes 

  route.post('/upload', albumUpload, async (req: Request, res: Response) => {
    /* 
    req.body.album : {title: '', tracks: [{
      "title": , "inspiredArtists": ["", ""], "genres": [], "isPremium": 
    }]}
    req.files : {cover: [], tracks: []}
    */ 
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    if(!files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
    const albumService = Container.get(AlbumService)
    const authServiceInstance = Container.get(AuthService)
    const albumObject = JSON.parse(req.body.album)
    if(files['tracks'].length != albumObject.tracks.length) 
    { errorHandle(res, 'Length of uploaded tracks and uploaded files not matching', 400) }
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const successMessage = await albumService.uploadAlbum(userId, albumObject, files['tracks'], files['cover'][0])
      responseHandle(res, successMessage)
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.post('/add_new_tracks/:id', tracksToExistingAlbumUpload, async (req: Request, res: Response) => {
    /* 
    req.body.tracks = {tracks: [{
    "title": , "inspiredArtists": ["", ""], "genres": [], "isPremium": false
    , "hasImage": false}]} 
    req.files = {tracks: [], images: []}
    */
    // TODO: USER SECURITY CHECK

    const files = req.files as Express.Multer.File[]
    if(files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
    const albumService = Container.get(AlbumService)
    const authServiceInstance = Container.get(AuthService)
    const trackObjects = JSON.parse(req.body.tracks)
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const successMessage = await albumService.addTracksToExistingAlbum(userId.toString(), new mongoose.Types.ObjectId(req.params.id), trackObjects, files)
      responseHandle(res, successMessage)
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })

  route.get('/show/:id', async (req: Request, res: Response) => {
    const albumId = req.params.id 
    const albumServiceInstance = Container.get(AlbumService)
    try {
      const albumData = await albumServiceInstance.getAlbumTracks(new mongoose.Types.ObjectId(albumId))
      responseHandle(res, albumData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.put('/edit_name/:id/:name', async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
    const albumId = req.params.id 
    const albumName = req.params.name
    const albumServiceInstance = Container.get(AlbumService)
    const authServiceInstance = Container.get(AuthService)
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await albumServiceInstance.editAlbumName(userId, albumId, albumName)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.put('/edit_cover/:id', editCoverUpload, async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
    const albumId = req.params.id 
    const albumServiceInstance = Container.get(AlbumService)
    const authServiceInstance = Container.get(AuthService)
     try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await albumServiceInstance.editAlbumCover(userId, new mongoose.Types.ObjectId(albumId), req.file)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.delete('/delete/:id', async (req: Request, res: Response) => {
    /*
    Delete album  
    TODO: USER SECURITY CHECK
    */
   const albumId = req.params.id 
   const albumServiceInstance = Container.get(AlbumService)
   const authServiceInstance = Container.get(AuthService)
   try{
    const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
    const userId = await authServiceInstance.getUserId(token)
    const responseData = await albumServiceInstance.deleteAlbum(userId, albumId)
    responseHandle(res, responseData)
   } catch(err){
    errorHandle(res, err.msg, err.code)
   }
    
  })

  route.delete('/delete_track/:id', async (req: Request, res: Response) => {
    /* Delete a song from an album 
    TODO: USER SECURITY CHECK
    */
    const trackId = req.params.id
    const trackServiceInstance = Container.get(TrackService)
    const authServiceInstance = Container.get(AuthService)
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await trackServiceInstance.deleteTrack(userId, trackId)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.post('/add_existing_song/:albumId/:songId', (req: Request, res: Response) => {
    /*  Add an existing song to album 
        TODO: Write this 
    */ 
    try {

    } catch(err) {
      
    }
  })
}