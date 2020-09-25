var request = require('supertest')

request = request('http://localhost:8000/')

let accessToken = '' // We'll have to change this every hour
let refreshToken = '' // The refresh token lasts for a month

describe('Track post routes', async () => {
  it('should upload a series of single tracks', async () => {
    try {
      
    } catch (err) {
      
    }
  })
})

describe('Track get routes', async () => {
  it('should search for a track', async () => {

  })
})

describe('Track put routes', async () => {
  it('should edit a tracks cover file', async () => {

  })
  it('should edit a tracks name', async () => {

  })
})

describe('Track delete routes', async () => {
  it('should delete a track', async () => {

  })
})

