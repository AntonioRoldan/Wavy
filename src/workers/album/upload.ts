/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/
import config from '../../config'
import { Container } from 'typedi'
import AlbumService from '../../services/album'
var amqp = require('amqplib/callback_api')

export const runUploadConsumer = () => {
  return new Promise((resolve, reject) => {
    amqp.connect(config.amqpURL, (err: any, conn : any) => {
      if (err) throw new Error('Album upload, message queue failure')
      conn.createChannel((err: any, ch: any) => {
        try { 
          if (err) throw new Error('Album upload, message queue failure')
          ch.consume('upload-album', async (msg: any) => {
            // Messaged is an object inside an array, hence why we are indexing it at 0
            try { 
              const parameters = JSON.parse(msg.content)
              console.log('parameters :', parameters)
              const albumServiceInstance = Container.get(AlbumService)
              const successMessage = await albumServiceInstance.uploadAlbum(parameters.userId, parameters.albumObject, parameters.trackFiles, parameters.coverFile)
              ch.ack(successMessage)
              resolve(successMessage + '\n' + 'From album upload worker' + '\n' + '##############################' + '\n')
            } catch(err) {
              reject(err.message || err.msg)
            }
          }, {noAck: false})
        } catch (err) {
          resolve(err.message || err.msg)
        }
      })
    })
  })
}
