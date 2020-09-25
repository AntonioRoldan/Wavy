/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

/*
These routes allow the user to change his profile info, 
unfollow users, follow them and exchange messages 
*/ 
import multer from 'multer'
import AuthService from '../../services/authentication/auth'
import UserService from '../../services/profile'
import { Container } from 'typedi'
import config from '../../config'
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

export default (app: Router) => {
  route.use(isAuth)
  app.use('/profile', route)
  var editProfileUpload: any = multer({dest: config.multerDestinationPath, limits: { fieldSize: 8 * 1024 * 1024 }}).single('avatar')
  route.post('/edit', editProfileUpload, 
  async (req: Request, res: Response) => {
    /*
      {
      req.body: {"description": {"data":"" , "edit": true}, 
      "twitter": {"data":"" , "edit": false},
      "instagram": {"data": "lalala", "edit": true},
      "facebook": {"data": "lala", "edit": true},
      "editAvatar": true
      } 
      req.file 
    */
    try {
      const authServiceInstance = Container.get(AuthService)
      const profileServiceInstance = Container.get(UserService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const options = JSON.parse(req.body.options)
      const userId = await authServiceInstance.getUserId(token) // We pass this token parameter in our isAuth middleware
      console.log('userId :', userId)
      const data = await profileServiceInstance.editUserInfo(userId, options, req.file)
      console.log('data :', data)
      responseHandle(res, data)
    } catch (err) {
      errorHandle(res, err.msg, err.code)
    }
  })
  route.get('/show_user_info/:userId', async (req: Request, res: Response) => {
    /* 
    {avatar: "", username: "", email: "", id: "", followeeCount: 0, followerCount: 0, albumsCount: 0, beatsCount: 0, tracksCount: 0, 
    tracks: [{title: track.title, author: track.authorName, image: track.imageUrl, audio: track.trackUrl, type: track.type, canEdit: userId === loggedInUserId}],
    beats: [{ id: beat._id,  undercover: beat.coverUrl, title: beat.title, author: author.username,  subDiscount: subDiscount, normalDiscount: normalDiscount, canEdit: userId === loggedInUserId}], 
    albums: [{ id: album._id,  cover: album.coverUrl, title: album.title, author: author.username, canEdit: userId === loggedInUserId}], 
    followers: [array of id's ]
    following: [array of id's]
    }
    */
    try {
      const authServiceInstance = Container.get(AuthService)
      const profileServiceInstance = Container.get(UserService)
      const token = (req.headers['x-access-token'] || req.headers['authorization']) as string
      const userId = await authServiceInstance.getUserId(token) // We pass this token parameter in our isAuth middleware
      const userInfo = await profileServiceInstance.showUserInfo(req.params.userId, userId) // We pass profile id and logged in user id 
      responseHandle(res, userInfo)
    } catch(err){
      errorHandle(res, err.msg, err.code)
    }
  })
}