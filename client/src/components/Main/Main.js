/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Box, Grid } from '@material-ui/core'

import './Style/Main.css'
// import { Link } from 'react-router-dom'

const mapStateToProps = state => {
  return { loggedIn: state.loggedIn, isArtist: state.isArtist }
}
const Main = props => {
  const clicked = () => {
    console.log('clicked')
  }

  useEffect(() => {})

  return (
    <div className="main">
      <div className="header">
        <h1 className="headerTitle">Explore</h1>
      </div>
    </div>
  )
}

export default connect(mapStateToProps)(Main)
