import config from '../../src/config'
import fs from 'fs'
var request = require('supertest')
request = request('http://localhost:8000/')
var path = require('path')

let deleteUserId = '' // This will be the album we upload in the tests which will also be deleted
let searchTerm = 'Su'
let userId = ''
const times = x => f => {
  if (x > 0) {
    f()
    times(x - 1)(f)
  }
}

// or define intermediate functions for reuse
let fourTimes = times(4)

let twice = times(2)

let accessToken = '' // We'll have to change this every hour
let refreshToken = '' // The refresh token lasts for a month

describe('Show a users info', async () => {
  it('should show a users profile info', async () => {
    try {
      const requestInstance = request.get(config.api.profile.root + config.api.profile.showInfo + '/' + userId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('Tracks are being uploaded')
    } catch (err) {
      console.log('Upload tracks route error :', err)
    }
  })
})

describe('Search routes', async () => {
  it('it should search users', async () => {
    try {
      const searchTerm = 'Su'
      const requestInstance = request.get(config.api.profile.root + config.api.profile.search + '/' + '?term=' + searchTerm)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      // expect(res.body.results[0]).toEqual({ id: album._id, cover: , title: "Sup", author: author.username, authorId: author._id})
    } catch (err) {
      console.log('Search users route error :', err)
    }
  })
  it('it should search for users, albums and tracks', async () => {
    try {
      const searchTerm = 'Su'
      const requestInstance = request.get(config.api.profile.root + config.api.profile.generalSearch + '/' + '?term=' + searchTerm)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      // expect(res.body.results[0]).toEqual({ id: album._id, cover: , title: "Sup", author: author.username, authorId: author._id})
    } catch (err) {
      console.log('General search route error :', err)
    }
  })
})
