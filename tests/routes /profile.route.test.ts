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

describe('Track get routes', async () => {
  it('should search for a track', async () => {
    try {
      const requestInstance = request.get(config.api.track.root + config.api.track.search + '/' + '?term=' + searchTerm)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
    } catch (err) {
      console.log('Search tracks route error :', err)
    }
  })
  it('should show user tracks', async () => {
    try {
      const requestInstance = request.get(config.api.track.root + config.api.track.getUserTracks + '/' + userId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
    } catch (err) {
      console.log('User tracks route error :', err)
    }
  })
})

describe('Track put routes', async () => {
  it('should edit a tracks cover file', async () => {
    try {
      // TODO: We should have a different image file to test the cover changed in S3 
      const coverFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'Airbnbplaya2.jpg'))
      const requestInstance = request.put(config.api.track.root + config.api.track.editCover + '/' + trackId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.attach('file', coverFile)
      const res = await requestInstance
      expect(res.text).toEqual('Editing album cover')
    } catch (err) {
      console.log('Edit album cover route error :', err)
    }
  })
  it('should edit a tracks name', async () => {
    try {
      const requestInstance = request.put(config.api.track.root + config.api.track.editName + '/' + trackId + '/' + 'LALALA')
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('LALALA')
    } catch (err) {
      console.log('Edit tracks name route error :', err)
    }
  })
})

describe('Track delete routes', async () => {
  it('should delete a track', async () => {
    try {
      const requestInstance = request.delete(config.api.track.root + config.api.track.delete + '/' + deleteTrackId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('Deleting track')
    } catch (err) {
      console.log('Delete album route error :', err)
    }
  })
})

