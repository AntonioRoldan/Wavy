import React, { Component, Redirect } from 'react'
import axios from 'axios'

import cookies from '../cookies'

class Verify extends Component {
  state = {
    APIkey: '',
    token: '',
    userHasJustBeenActivated: false,
    newTokenCreated: false,
    userDeleted: false,
    userAlreadyActivated: false,
    errorMessage: '',
    redirect: false,
  }

  componentDidMount = () => {
    console.log('this.props.loggedIn :', this.props.loggedIn)
    if (this.props.loggedIn) {
      return
    } else {
      axios
        .get(`/api/auth/verify${this.props.location.search}`)
        .then(res => {
          const {
            APIkey,
            userHasJustBeenActivated,
            newTokenCreated,
            userDeleted,
            userAlreadyActivated,
          } = res.data
          this.setState(
            {
              APIkey: APIkey,
              userHasJustBeenActivated: userHasJustBeenActivated,
              newTokenCreated: newTokenCreated,
              userDeleted: userDeleted,
              userAlreadyActivated: userAlreadyActivated,
            },
            () => {
              if (APIkey) {
                cookies.setCookie('session', APIkey)
                this.setState({ redirect: true })
                this.props.update(true)
                console.log('this.state :', this.state)
              }
            }
          )
        })
        .catch(err => {
          const { data } = err.response
          this.setState({
            errorMessage: data,
          })
        })
    }
  }

  componentWillMount = () => {
    clearTimeout(this.return)
  }

  returnToMain = () => {
    return <Redirect to="/main"></Redirect>
  }
  render() {
    if (this.state.errorMessage) {
      return (
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{this.state.errorMessage}</p>
        </div>
      )
    }
    return (
      <div className="welcome-message">
        <h3>Welcome to musicly!</h3>
        <p>Congratulations your account has just been started you will be redirected shortly</p>
      </div>
    )
  }
}

export default Verify
