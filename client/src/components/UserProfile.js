import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Box, Grid } from '@material-ui/core'
import Track from './Track'
import axios from 'axios'
import './UserProfile.css'
// import { Link } from 'react-router-dom'

const mapStateToProps = state => {
  return { loggedIn: state.loggedIn, isArtist: state.isArtist }
}
const UserProfile = props => {
  const clicked = () => {
    console.log('clicked')
  }

  useEffect(() => {})

  return (
    <div className="main">
      <div className="header">
        <div className="profile">
          <a href="https://placeholder.com">
            <img className="avatarImage" src="https://via.placeholder.com/250" />
          </a>
          <p className='welcomeMessage'>Welcome home</p>
        </div>
      </div>
    </div>
  )
}

export default connect(mapStateToProps)(Main)
