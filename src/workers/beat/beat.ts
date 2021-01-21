/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */

import config from '../../config'
import { Container } from 'typedi'
import BeatService from '../../services/beat'
import TrackService from '../../services/track'
import { consumeFromQueue } from '../../services/mq'
var amqp = require('amqplib/callback_api')

export const runUploadConsumer = async () => {
  return new Promise( async (resolve, reject) => {
    try { 
      await consumeFromQueue(config.queues.beat.upload, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
        const beatServiceInstance = Container.get(BeatService)
        const successMessage = await beatServiceInstance.uploadBeat(parameters.userId, parameters.beatObject, parameters.trackFiles, parameters.coverFile)
        console.log('Success Message:', successMessage)
        resolve(successMessage)
        ch.ack(msg)
      })
    } catch (err) {
      reject(err.message || err.msg)
    }
  })
}

export const runAddNewTracksConsumer = async () => {
  return new Promise( async (resolve, reject) => {
    try { 
      await consumeFromQueue(config.queues.beat.addNewTracks, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
          console.log('parameters :', parameters)
          const beatServiceInstance = Container.get(BeatService)
          const successMessage = await beatServiceInstance.addTracksToExistingBeat(parameters.userId, parameters.beatId, parameters.trackObjects, parameters.trackFiles)
          console.log('Success Message:', successMessage)
          resolve(successMessage)
          ch.ack(msg)
      })
    } catch (err) {
      reject(err.message || err.msg)
    }
  })
} 

export const runEditCoverConsumer = async () => {
  return new Promise( async (resolve, reject) => {
    try { 
      await consumeFromQueue(config.queues.beat.editCover, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
        console.log('parameters :', parameters)
        const beatServiceInstance = Container.get(BeatService)
        const successMessage = await beatServiceInstance.editBeatCover(parameters.userId, parameters.beatId, parameters.coverFile)
        console.log('Success Message:', successMessage)
        resolve(successMessage)
        ch.ack(msg)
      })
    } catch (err) {
      reject(err.message || err.msg)
    }
  })
}

export const runDeleteBeatConsumer = async () => {
  return new Promise( async (resolve, reject) => {
    try { 
      await consumeFromQueue(config.queues.beat.delete, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
        console.log('parameters :', parameters)
        const beatServiceInstance = Container.get(BeatService)
        const successMessage = await beatServiceInstance.deleteBeat(parameters.userId, parameters.beatId)
        console.log('Success Message:', successMessage)
        resolve(successMessage)
        ch.ack(msg)  
      })
    } catch (err) {
      reject(err.message || err.msg)
    }
  })
}

export const runDeleteTrackConsumer = async () => {
  return new Promise( async (resolve, reject) => {
    try { 
      await consumeFromQueue(config.queues.beat.deleteTrack, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
        console.log('parameters :', parameters)
        const trackServiceInstance = Container.get(TrackService)
        const successMessage = await trackServiceInstance.deleteTrack(parameters.userId, parameters.trackId)
        console.log('Success Message:', successMessage)
        resolve(successMessage)
        ch.ack(msg)
      })
    } catch (err) {
      reject(err.message || err.msg)
    }
  })
}
