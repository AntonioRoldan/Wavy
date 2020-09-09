/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/
import config from '../../config'
import { Container } from 'typedi'
import AlbumService from '../../services/album'
var amqp = require('amqplib/callback_api')

export const runUploadConsumer = async () => {
    amqp.connect(config.amqpURL, (err: any, conn : any) => {
      if (err) throw new Error('Album upload, message queue failure')
      conn.createChannel((err: any, ch: any) => {
        try { 
          if (err) throw new Error('Album upload, message queue failure')
          ch.consume('upload-album', async (msg: any) => {
            // Messaged is an object inside an array, hence why we are indexing it at 0
              const parameters = JSON.parse(msg.content)
              console.log('parameters :', parameters)
              const albumServiceInstance = Container.get(AlbumService)
              const successMessage = await albumServiceInstance.uploadAlbum(parameters.userId, parameters.albumObject, parameters.trackFiles, parameters.coverFile)
              console.log('Success Message:', successMessage)
              ch.ack(msg)
          }, {noAck: false})
        } catch (err) {
          throw new Error(err.message || err.msg)
        }
      })
    })
}

export const runAddNewTracksConsumer = async () => {
  amqp.connect(config.amqpURL, (err: any, conn : any) => {
    if (err) throw new Error('Album upload, message queue failure')
    conn.createChannel((err: any, ch: any) => {
      try { 
        if (err) throw new Error('Album upload, message queue failure')
        ch.consume('upload-album', async (msg: any) => {
          // Messaged is an object inside an array, hence why we are indexing it at 0
            const parameters = JSON.parse(msg.content)
            console.log('parameters :', parameters)
            const albumServiceInstance = Container.get(AlbumService)
            const successMessage = await albumServiceInstance.addTracksToExistingAlbum(parameters.userId, parameters.albumId, parameters.trackObjects, parameters.trackFiles)
            console.log('Success Message:', successMessage)
            ch.ack(msg)
        }, {noAck: false})
      } catch (err) {
        throw new Error(err.message || err.msg)
      }
    })
  })
} 
