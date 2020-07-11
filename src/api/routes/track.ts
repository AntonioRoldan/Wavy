
/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
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

export default (app: Router) => {
  var upload = multer({ dest: '/temp', limits: {fileSize: 5120 * 5120}, fileFilter: tracksFileFilter})
  var tracksUpload: any = upload.fields([{name: 'tracks', maxCount: 10}, {name: 'images', maxCount: 10}])
  route.use(isAuth)
  app.use('/tracks', route)


  // MARK: Tracks routes 

  route.post('/upload', tracksUpload, async (req: Request, res: Response) => {
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
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    if(files['tracks'].length != trackObjects.tracks.length || files['images'].length != trackObjects.tracks.length) 
    { errorHandle(res, 'Length of uploaded tracks and uploaded files not matching', 400) }
    try {
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const successMessage = await trackService.uploadTracks(userId, trackObjects.tracks, files['tracks'], files['images'])
      responseHandle(res, successMessage)
    } catch(err) {
      errorHandle(res, err.message, err.code)
    }
  })
  // Edit track image 
  route.put('/edit_image/:id', multer({dest: '/temp', limits: { fieldSize: 8 * 1024 * 1024 }}).single('image'), 
  async (req: Request, res: Response) => {
    if(!req.file) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
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

  route.put('/edit_name/:name', (req: Request, res: Response) => {
    try {

    } catch(err){

    }
  })


  route.delete('/delete/:id', (req: Request, res: Response) => {
    // Delete a single track 
    try {

    } catch(err){
      
    }
  })
}