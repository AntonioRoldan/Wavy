import config from '../../src/config'
var request = require('supertest')
request = request('http://localhost:8000/')

// To run tests individually type the following command jest -t '<describeString> <itString>'
/// ///////// Playlist routes //////////

// We should have two albums in the database
let albumId = '5f57dc34d2c5bdc29ed3d19b' // This playlist will always be the same 
let songId = ''
let accessToken = '' // We'll have to change this every hour
let refreshToken = '' // The refresh token lasts for a month
let playlistId = ''
let deletePlaylistId = '' // This will be the playlist we upload in the tests which will also be deleted
let userId = ''

describe('Playlist post routes', () => {
  it('should create a playlist', async () => {
    try {
      // First we fill an array with the audio files
      // And we get the cover file
      const requestInstance = request.post(config.api.playlist.root + config.api.playlist.create)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.send({})
      const res = await requestInstance
      deletePlaylistId = res.body._id // This line should work
      expect(res.body).toEqual({
        name: 'New playlist',
        images: [],
        author: {
          name: 'Username',
          id: userId
        },
        tracks: []
      })
    } catch (err) {
      console.log('Create playlist route error :', err)
    }
  })
  it('should add a song to a playlist', async () => {
    try {
      const requestInstance = request.post(config.api.playlist.root + config.api.playlist.addSong + '/' + songId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.send({})
      const res = await requestInstance
      expect(res.text).toEqual('Song was added to playlist New playlist')
    } catch (err) {
      console.log('Add song to playlist route error :', err)
    }
  })
  it('should add an album to a playlist', async () => {
    try {
      const requestInstance = request.post(config.api.playlist.root + config.api.playlist.addAlbum + '/' + albumId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.send({})
      const res = await requestInstance
      expect(res.text).toEqual('Album added to playlist')
    } catch (err) {
      console.log('Add album to playlist route error :', err)
    }
  })
})

describe('Playlist put routes', async () => {
  it('should edit a playlists name', async () => {
    try {
      const requestInstance = request.put(config.api.playlist.root + config.api.playlist.editName + '/' + playlistId + '/' + 'LALALA')
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      requestInstance.send({})
      const res = await requestInstance
      expect(res.text).toEqual('LALALA')
    } catch (err) {
      console.log('Edit albums name route error :', err)
    }
  })
})

describe('Playlist get routes', async () => {
  it('should show a playlist', async () => {
    try {
      const requestInstance = request.get(config.api.playlist.root + config.api.playlist.show + '/' + playlistId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.body).toEqual({})
    } catch (err) {
      console.log('Show playlist route error :', err)
    }
  })

  it('should search for playlists matching our search term', async () => {
    try {
      const searchTerm = 'Su'
      const requestInstance = request.get(config.api.playlist.root + config.api.playlist.search + '/' + searchTerm)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.body.results[0]).toEqual({})
    } catch (err) {
      console.log('Search playlist route error :', err)
    }
  })
})

describe('Playlist delete routes', async () => {
  it('should delete a playlist', async () => {
    try {
      const requestInstance = request.delete(config.api.playlist.root + config.api.playlist.delete + '/' + deletePlaylistId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('New playlist was deleted')
    } catch (err) {
      console.log('Delete playlist route error :', err)
    }
  })
  it('should remove a song from a playlist', async () => {
    try {
      const requestInstance = request.delete(config.api.playlist.root + config.api.playlist.removeSong + '/' + songId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('Song title removed from playlist')
    } catch (err) {
      console.log('Remove playlist track route error :', err)
    }
  })
})
