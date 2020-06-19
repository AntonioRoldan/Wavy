import React from 'react'
import { Button } from 'reactstrap'
import { Link } from 'react-router-dom'

import './Style/Pack.css'

const Pack = ({ pack }) => {
  const trackInfo = pack.tracksNumber === 1 ? '1 track' : `${pack.tracksNumber} tracks`
  const trackInfoStyle = {
    position: 'relative',
    color: '#dedee0',
    bottom: '25px',
    fontSize: '15px'
  }
  const priceClass = 'track-price'
  return (
    <div className='card bg-custom-color'>
      <img className='track-image' src={pack.image} />
      <Link className='track-name'>{pack.name}</Link>
      <Link className='artist-name'>{pack.artistName}</Link>
      <div className='containerfluid footer d-flex flex-row justify-content-between'>
        <Button className='buy-button'><span className='button-text'>buy</span></Button>
        <div className='containerfluid track-info d-flex flex-column justify-content-end align-items-end'>
          <p className={priceClass}>{pack.price}</p>
          <p style={trackInfoStyle}>{trackInfo}</p>
        </div>
      </div>
    </div>
  )
}

export default Pack
