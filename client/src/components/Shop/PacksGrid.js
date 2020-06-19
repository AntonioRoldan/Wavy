import React, { Component } from 'react'
import { Container, Row, Col } from 'reactstrap'
import Pack from './Pack'

const PacksGrid = () => {
  const clicked = () => {
    console.log('clicked')
  }

  return (
    <div className='container mt-5'>
      <div className='row'>
        {[
          {
            image: 'https://picsum.photos/200/300',
            artistName: 'Yolas',
            name: 'asdfasdf',
            tracksNumber: 1,
            price: '1000$'
          },
          {
            image: 'https://picsum.photos/200/300',
            artistName: 'Yolas',
            name: 'track 4',
            tracksNumber: 3,
            price: '1000$'
          },
          {
            image: 'https://picsum.photos/200/300',
            artistName: 'Yolas',
            name: 'track 9',
            tracksNumber: 1,
            price: '1000$'
          },
          {
            image: 'https://picsum.photos/200/300',
            artistName: 'Yolas',
            name: 'track 2',
            tracksNumber: 4,
            price: '1000$'
          },
          {
            image: 'https://picsum.photos/200/300',
            artistName: 'Yolas',
            name: 'track 4',
            tracksNumber: 7,
            price: '1000$'
          },
          {
            image: 'https://picsum.photos/200/300',
            artistName: 'Yolas',
            name: 'track 2',
            tracksNumber: 1,
            price: '1000$'
          },
          {
            image: 'https://picsum.photos/200/300',
            artistName: 'Yolas',
            name: '1',
            tracksNumber: 1,
            price: '1000$'
          },
          {
            image: 'https://picsum.photos/200/300',
            artistName: 'Yolas',
            name: '1',
            tracksNumber: 1,
            price: '1000$'
          }
        ].map((pack, index) => (
          <div className='col-lg-3 col-sm-4 col-xs-6 col-md-4'>
            <Pack onClick={clicked} key={index} pack={pack} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PacksGrid
