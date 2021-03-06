/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import { Service, Inject } from 'typedi'
import _ from 'lodash'
import { randomBytes } from 'crypto'
import argon2 from 'argon2'
const salt = randomBytes(32)
@Service()
export default class ValidationService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel 

  ){}
  public validate = (user: object) => {
    return new Promise(async (resolve, reject) => {
      const validations = {
        username: {
          errorMessage: 'Name is required',
          doValid: () => {
            const name = _.get(user, 'username', '')
            return !!(name && name.length)
          },
        },
        email: {
          errorMessage: 'Email is not valid',
          doValid: () => {
            const email = _.get(user, 'email', '')
            const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return emailRegex.test(email)
          },
        },
        password: {
          errorMessage: 'Password is required and must have more than six characters',
          doValid: () => {
            const password = _.get(user, 'password', '')
            return !!(password && password.length >= 6) //We do this because of type coercion
          },
        },
        confirmPassword: {
          errorMessage: 'Passwords do not match',
          doValid: () => {
            const password = _.get(user, 'password', '')
            const confirmPassword = _.get(user, 'confirmPassword', '')
            return !!(password && confirmPassword && password === confirmPassword)
          },
        },
      }
  
      const errors: string[] = []
      _.each(validations, validation => {
        const isValid = validation.doValid()
        if (!isValid) {
          errors.push(validation.errorMessage)
        }
      })
  
      if (errors.length) {
        const err = _.join(errors, ',')
        console.log('User details are invalid', err)
        return reject({ code: 400, msg: err })
      }
      const plainTextPassword = _.get(user, 'password') 
      const hashedPassword = await argon2.hash(plainTextPassword, {salt})
      _.set(user, 'password', hashedPassword)
      resolve(user)
    })
  }
  
  public userExists = (userObj: { email: string; username: string }) => {
    return new Promise((resolve, reject) => {
      let filter: any = {}
      filter.email = userObj.email
      this.userModel.findOne(filter, (err, user) => { //USERMODEL TEST 
        if (err) return reject({ code: 500, msg: 'Failed to connect to database' })
        if (!user) {
          return resolve()
        } else {
          return reject({ code: 400, msg: 'Email taken' })
        }
      })
    })
  }
}

