import { Service, Inject } from 'typedi'
import S3Service from './s3'
import { ObjectId } from 'bson'

@Service()
export default class UserConfigService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    private s3Service: S3Service,
    @Inject('trackModel') private trackModel: Models.TrackModel,
    @Inject('albumModel') private albumModel: Models.AlbumModel
  ) {}

  public editUserInfo(userId: ObjectId, userInfo: any, imageFile: any): Promise<any> {
     /*
      userInfo: {
        description: {data: '', edit: true/false}, 
        twitter: {data: '', edit: true/false},
        instagram: {data: '', edit: true/false},
        facebook: {data: '', edit: true/false},
        editAvatar: true/false 
      } 
      image file 
    */
    return new Promise(async (resolve, reject) => {
      if(userInfo.description.edit) {
        try {
          const user = await this.userModel.findById(userId)
          user.description = userInfo.description.data
          await user.save()
        } catch(err) {
          reject({code: 500, msg: err.message})
        }
      }
      if(userInfo.twitter.edit) {
        try {
          const user = await this.userModel.findById(userId)
          user.twitterLink = userInfo.twitter.data
          await user.save()
        } catch(err) {
          reject({code: 500, msg: err.message})
        }
      }
      if(userInfo.instagram.edit){
        try {
          const user = await this.userModel.findById(userId)
          user.instagramLink = userInfo.instagram.data
          await user.save()
        } catch(err) {
          reject({code: 500, msg: err.message})
        }
      }
      if(userInfo.facebook.edit){
        try {
          const user = await this.userModel.findById(userId)
          user.facebookLink= userInfo.facebook.data
          await user.save()
        } catch(err) {
          reject({code: 500, msg: err.message})
        }
      }
      if(userInfo.editAvatar){
        try {
          const user = await this.userModel.findById(userId)
          if(user.avatarURL) 
          await this.s3Service.uploadProfileImage(userId, imageFile)
        } catch(err) {
          reject(err)
        }
      }
      resolve('User info edited')
    })
  }

}