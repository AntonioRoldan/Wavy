/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import { Service, Inject } from 'typedi'
import _ from 'lodash'
import { uuid } from 'uuidv4'

@Service()
export default class SessionService {
  constructor (
    @Inject('sessionModel') private sessionModel: Models.SessionModel

  ) {}

  public invalidatePrevSessions(email: string) {
    return new Promise((resolve, reject) => {
      this.sessionModel.deleteMany({ email: email })
      .then(sessions => {
        return resolve()
      })
      .catch(err => {
        return reject({code: 500, msg: err.msg || err.message})
      })
    })
  }

  public invalidateAllSessions(APIkey: string) {
    return new Promise((resolve, reject) => {
      this.sessionModel.findOne({ APIkey: APIkey })
      .then(session => {
        this.invalidatePrevSessions(session.email)
          .then(() => {console.log('session was deleted')})
          .catch(err => {
            reject({code: err.code, msg: err.msg || err.message})
          })
          return resolve('Successful logout')
      })
      .catch(err => {
        reject({code: err.code, msg: err.msg || err.message})
      })
      })
  }

  public newSession(email: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.invalidatePrevSessions(email)
      .then(() => {
        let date = new Date()
        date.setDate(date.getDate() + 1)
        this.sessionModel.create({
          email: email,
          APIkey: uuid().toString(),
          expiry: date
        })
        .then(session => {
          return resolve(session.APIkey)
        })
        .catch(err => {
          console.log('error')
          return reject({code: 500, msg: err.msg || err.message})
        })
      })
      .catch(err => {
        return reject({code: err.code, msg: err.msg || err.message})
      })
    })
  }
  public getSession(session: string) {
    return new Promise((resolve, reject) => {
      this.sessionModel.findOne({APIkey: session})
        .then(session => {
          return resolve(session)
        })
        .catch(err => {
          return reject({code: 500, msg: err.msg || err.message})
        })  
    })
  }
  
}
