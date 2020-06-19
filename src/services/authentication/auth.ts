import _ from 'lodash'
import bcrypt from 'bcrypt'
import { Service, Inject } from 'typedi'
import crypto from 'crypto'
import config from '../../config'
import MailService from '../mailer'
import { IUser } from '../../interfaces/IUser'
import ValidationService from './validation'
import { IToken } from '../../interfaces/IToken'
// Debuggin search ...user and this.userModel and this.tokenModel

@Service()
export default class AuthService {
  private jwt = require('jsonwebtoken')

  private randtoken = require('rand-token')

  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('tokenModel') private tokenModel: Models.TokenModel,
    private mailService: MailService,
    private validationService: ValidationService //Import a mailer services here
  ) {}

  private activateAndLoginAccount(token: IToken): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userModel.activateAccount(token.userId)
      .then(user => {
        const userObj = {
          email: user.email,
          password: '',
          username: user.username,
        }
        return this.login(userObj, true)
      })
      .then(tokens => {
        resolve(tokens)
      })
      .catch((err: any) => {
        return reject({ code: 500, msg: err.message })
      })
    })
  }

  private handleTokenDeletion(token: string): Promise<any> {
    const host = 'localhost:3000'
    return new Promise((resolve, reject) => {
      let filter: any = { token: token }
      filter['token'] = token
      this.userModel.findOne(filter, (err, user) => {
        if (err) return reject({ code: 500, msg: err.message || err.msg })
        if (!user) {
          reject({ code: 400, msg: 'Your time to verify the account expired' })
        }
        if (user.activated) {
          reject({ code: 400, msg: 'Account already activated' })
        } else {
          this.createVerificationToken(user, token, host, true)
            .then(data => {
              return reject({
                code: 400,
                msg: 'Your token expired, a new token was sent, check your email',
              })
            })
            .catch(err => {
              reject({ code: 500, msg: err.message })
            })
        }
      })
    })
  }
  

  public checkToken(token: string): Promise<any> { // We check the token when user clicks on verify link
    return new Promise((resolve, reject) => {
      let filter: any = { token: token }
      this.tokenModel.findOneAndRemove(filter, async (err, checkToken) => {
        if (err) return reject({ code: 500, msg: 'Unable to connect to the database' })
        if (checkToken) {
          try {
            const tokens = await this.activateAndLoginAccount(checkToken)
            resolve(tokens)
          } catch(error) {
            reject(error)
          }
        } else {
            this.handleTokenDeletion(token) // Promise always rejects 
            .catch(error => {reject(error)})
        }
      })
    })
  }

  public logout(refreshToken: string): void | never {
    this.userModel.findOne({ refreshToken: refreshToken }, (err, user) => {
      if (err) throw new Error('Database failure')
      user.refreshToken = '' // We revoke the refresh token
      user.save((err: any) => {
        if (err) throw new Error('Database failure')
      })
    })
  }

  public register(user: object = {}, host: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const token = crypto.randomBytes(16).toString('hex')
      const userObj = {
        username: _.toString(_.get(user, 'username', '')),
        email: _.trim(_.toLower(_.get(user, 'email', ''))),
        password: _.get(user, 'password'),
        confirmPassword: _.get(user, 'confirmPassword', ''),
      }
      this.validationService.userExists(userObj)
      .then(() => {return this.validationService.validate(userObj)})
      .then((user: any) => {return this.userModel.create({ ...user })})
      .then(userData => {
        return this.createVerificationToken(userData, token, host, false)})
      .then(data => resolve(data))
      .catch(err => reject(err))
    })
  }

  public createVerificationToken(
    userData: IUser,
    token: string,
    host: string,
    createNewToken: boolean
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      var newTokenCreated = createNewToken ? true : false
      var newToken: string
      if (createNewToken) { // If we have to renew a token for an unactivated user 
        newToken = crypto.randomBytes(16).toString('hex')
        const filter = { token: token }
        this.userModel.findOne(filter, (user: IUser, err: any) => {
          if (err) return reject({ code: 500, msg: 'Failed to connect to the database' })
          user.token = newToken
          user.save((err: any) => {
            if (err) return reject({ code: 500, msg: 'Failed to connect to the database' })
            resolve()
          })
        })
      }
      this.tokenModel.create({
        userId: userData._id,
        token: createNewToken ? newToken : token})
      .then((tokenData: any) => {
        userData.token = tokenData.token
        userData.save()
        return this.mailService.confirmationEmail(userData, tokenData.token, host, newTokenCreated)})
      .then((data: any) => resolve(data))
      .catch(err => {
        return reject({ code: 500, msg: err.message })
      })
    })
  }

  public refreshToken(refreshToken: string): Promise<any> {
    // This function gets called very hour
    return new Promise((resolve, reject) => {
      const filter = { refreshToken: refreshToken }
      this.userModel.findOne(filter, (err, user) => {
        // We search for a user containing this refresh token
        if (err) reject({ code: 500, msg: 'Failed to connect to database' })
        if (!user) reject({ code: 401, msg: 'Refresh token expired' })
        this.createTokens(user)
          .then(async tokens => {
            user.jwtToken = tokens.jsonwebtoken
              try {
                await user.save()
              } catch(err) {
                reject({code: 500, msg: err.message})
              }
            resolve(tokens)
          })
          .catch(err => {
            reject({ code: 500, msg: err.msg })
          })
      })
    })
  }

  private createTokens(user: IUser): Promise<any> {
    return new Promise((resolve, reject) => {
      const token = this.jwt.sign({ email: user.email }, config.jwtsecret, {
        algorithm: 'HS256',
        expiresIn: 3600, // JWT token expires in one hour
      })
      const refreshToken = this.randtoken.uid(256)
      user.refreshToken = refreshToken // Note we are creating a new refresh token every time the user requests a new JWT token
      user.jwtToken = token
      user.save((err: Error, activatedUser: IUser) => {
        // This is needed for server side rendering
        if (err) reject({ code: 500, msg: 'Failed to store refresh token' })
        resolve({ token: token, refreshToken: refreshToken })
      })
    })
  }

  private checkIfUserExistsAndMatchPasswords(userObj: { email: string, password: string}): Promise<any> {
    return new Promise((resolve, reject) => {
      let filter: { email: string } = { email: userObj.email }
      this.userModel.findOne(filter, (err, user) => {
        if (err) return reject({ code: 404, msg: 'Email does not exist' })
        if (!user)
          return reject({
            code: 400,
            msg: 'Invalid email',
          })
        const encodedPassword: string = user.password
        const passwordIsMatch: boolean = bcrypt.compareSync(userObj.password, encodedPassword)
        if (passwordIsMatch) {
          this.createTokens(user)
            .then(async tokens => {
              resolve(tokens)
            })
            .catch(err => reject(err))
        } else {
          return reject({ code: 400, msg: 'Invalid password' })
        }
      })
    })
  }
  public getUserId(token: string): Promise<any> {
    return new Promise( async (resolve, reject) => {
      try {
        const filter : {jwtToken: string} = {jwtToken: token}
        const user = await this.userModel.findOne(filter)
        resolve(user._id)
      } catch (err) {
        reject({code: 500, msg: err.message})
      }
    })
  }
  public login(
    userObj: { email: string; password: string },
    loginFromVerify: boolean
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let filter: { email: string } = { email: userObj.email }
      if (!loginFromVerify) {
        //If regular login
        try {
          const tokens = await this.checkIfUserExistsAndMatchPasswords(userObj)
          resolve(tokens)          
        } catch (err) {
          reject(err)
        }
      } else {
        //If user has just activated the account by clicking on the verify link
        this.userModel.findOne(filter, (err, user) => {
          if (err) return reject({ code: 404, msg: 'Email does not exist' })
          this.createTokens(user) // We log them in 
            .then( async tokens => {
              resolve(tokens)
            })
            .catch(err => reject(err))
        })
      }
    })
  }
}
