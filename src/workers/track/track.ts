/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/
import config from '../../config'
import { Container } from 'typedi'
import TrackService from '../../services/track'
import { consumeFromQueue } from '../../services/mq'
var amqp = require('amqplib/callback_api')

export const runUploadConsumer = async () => {
  return new Promise( async (resolve, reject) => {
    try { 
      await consumeFromQueue(config.queues.track.upload, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
        const trackServiceInstance = Container.get(TrackService)
        const successMessage = await trackServiceInstance.uploadTracks(parameters.userId, parameters.trackObjects, parameters.trackFiles, parameters.imageFiles)
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
      await consumeFromQueue(config.queues.track.editCover, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
        console.log('parameters :', parameters)
        const trackServiceInstance = Container.get(TrackService)
        const successMessage = await trackServiceInstance.editTrackImage(parameters.userId, parameters.trackId, parameters.imageFile)
        console.log('Success Message:', successMessage)
        resolve(successMessage)
        ch.ack(msg)
      })
    } catch (err) {
      reject(err.message || err.msg)
    }
  })
}

export const runDeleteConsumer = async () => {
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
