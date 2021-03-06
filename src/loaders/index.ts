/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import expressLoader from './express'
import mongooseLoader from './mongoose'
import dependancyInjectorLoader from './dependancyInjector'
//We have to import at least all the events once so they can be triggered
import './events'
export default async ({ expressApp } : {expressApp: Express.Application}) => {
  const mongoConnection = mongooseLoader()
  await expressLoader({ app: expressApp })
  const userModel = {
    name: 'userModel',
    model: require('../models/User').default
  }
  const beatModel = {
    name: 'beatModel',
    model: require('../models/Beat').default
  }
  const tokenModel = {
    name: 'tokenModel',
    model: require('../models/Token').default
  }
  const trackModel = {
    name: 'trackModel',
    model: require('../models/Track').default
  }
  const sessionModel = {
    name: 'sessionModel',
    model: require('../models/Session').default
  }
  const albumModel = {
    name: 'albumModel',
    model: require('../models/Album').default
  }
  const playlistModel = {
    name: 'playlistModel',
    model: require('../models/Playlist').default
  }
  await dependancyInjectorLoader({
    mongoConnection,
    models: [
      userModel,
      beatModel,
      tokenModel,
      trackModel,
      sessionModel,
      albumModel,
      playlistModel
    ]
  })
}
