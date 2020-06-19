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
import ProfileService from '../../services/profile'
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

export default (app: Router) => {
  route.use(isAuth)
  app.use('/profile', route)
  var editProfileUpload: any = multer({dest: '/temp', limits: { fieldSize: 8 * 1024 * 1024 }}).single('avatar')
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
    const authServiceInstance = Container.get(AuthService)
    const profileServiceInstance = Container.get(ProfileService)
    try {
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

}