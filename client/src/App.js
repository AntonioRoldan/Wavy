import React from 'react'
// import axios from 'axios'

import NavBarContainer from './containers/NavbarContainer'
import Landing from './components/Landing/Landing'
import Main from './components/Main/Main'
import Verify from './components/Verify'
import Login from './components/Login'
import Signup from './components/Signup'
import Shop from './components/Shop/Shop'
// import Shit from './components/Shit'
import './App.css'

import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'

//import cookies from './cookies'


const NoMatch = ({ location }) => (
  <div>
    <h3>404 Not Found</h3>
    <p>
      {' '}
      Ooops the path <code>{location.pathname}</code> does not exist
    </p>
  </div>
)

class App extends React.Component {
  state = {

  }

  componentDidMount = () => {
    document.body.style.background = "#1d1c2b"
  }

  render() {
    return (
      <div className="App">
        <Router>
          <NavBarContainer/>
          <div>
            {/* {this.state.header} */}
            <Switch>
              <Route path="/" exact component={props => (<Landing {...props}/>)}/>
              <Route path="/login" exact component={props => ( <Login {...props}/>)}/>
              <Route path="/signup" exact component={props => ( <Signup {...props}/>)}/>
              <Route path="/main" exact render={() => <Main />} />
              {/* <Route path="/album" exact component={() => <Album />} /> */}
              <Route path="/verify"exact component={props => ( <Verify {...props} /> )}/>
              <Route path='/testComponent' exact component={props => (<Shop {...props} />)} />
              <Route path='/shop' exact component={props => (<Shop {...props} />)} />
              <Route component={NoMatch} />
            </Switch>
          </div>
        </Router>
      </div>
    )
  }
}

export default App
