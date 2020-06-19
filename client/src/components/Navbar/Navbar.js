/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import React, { useState } from 'react'
import {
  Collapse,
  InputGroup,
  InputGroupAddon,
  Input,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  Button
} from 'reactstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
// import axios from 'axios'

import './Style/Navbar.css'

const mapStateToProps = state => {
  return { loggedIn: state.loggedIn, scrollDown: state.scrollDown }
}

const WavyNavbar = props => {
  const classes = {
    navbarClass: `navbar ${props.scrollDown ? 'fixed-top' : ''}`,
    navbarBrandClass: props.scrollDown ? 'navbar-logo-on-scroll' : 'navbar-logo',
    navbarColor: props.scrollDown ? '#ffbcff' : 'transparent',
    searchbarClass: props.scrollDown ? 'search-on-scroll' : 'search',
    searchButtonClass: props.scrollDown ? 'search-button-on-scroll' : 'search-button'
  }
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)
  const { navbarClass, navbarBrandClass, navbarColor, searchbarClass, searchButtonClass } = classes
  console.log('SEARCHBARRRRRRRRR', searchbarClass)
  return (
    <div>
      <Navbar style={{ background: navbarColor }} className={navbarClass} expand='md'>
        <NavbarBrand className={navbarBrandClass} href='/'>
          Wavy
          <span id='separator' />
        </NavbarBrand>
        {props.loggedIn}
        <NavbarToggler className='toggler' onClick={toggle}>
          <svg
            className='mobile-navbar'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 12 16'
            width='12'
            height='16'
          >
            <path
              fill-rule='evenodd'
              d='M11.41 9H.59C0 9 0 8.59 0 8c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zm0-4H.59C0 5 0 4.59 0 4c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zM.59 11H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1H.59C0 13 0 12.59 0 12c0-.59 0-1 .59-1z'
            />
          </svg>
        </NavbarToggler>
        <Collapse isOpen={isOpen} navbar>
          {props.loggedIn ? (
            <div>
              <Nav className='nav-center-items'>
                <NavItem id='item-center'>
                  <InputGroup>
                    <Input className={searchbarClass} placeholder='Search...' />
                    <InputGroupAddon addonType='append'>
                      <Button className={searchButtonClass}>
                        <svg
                          class='bi bi-search'
                          width='1em'
                          height='1em'
                          viewBox='0 0 16 16'
                          fill='currentColor'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            fill-rule='evenodd'
                            d='M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z'
                          />
                          <path
                            fill-rule='evenodd'
                            d='M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z'
                          />
                        </svg>
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </NavItem>
                <NavItem id='item-center'>
                  <Link className='my-profile'>
                    <img className='avatar' src='https://picsum.photos/300/200' />
                  </Link>
                </NavItem>
                <NavItem id='item-center'>
                  <Link id='logged-in-link'>Feed</Link>
                </NavItem>
                <NavItem id='item-center'>
                  <Link id='logged-in-link'>Explore</Link>
                </NavItem>
                <NavItem id='item-center'>
                  <Link to='/shop' id='logged-in-link'>
                    Buy
                  </Link>
                </NavItem>
                <NavItem id='item-center'>
                  <Link id='logged-in-link'>Create</Link>
                </NavItem>
              </Nav>
              <Nav className='nav-end-items'>
                <NavItem>
                  <Button className='options-button'>
                    <svg class='bi bi-chevron-compact-down' width='1em' height='1em' viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
                      <path fill-rule='evenodd' d='M1.553 6.776a.5.5 0 0 1 .67-.223L8 9.44l5.776-2.888a.5.5 0 1 1 .448.894l-6 3a.5.5 0 0 1-.448 0l-6-3a.5.5 0 0 1-.223-.67z' />
                    </svg>
                  </Button>
                </NavItem>
              </Nav>
            </div>
          ) : (
            <Nav className='auth-buttons'>
              <NavItem>
                <Link id='auth-link'>
                  <Button id='auth-button'>Login</Button>
                </Link>
              </NavItem>
              <NavItem>
                <Link id='auth-link'>
                  <Button id='auth-button'>Signup</Button>
                </Link>
              </NavItem>
            </Nav>
          )}
        </Collapse>
      </Navbar>
    </div>
  )
}

export default connect(mapStateToProps)(WavyNavbar)
