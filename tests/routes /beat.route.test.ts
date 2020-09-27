import config from '../../src/config'
import fs from 'fs'
var request = require('supertest')
request = request('http://localhost:8000/')
var path = require('path')

// To run tests individually type the following command jest -t '<describeString> <itString>'
/// ///////// Beat routes //////////

// Credits to stackoverflow for this nice little trick
const times = x => f => {
  if (x > 0) {
    f()
    times(x - 1)(f)
  }
}

let fourTimes = times(4)

let twice = times(2)
// We should have two albums in the database
let beatId = '5f57dc34d2c5bdc29ed3d19b' // This beat will always be the same
let deleteAlbumId = '' // This will be the beat we upload in the tests which will also be deleted
let trackId = '' // Id for a track to be deleted
let accessToken = '' // We'll have to change this every hour
let refreshToken = '' // The refresh token lasts for a month
let userId = ''
describe('Beat post routes', () => {
  it('should upload an beat', async () => {
    try {
      // First we fill an array with the audio files
      // And we get the cover file
      const audioFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'rememberme.mp3'))
      const coverFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'Airbnbplaya2.jpg'))
      const requestInstance = request.post(config.api.beat.root + config.api.beat.upload)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.field('beat', '{"title": "Sup", "price": 234, "tracks": [{"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"]}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"]}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"]}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"]}]}')
      fourTimes(() => { requestInstance.attach('tracks', audioFile) })
      requestInstance.attach('cover', coverFile)
      // .attach('arrayname', file)
      // .attach('cover', cover file))
      const res = await requestInstance
      expect(res.text).toEqual('Beat is uploading')
    } catch (err) {
      console.log('Upload beat route error :', err)
    }
  })
  it('should add new tracks to an beat', async () => {
    try {
      const audioFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'rememberme.mp3'))
      const requestInstance = request.post(config.api.beat.root + config.api.beat.addNewTracks + '/' + beatId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.field('tracks', '{"tracks": [{"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"]}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"]}]}')
      twice(() => { requestInstance.attach('files', audioFile) })
      const res = await requestInstance
      expect(res.text).toEqual('New tracks being added to beat')
    } catch (err) {
      console.log('Add new tracks to beat route error :', err)
    }
  })
})

describe('Beat put routes', async () => {
  it('should edit the cover of a beat', async () => {
    try {
      // TODO: We should have a different image file to test the cover changed in S3
      const coverFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'Airbnbplaya2.jpg'))
      const requestInstance = request.put(config.api.beat.root + config.api.beat.editCover + '/' + beatId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.attach('file', coverFile)
      const res = await requestInstance
      expect(res.text).toEqual('Editing beat cover')
    } catch (err) {
      console.log('Edit beat cover route error :', err)
    }
  })
  it('should edit a beats name', async () => {
    try {
      const requestInstance = request.put(config.api.beat.root + config.api.beat.editName + '/' + beatId + '/' + 'LALALA')
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('LALALA')
    } catch (err) {
      console.log('Edit beats name route error :', err)
    }
  })
})

describe('Beat get routes', async () => {
  // TODO: Upload a beat and then show it to see what the response should look like
  it('should show a beat', async () => {
    try {
      const requestInstance = request.get(config.api.beat.root + config.api.beat.show + '/' + beatId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
    } catch (err) {
      console.log('Show beat route error :', err)
    }
  })
  it('should search for albums matching our search term', async () => {
    try {
      const searchTerm = 'Su'
      const requestInstance = request.get(config.api.beat.root + config.api.beat.search + '/' + searchTerm)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      // expect(res.body.results[0]).toEqual({ id: beat._id, cover: , title: "Sup", author: author.username, authorId: author._id})
    } catch (err) {
      console.log('Search beat route error :', err)
    }
  })
  it('should show user beats', async () => {
    try {
      const requestInstance = request.get(config.api.beat.root + config.api.beat.getUserBeats + '/' + userId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
    } catch (err) {
      console.log('User beats route error :', err)
    }
  })
})

describe('Beat delete routes', async () => {
  it('should delete an beat', async () => {
    try {
      const requestInstance = request.delete(config.api.beat.root + config.api.beat.delete + '/' + deleteAlbumId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('Beat being deleted')
    } catch (err) {
      console.log('Delete beat route error :', err)
    }
  })
  it('should delete an beat track', async () => {
    try {
      const requestInstance = request.delete(config.api.beat.root + config.api.beat.deleteTrack + '/' + trackId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('Deleting track for beat')
    } catch (err) {
      console.log('Delete beat track route error :', err)
    }
  })
})
