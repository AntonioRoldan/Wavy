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

  })
  it('should edit an albums name', async () => {

  })
  it('should add new tracks to an album', async () => {
    const albumId = '5f57dc34d2c5bdc29ed3d19b'
    const audioFile = fs.createReadStream(path.join('Users', 'Antonio', 'Musicly-TS', 'tests', 'testfiles', 'rememberme.mp3'))
    const requestInstance = request.post(config.api.album.root + config.api.album.addNewTracks + '/' + albumId)
    requestInstance.field('tracks', '{"tracks": [{"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}, {"title": "Sup boy" , "inspiredArtists": ["Montana", "Hannah"], "genres": ["trap"], "isPremium":  false}]}')
    twice(() => { requestInstance.attach('files', audioFile) })
    const res = await requestInstance
    expect(res.text).toEqual('New tracks being added to album')
  })
  it('should edit the cover of an album', async () => {
    const albumId = '5f57dc34d2c5bdc29ed3d19b'

  })
  it('should delete an album', async () => {

  })
  it('should delete an album track', async () => {

  })
  it('should search for albums matching our search term', async () => {
    
  })
})
