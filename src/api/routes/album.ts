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
import AuthService from '../../services/authentication/auth'
import AlbumService from '../../services/album'
import { Container } from 'typedi'
import { publishToQueue } from '../../services/mq'
import events from '../../subscribers/events'
import { EventDispatcher } from 'event-dispatch'
const isAuth = require('../middleware/isAuth')
import { Request, Response, Router } from 'express'
import config from '../../config'

export const route = Router()

const eventDispatcher = new EventDispatcher()

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
  var albumUpload: any = upload.fields([{name: 'tracks', maxCount: 10}, {name: 'cover', maxCount: 1}])
  var tracksToExistingAlbumUpload: any = multer({ dest: config.multerDestinationPath, limits: {fileSize: 5120 * 5120}, fileFilter: addTracksToExistingAlbumFilter}).array('tracks', 10)
  var editCoverUpload: any = multer({dest: config.multerDestinationPath, limits: { fieldSize: 8 * 1024 * 1024 }}).single('cover')
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
    
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] }
      if(!files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
      console.log('files :', files)
      const albumObject = JSON.parse(req.body.album)
      if(files['tracks'].length != albumObject.tracks.length) 
      { errorHandle(res, 'Length of uploaded tracks and uploaded files not matching', 400) }
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      publishToQueue(config.queues.album.upload, JSON.stringify({userId, albumObject, trackFiles: files['tracks'], coverFile: files['cover'][0]}))
      .then(() => {
        eventDispatcher.dispatch(events.album.upload) // We run the queue's worker 
        responseHandle(res, 'Album is uploading')
      }).catch((err) => {
        errorHandle(res, err.msg || err.message, err.code)
      })
    } catch(err){
      errorHandle(res, err.msg || err.message, err.code)
    }
  })

  route.post('/add_new_tracks/:albumId', tracksToExistingAlbumUpload, async (req: Request, res: Response) => {
    /* 
    req.body.tracks = {tracks: [{
    "title": , "inspiredArtists": ["", ""], "genres": [], "isPremium": false
    , "hasImage": false}]} 
    req.files = {tracks: []}
    */
    // TODO: USER SECURITY CHECK

    
    try {
      const files = req.files as Express.Multer.File[]
      if(files) errorHandle(res, 'No files uploaded or invalid file format, check your image or audio file format', 400)
      const authServiceInstance = Container.get(AuthService)
      const trackObjects = JSON.parse(req.body.tracks)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      if(files.length != trackObjects.tracks.length) 
      { errorHandle(res, 'Length of uploaded tracks and uploaded files not matching', 400) }
      publishToQueue(config.queues.album.addNewTracks, JSON.stringify({userId, albumId: req.params.albumId, trackObjects, trackFiles: files}))
      .then(() => {
        eventDispatcher.dispatch(events.album.addNewTracks) // We run the queue's worker 
        responseHandle(res, 'New tracks being added to album')
      })
      .catch((err) => {
        errorHandle(res, err.msg || err.message, err.code)
      })
    } catch(err){
      errorHandle(res, err.msg || err.message, err.code)
    }
  })

  route.get('/show/:id', async (req: Request, res: Response) => {
    /* 
      response 
      {tracks: [{title: track.title, audio: track.trackUrl, isPremium: track.isPremium, id: track._id}], 
      album: {title: albumDocument.title, author: author.username, cover: albumDocument.coverUrl, id: album._id} 
      } 
    */
    try {
      const albumId = req.params.id
      const albumServiceInstance = Container.get(AlbumService)
      const albumData = await albumServiceInstance.getAlbumTracks(albumId)
      responseHandle(res, albumData)
    } catch(err) {
      errorHandle(res, err.msg || err.message, err.code)
    }
  })

  route.put('/edit_name/:id/:name', async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
    // response: new album name 
    try {
      const albumId = req.params.id 
      const albumName = req.params.name
      const albumServiceInstance = Container.get(AlbumService)
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      const responseData = await albumServiceInstance.editAlbumName(userId, albumId, albumName)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg || err.message, err.code)
    }
  })

  route.get('/search', async (req: Request, res: Response) => {
    // /search?term=value 
    // Response [{ id: album._id, cover: album.coverUrl, title: album.title, author: author.username, authorId: author._id}]
    try {
      const searchTerm = req.query.term as string
      const albumServiceInstance = Container.get(AlbumService)
      const responseData = await albumServiceInstance.searchAlbum(searchTerm)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg || err.message, err.code)
    }
  })

  route.get('/user_albums/:userId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId
      const albumServiceInstance = Container.get(AlbumService)
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const loggedInUserId = await authServiceInstance.getUserId(token)
      const responseData = await albumServiceInstance.getUserAlbums(userId, loggedInUserId)
      responseHandle(res, responseData)
    } catch (err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.put('/edit_cover/:albumId', editCoverUpload, async (req: Request, res: Response) => {
    // TODO: USER SECURITY CHECK
     try {
      const albumId = req.params.albumId 
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      publishToQueue(config.queues.album.editCover, JSON.stringify({userId, albumId, coverFile: req.file}))
      .then(() => {
        eventDispatcher.dispatch(events.album.editCover)
        responseHandle(res, 'Editing album cover')
      })
      .catch((err) => {
        errorHandle(res, err.msg || err.message, err.code)
      })
    } catch(err) {
      errorHandle(res, err.msg || err.message, err.code)
    }
  })

  route.delete('/delete/:id', async (req: Request, res: Response) => {
    /*
    Delete album  
    TODO: USER SECURITY CHECK
    */
   
   try {
    const albumId = req.params.id 
    const authServiceInstance = Container.get(AuthService)
    const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
    const userId = await authServiceInstance.getUserId(token)
    publishToQueue(config.queues.album.delete, JSON.stringify({userId, albumId}))
    .then(() => {
      eventDispatcher.dispatch(events.album.delete)
      responseHandle(res, 'Album being deleted')
    })
    .catch((err) => {
      errorHandle(res, err.msg || err.message, err.code)
    })
   } catch(err){
    errorHandle(res, err.msg, err.code)
   }
  })

  route.delete('/delete_track/:trackId', async (req: Request, res: Response) => {
    /* Delete a song from an album 
    TODO: USER SECURITY CHECK
    */
    try {
      const trackId = req.params.id
      const authServiceInstance = Container.get(AuthService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token)
      publishToQueue(config.queues.album.deleteTrack, JSON.stringify({userId, trackId}))
      .then(() => {
        eventDispatcher.dispatch(events.album.deleteTrack)
        responseHandle(res, 'Deleting track from album')
      })
      .catch((err) => {
        errorHandle(res, err.msg || err.message, err.code)
      })
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