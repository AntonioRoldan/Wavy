import config from '../../src/config'
import fs from 'fs'
var request = require('supertest')
request = request('http://localhost:8000/')
var path = require('path')

/// ///////// Album routes //////////
const times = x => f => {
  if (x > 0) {
    f()
    times(x - 1)(f)
  }
}

// or define intermediate functions for reuse
let fourTimes = times(4)

let twice = times(2)

let albumId = '5f57dc34d2c5bdc29ed3d19b'

let trackId = ''
describe('Album routes', () => {
  it('should upload an album', async () => {
    try {
      // First we fill an array with the audio files
      // And we get the cover file
      const audioFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'rememberme.mp3'))
      const coverFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'Airbnbplaya2.jpg'))
      const requestInstance = request.post(config.api.album.root + config.api.album.upload)
      requestInstance.field('album', '{"title": "Sup", "isPremium": false, "tracks": [{"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}]}')
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
  it('should show an album', async () => {
    try {

    } catch (err) {
      console.log('Show album route error :', err)
    }
  })
  it('should edit an albums name', async () => {
    try {
      const requestInstance = request.put(config.api.album.root + config.api.album.editName + '/' + albumId + '/' + 'LALALA')
      const res = await requestInstance
      expect(res.text).toEqual('LALALA')
    } catch (err) {
      console.log('Edit albums name route error :', err)
    }
  })
  it('should add new tracks to an album', async () => {
    try {
      const audioFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'rememberme.mp3'))
      const requestInstance = request.post(config.api.album.root + config.api.album.addNewTracks + '/' + albumId)
      requestInstance.field('tracks', '{"tracks": [{"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}]}')
      twice(() => { requestInstance.attach('files', audioFile) })
      const res = await requestInstance
      expect(res.text).toEqual('New tracks being added to album')
    } catch (err) {
      console.log('Add new tracks to album route error :', err)
    }
  })
  it('should edit the cover of an album', async () => {
    try {
      const coverFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'Airbnbplaya2.jpg'))
      const requestInstance = request.put(config.api.album.root + config.api.album.editCover + '/' + albumId)
      requestInstance.attach('file', coverFile)
      const res = await requestInstance
      expect(res.text).toEqual('Editing album cover')
    } catch (err) {
      console.log('Edit album cover route error :', err)
    }
  })
  it('should delete an album', async () => {
    try {
      const requestInstance = request.delete(config.api.album.root + config.api.album.delete + '/' + albumId)
      const res = await requestInstance
      expect(res.text).toEqual('Album being deleted')
    } catch (err) {
      console.log('Delete album route error :', err)
    }
  })
  it('should delete an album track', async () => {
    try {
      const requestInstance = request.delete(config.api.album.root + config.api.album.deleteTrack + '/' + trackId)
      const res = await requestInstance
      expect(res.text).toEqual('Deleting track for album')
    } catch (err) {
      console.log('Delete album track route error :', err)
    }
  })
  it('should search for albums matching our search term', async () => {
    try {

    } catch (err) {
      console.log('Search album route error :', err)
    }
  })
})
