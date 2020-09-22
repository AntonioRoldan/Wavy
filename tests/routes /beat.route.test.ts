import config from '../../src/config'
var request = require('supertest')
request = request('http://localhost:8000/')

/// ///////// Album routes //////////

describe('Beat routes', () => {
  it('should upload an album', async () => {
    try {
      // First we fill an array with the audio files
      // And we get the cover file
      const requestInstance = request.post(config.api.beat.root + config.api.beat.upload)
      requestInstance.field('ablum', 'JSONString for album object')
      // .attach('arrayname', file)
      // .attach('cover', cover file))
      const res = await requestInstance
      expect(res.text).toEqual('Album is uploading')
    } catch (err) {
      console.log('Upload album route error :', err)
    }
  })
  it('should show a beat', async () => {

  })
  it('should edit a beats name', async () => {

  })
  it('should add new tracks to a beat', async () => {

  })
  it('should edit the cover of a beat', async () => {

  })
  it('should delete a beat', async () => {

  })
  it('should delete a beat track', async () => {

  })
  it('should search for beats matching our search term', async () => {
    
  })
})
