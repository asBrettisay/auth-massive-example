import React, { Component } from 'react'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      user: ''
    }
  }

  componentDidMount() {
    fetch('/api/me', { credentials: 'same-origin' }).then(res => res.json()).then(user => {
      this.setState({user: user.displayName})
    })
  }

  render() {
    const { user } = this.state

    return (
      <div>
        {
          user ?
          <h1>Currently logged in as {user}</h1> :
          <h1> Not logged in yet</h1>
        }
        <a href="/api/auth/auth0">
        <button>Log in to Auth0</button></a>
      </div>
    )
  }
}

export default App