import mongoose, { Schema } from 'mongoose'
import { IUser } from '../../interfaces/IUser'
import _ from 'lodash'
import moment from 'moment'

module.exports = function(userSchema: mongoose.Schema) {
  userSchema.statics.activateAccount = (id: Schema.Types.ObjectId): Promise<IUser> => {
    return new Promise((resolve, reject) => {
      mongoose.model('User').findById(id, (err, user: IUser) => {
        if (err) return reject({ code: 500, msg: 'Failed to connect to the database' })
        user.activated = !user.activated
        user.save((err: Error, activatedUser: IUser ) => {
          if (err) return reject({ code: 500, msg: 'Failed to connect to the database' })
          return resolve(activatedUser)
        })
      })
    })
  }
  
  userSchema.statics.removeUnactivated = () => {
    //If any account has not been activated since more than a day ago delete it
    return new Promise((resolve, reject) => {
      var accountWasdeleted = false
  
      let filter: { activated: boolean } = { activated: false }
  
      mongoose.model('User').find(filter, (err, unactivatedAccounts:any) => {
        if (err) return reject({ code: 500, msg: 'Failed database connection' })
        else if (unactivatedAccounts.length) {
          _.each(unactivatedAccounts, unactivatedAccount => {
            const createdAt = moment(new Date(unactivatedAccount.createdAt).toISOString())
            var now = moment(new Date(Date.now()).toISOString())
            var duration = moment.duration(now.diff(createdAt))
            const expireWindow = duration.asHours()
            if (expireWindow >= 24) {
              accountWasdeleted = true
              mongoose
                .model('User')
                .findByIdAndRemove(unactivatedAccount._id, (err, deletedUser: any) => {
                  if (err) return reject({ code: 500, msg: 'Failed database connection' })
                  console.log(deletedUser.username.toString().concat(' was deleted'))
                })
            }
          })
          if (accountWasdeleted)
            return resolve('Unactivated accounts older than one day have been deleted')
          return resolve('There are no unactivated accounts that are older than one day')
        }
        return resolve('There are no unactivated accounts')
      })
    })
  }
}