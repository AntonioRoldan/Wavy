/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import amqp from 'amqplib/callback_api'
import { Error } from 'mongoose';
import config from '../config'

let ch : amqp.Channel = null 

amqp.connect(config.amqpURL, (err, conn) => {
  if (err) { throw new Error(err.message || err.msg) }
  conn.createChannel((err, channel) => {
    if (err) { throw new Error(err.message || err.msg) }
    ch = channel
  })
})

export const publishToQueue = async (queueName: string, data: any) => {
  ch.sendToQueue(queueName, new Buffer(data), {persistent: true})
}

export const consumeFromQueue = async (queueName: string, cb: any) => {
  ch.consume(queueName, async (msg) => {
    cb(msg, ch)
  }, {noAck: false})
}

process.on('exit', (code) => {
  ch.close((err) => {
    if (err) throw new Error(err.message || err.msg) 
  })
  console.log('Closing rabbitmq channel')
})


