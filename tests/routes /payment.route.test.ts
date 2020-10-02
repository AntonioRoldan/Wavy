import config from '../../src/config'
import fs from 'fs'
var request = require('supertest')
request = request('http://localhost:8000/')
var path = require('path')

let itemId = ''
const times = x => f => {
  if (x > 0) {
    f()
    times(x - 1)(f)
  }
}

// Show shopping cart
// Remove item from shopping cart 
// Clear shopping cart
// Add item to shopping cart 
let accessToken = '' // We'll have to change this every hour
let refreshToken = '' // The refresh token lasts for a month

describe('Add an item to the shopping cart', async () => {
  it('should show the shopping cart of the logged in user', async () => {
    try {
      const requestInstance = request.get(config.api.payment.root + config.api.payment.addToCart + '/' + itemId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.text).toEqual('Item successfully added to shopping list')
    } catch (err) {
      console.log('Add item to shopping cart route error :', err)
    }
  })
})

describe('Remove from shopping cart and clear', async () => {
  it('should remove an item from the shopping cart', async () => {
    try {
      const requestInstance = request.delete(config.api.payment.root + config.api.payment.removeFromCart + '/' + itemId)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      // expect(res.body.results[0]).toEqual({ id: album._id, cover: , title: "Sup", author: author.username, authorId: author._id})
    } catch (err) {
      console.log('Remove from shopping cart route error :', err)
    }
  })
  it('should clear the shopping cart', async () => {
    try {
      const requestInstance = request.delete(config.api.payment.root + config.api.payment.clearCart)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
      expect(res.body).to.be.an('array')
      expect(res.body).to.have.lengthOf(0)
    } catch (err) {
      console.log('Clear shopping cart route error :', err)
    }
  })
})

describe('show shopping cart', async () => {
  it('should show a shopping cart', async () => {
    try {
      const requestInstance = request.get(config.api.payment.root + config.api.payment.showCart)
      requestInstance.set('x-access-token', accessToken)
      requestInstance.set('Cookie', [`refresh_token=${refreshToken}`])
      const res = await requestInstance
    } catch (err) {
      console.log('Show shopping cart route error :', err)
    }
  })
})
