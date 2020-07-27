/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import { Container } from 'typedi'
import { Request, Response, Router } from 'express'
import PlaylistService from '../../services/playlist'
import AuthService from '../../services/authentication/auth'

export const route = Router()

const errorHandle = (res: Response, errorMessage: string, code: number): void => {
  errorMessage = errorMessage || 'Unknown error'
  code = code || 500

  res.status(code).send(errorMessage)
}

const responseHandle = (res: Response, data: any, code: number = 200): void => {
  res.status(code).send(data)
}

export default (app: Router) => {
  app.use('/playlists', route)

  route.post('/create/:name', async (req: Request, res: Response) => {
    const name = req.params.name 
    const playlistServiceInstance = Container.get(PlaylistService)
    const authServiceInstance = Container.get(AuthService)
    const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
    const userId = await authServiceInstance.getUserId(token)
    try {
      const responseData = await playlistServiceInstance.createPlaylist(userId, name)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.post('/add_album/:playlist_id/:album_id', async (req:Request, res:Response) => {
    const playlistId = req.params.playlist_id
    const albumId = req.params.album_id
    const playlistServiceInstance = Container.get(PlaylistService)
    const authServiceInstance = Container.get(AuthService)
    const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
    const userId = await authServiceInstance.getUserId(token)
    try {
      const responseData = await playlistServiceInstance.addAlbumToPlaylist(userId, playlistId, albumId)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.post('/add_song/:playlist_id/:song_id', async (req: Request, res: Response) => {
    const playlistId = req.params.playlist_id
    const songId = req.params.song_id
    const playlistServiceInstance = Container.get(PlaylistService)
    const authServiceInstance = Container.get(AuthService)
    const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
    const userId = await authServiceInstance.getUserId(token)
    try {

    } catch(err) {
      
    }
  })

  route.get('/search', async (req: Request, res: Response) => {
    const searchTerm = req.query.term as string || ''
    const playlistServiceInstance = Container.get(PlaylistService)
    try {
      const responseData = await playlistServiceInstance.searchPlaylist(searchTerm)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.get('/show/:playlist_id', async (req: Request, res: Response) => {
    const playlistId = req.params.playlist_id
    const playlistServiceInstance = Container.get(PlaylistService)
    try {
      const responseData = await playlistServiceInstance.showPlaylistTracks(playlistId)
      responseHandle(res, responseData)
    } catch(err) {
      errorHandle(res, err.msg, err.code)
    }
  })

  route.put('/edit_name', (req: Request, res:Response) => {
    try {

    } catch(err) {
      
    }
  })

  route.delete('/delete', (req: Request, res: Response) => {
    try {

    } catch(err) {
      
    }
  })

  route.delete('/remove_song', (req: Request, res: Response) => {
    try {

    } catch(err) {
      
    }
  })

}