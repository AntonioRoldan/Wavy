/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/
import config from '../../config'
import { Container } from 'typedi'
import AlbumService from '../../services/album'
import TrackService from '../../services/track'
import { consumeFromQueue } from '../../services/mq'
var amqp = require('amqplib/callback_api')

export const runUploadConsumer = async () => {
  return new Promise( async (resolve, reject) => {
    try { 
      await consumeFromQueue(config.queues.album.upload, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
        const albumServiceInstance = Container.get(AlbumService)
        const successMessage = await albumServiceInstance.uploadAlbum(parameters.userId, parameters.albumObject, parameters.trackFiles, parameters.coverFile)
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
      await consumeFromQueue(config.queues.album.addNewTracks, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
          console.log('parameters :', parameters)
          const albumServiceInstance = Container.get(AlbumService)
          const successMessage = await albumServiceInstance.addTracksToExistingAlbum(parameters.userId, parameters.albumId, parameters.trackObjects, parameters.trackFiles)
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
      await consumeFromQueue(config.queues.album.editCover, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
        console.log('parameters :', parameters)
        const albumServiceInstance = Container.get(AlbumService)
        const successMessage = await albumServiceInstance.editAlbumCover(parameters.userId, parameters.albumId, parameters.coverFile)
        console.log('Success Message:', successMessage)
        resolve(successMessage)
        ch.ack(msg)
      })
    } catch (err) {
      reject(err.message || err.msg)
    }
  })
}

export const runDeleteAlbumConsumer = async () => {
  return new Promise( async (resolve, reject) => {
    try { 
      await consumeFromQueue(config.queues.album.delete, async (msg: any, ch: any) => {
        const parameters = JSON.parse(msg.content)
        console.log('parameters :', parameters)
        const albumServiceInstance = Container.get(AlbumService)
        const successMessage = await albumServiceInstance.deleteAlbum(parameters.userId, parameters.albumId)
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
      await consumeFromQueue(config.queues.album.deleteTrack, async (msg: any, ch: any) => {
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
