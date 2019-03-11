import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import AppData from './AppData';
import { withRouter } from 'react-router';
var OAuth = require('oauth');

class Main extends Component {
  constructor (props) {
    super(props);
    this.state = {
      oauth: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token')
    };
  }

  async componentDidMount (prevProps) {
    if (!this.state.token) {
      console.log('in', this.state.oauth.getAuthorizeUrl({
        redirect_uri: 'http://mwilkens731.github.io/jps/auth',
        response_type: 'code'
      }));
      this.props.history.push(this.state.oauth.getAuthorizeUrl({
        redirect_uri: 'http://mwilkens731.github.io/jps/auth',
        response_type: 'code'
      }));
      // let result = await this.state.oauth.getOAuthAccessToken('', {'grant_type': 'refresh_token'}, (res) => {
      //   console.log('res', res);
      // });
      // console.log('results', result);
    }
    if (!this.state.gameKey) {
      // this.setState({gameKey: gameKeyResponse.gameKey});
      console.log('hi', this.state);
    }
  }

  render () {
    return (
      <div>Hi</div>
    );
  }
}

Main.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(Main);
