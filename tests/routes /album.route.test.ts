import config from '../../src/config'
var request = require('supertest')
request = request('http://localhost:8000/')

/// ///////// Album routes //////////

describe('Album routes', () => {
  it('should upload an album', async () => {
    try {
      // First we fill an array with the audio files
      // And we get the cover file
      const requestInstance = request.post(config.api.album.root + config.api.album.upload)
      requestInstance.field('ablum', 'JSONString for album object')
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

  })
  it('should edit the cover of an album', async () => {

  })
  it('should delete an album', async () => {

  })
  it('should delete an album track', async () => {

  })
  it('should search for albums matching our search term', async () => {
    
  })
})
