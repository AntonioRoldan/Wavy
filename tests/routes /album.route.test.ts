import config from '../../src/config'
import fs from 'fs'
var request = require('supertest')
request = request('http://localhost:8000/')
var path = require('path')

// To run tests individually type the following command jest -t '<describeString> <itString>'
/// ///////// Album routes //////////
const times = x => f => {
  if (x > 0) {
    f()
    times(x - 1)(f)
  }
}

// In order to test we will upload two albums, on for the show routes another one for delete
// We will have to check the database everytime we run the tests to get the delete id which must be the one from the album added with the tests
// Routes for which we have to check the output JSON object that we will get:
// Show
// Search
// Users albums

let fourTimes = times(4)

let twice = times(2)
// We should have two albums in the database
let albumId = '5f57dc34d2c5bdc29ed3d19b' // This album will always be the same
let deleteAlbumId = '' // This will be the album we upload in the tests which will also be deleted
let trackId = ''
let accessToken = '' // We'll have to change this every hour
let refreshToken = '' // The refresh token lasts for a month
let userId = ''
describe('Album post routes', () => {
  it('should upload an album', async () => {
    try {
      // First we fill an array with the audio files
      // And we get the cover file
      const audioFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'rememberme.mp3'))
      const coverFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'Airbnbplaya2.jpg'))
      const requestInstance = request.post(config.api.album.root + config.api.album.upload)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.field('album', '{"title": "Sup boy", "isPremium": false, "tracks": [{"title": "Track 1" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}, {"title": "Track 2" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}, {"title": "Track 3" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}, {"title": "Track 4" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}]}')
      fourTimes(() => { requestInstance.attach('tracks', audioFile) })
      requestInstance.attach('cover', coverFile)
      // .attach('arrayname', file)
      // .attach('cover', cover file))
      const res = await requestInstance
      expect(res.text).toEqual('Album is uploading')
    } catch (err) {
      console.log('Upload album route error :', err)
    }
  })
  it('should add new tracks to an album', async () => {
    try {
      const audioFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'rememberme.mp3'))
      const requestInstance = request.post(config.api.album.root + config.api.album.addNewTracks + '/' + albumId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.field('tracks', '{"tracks": [{"title": "New track 1" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}, {"title": "New track 2" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}]}')
      twice(() => { requestInstance.attach('files', audioFile) })
      const res = await requestInstance
      expect(res.text).toEqual('New tracks being added to album')
    } catch (err) {
      console.log('Add new tracks to album route error :', err)
    }
  })
})

describe('Album put routes', async () => {
  it('should edit the cover of an album', async () => {
    try {
      // TODO: We should have a different image file to test the cover changed in S3
      const coverFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'Airbnbplaya2.jpg'))
      const requestInstance = request.put(config.api.album.root + config.api.album.editCover + '/' + albumId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.attach('file', coverFile)
      const res = await requestInstance
      expect(res.text).toEqual('Editing album cover')
    } catch (err) {
      console.log('Edit album cover route error :', err)
    }
  })
  it('should edit an albums name', async () => {
    try {
      const requestInstance = request.put(config.api.album.root + config.api.album.editName + '/' + albumId + '/' + 'LALALA')
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('LALALA')
    } catch (err) {
      console.log('Edit albums name route error :', err)
    }
  })
})

describe('Album get routes', async () => {
  it('should show an album', async () => {
    try {
      const requestInstance = request.get(config.api.album.root + config.api.album.show + '/' + albumId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.body).toEqual({
        tracks: [
          { title: 'Track 1', audio: 'TO FILL', isPremium: false, id: 'TO FILL' },
          { title: 'Track 2', audio: 'TO FILL', isPremium: false, id: 'TO FILL' },
          { title: 'Track 3', audio: 'TO FILL', isPremium: false, id: 'TO FILL' },
          { title: 'Track 4', audio: 'TO FILL', isPremium: false, id: 'TO FILL' }
        ],
        album: { title: 'Album 1', authorId: 'TO FILL', author: 'User 2', cover: 'TO FILL', id: 'TO FILL', canEdit: true }
      })
    } catch (err) {
      console.log('Show album route error :', err)
    }
  })
  it('should search for albums matching our search term', async () => {
    try {
      const searchTerm = 'Al'
      const requestInstance = request.get(config.api.album.root + config.api.album.search + '/' + '?term=' + searchTerm)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.body).toEqual([
        { id: 'TO FILL', cover: 'TO FILL', title: 'Album 1', author: 'User 2', authorId: 'TO FILL' }
      ])
    } catch (err) {
      console.log('Search album route error :', err)
    }
  })
  it('should show user albums', async () => {
    try {
      const requestInstance = request.get(config.api.album.root + config.api.album.getUserAlbums + '/' + userId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.body).to.be.an('array')
      expect(res.body).toEqual([
        { id: 'TO FILL', cover: 'TO FILL', title: 'Album 1', author: 'User 2', canEdit: true }
      ])
    } catch (err) {
      console.log('User albums route error :', err)
    }
  })
})

describe('Album delete routes', async () => {
  it('should delete an album', async () => {
    try {
      const requestInstance = request.delete(config.api.album.root + config.api.album.delete + '/' + deleteAlbumId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('Album being deleted')
    } catch (err) {
      console.log('Delete album route error :', err)
    }
  })
  it('should delete an album track', async () => {
    try {
      const requestInstance = request.delete(config.api.album.root + config.api.album.deleteTrack + '/' + trackId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('Deleting track for album')
    } catch (err) {
      console.log('Delete album track route error :', err)
    }
  })
})
