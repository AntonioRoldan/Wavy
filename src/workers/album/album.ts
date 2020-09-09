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
    await consumeFromQueue(config.queues.uploadAlbum, async (msg: any, ch: any) => {
      const parameters = JSON.parse(msg.content)
      const albumServiceInstance = Container.get(AlbumService)
      const successMessage = await albumServiceInstance.uploadAlbum(parameters.userId, parameters.albumObject, parameters.trackFiles, parameters.coverFile)
      console.log('Success Message:', successMessage)
      ch.ack(msg)
    })
}

export const runAddNewTracksConsumer = async () => {
  await consumeFromQueue(config.queues.addNewTracksToAlbum, async (msg: any, ch: any) => {
    const parameters = JSON.parse(msg.content)
      console.log('parameters :', parameters)
      const albumServiceInstance = Container.get(AlbumService)
      const successMessage = await albumServiceInstance.addTracksToExistingAlbum(parameters.userId, parameters.albumId, parameters.trackObjects, parameters.trackFiles)
      console.log('Success Message:', successMessage)
      ch.ack(msg)
  })
} 

export const runEditCoverConsumer = async () => {
  await consumeFromQueue(config.queues.editAlbumCover, async (msg: any, ch: any) => {
    const parameters = JSON.parse(msg.content)
      console.log('parameters :', parameters)
      const albumServiceInstance = Container.get(AlbumService)
      const successMessage = await albumServiceInstance.editAlbumCover(parameters.userId, parameters.albumId, parameters.coverFile)
      console.log('Success Message:', successMessage)
      ch.ack(msg)
  })
}

export const runDeleteAlbumConsumer = async () => {
  await consumeFromQueue(config.queues.deleteAlbum, async (msg: any, ch: any) => {
    const parameters = JSON.parse(msg.content)
    console.log('parameters :', parameters)
    const albumServiceInstance = Container.get(AlbumService)
    const successMessage = await albumServiceInstance.deleteAlbum(parameters.userId, parameters.albumId)
    console.log('Success Message:', successMessage)
    ch.ack(msg)  
  })
}

export const runDeleteAlbumTrackConsumer = async () => {
  await consumeFromQueue(config.queues.deleteAlbumTrack, async (msg: any, ch: any) => {
    const parameters = JSON.parse(msg.content)
    console.log('parameters :', parameters)
    const trackServiceInstance = Container.get(TrackService)
    const successMessage = await trackServiceInstance.deleteTrack(parameters.userId, parameters.trackId)
    console.log('Success Message:', successMessage)
    ch.ack(msg)
  })
}
