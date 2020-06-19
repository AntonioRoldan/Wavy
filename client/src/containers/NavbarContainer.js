/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import React, { useState, useCallback, useEffect, useRef, Component } from 'react'
import WavyNavbar from '../components/Navbar/Navbar'
import { setScrollDown, setLoggedIn, clearStorage } from '../redux/actions'
import { connect } from 'react-redux'
import { useWindowEvent } from '../Helper/useWindowEvent'
import { Link } from 'react-router-dom'
import axios from 'axios'
import cookies from '../cookies'

const mapDispatchToProps = dispatch => {
  return {
    setScrollDown: scrollingLock => {
      dispatch(setScrollDown(scrollingLock))
    },
    setLoggedIn: loggedIn => {
      dispatch(setLoggedIn(loggedIn))
    },
    clearStorage: () => {
      dispatch(clearStorage())
    }
  }
}

const NavbarContainer = props => {
  const [scrollingLock, setScrollingLock] = useState(false)
  const handleScroll = () => {
    const scroll = window.scrollY
    if (scroll >= 600) {
      setScrollingLock(true)
      props.setScrollDown(scrollingLock)
    } else {
      setScrollingLock(false)
      props.setScrollDown(scrollingLock)
    }
  }
  props.setLoggedIn(true)
  useWindowEvent('scroll', handleScroll)
  return (
    <WavyNavbar />
  )
}

export default connect(null,
  mapDispatchToProps
)(NavbarContainer)
