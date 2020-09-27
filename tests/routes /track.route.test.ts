import config from '../../src/config'
import fs from 'fs'
var request = require('supertest')
request = request('http://localhost:8000/')
var path = require('path')
request = request('http://localhost:8000/')

let deleteTrackId = '' // This will be the album we upload in the tests which will also be deleted
let trackId = ''
let searchTerm = 'Su'
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

describe('Track post routes', async () => {
  it('should upload a series of single tracks', async () => {
    try {
      const audioFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'rememberme.mp3'))
      const imageFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'Airbnbplaya2.jpg'))
      const requestInstance = request.post(config.api.track.root + config.api.track.upload)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.field('tracks', '{"tracks": [{"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false, "hasImage": false}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false, "hasImage": true}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false, "hasImage": false}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false, "hasImage": true}]}')
      fourTimes(() => { requestInstance.attach('tracks', audioFile) })
      twice(() => requestInstance.attach('images', imageFile))
      const res = await requestInstance
      expect(res.text).toEqual('Tracks are being uploaded')
    } catch (err) {
      console.log('Upload tracks route error :', err)
    }
  })
})

describe('Track get routes', async () => {
  it('should search for a track', async () => {
    try {
      const requestInstance = request.get(config.api.track.root + config.api.track.search + '/' + searchTerm)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
    } catch (err) {
      console.log('Search tracks route error :', err)
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

