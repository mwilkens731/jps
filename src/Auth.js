import React, { Component } from 'react';
import { withRouter } from 'react-router';

class Auth extends Component {
  render () {
    console.log('in auth');
    return (
      <div>IN!!!</div>
    );
  }
}

export {Auth};
export default withRouter(Auth);
