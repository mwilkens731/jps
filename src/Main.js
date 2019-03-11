import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import AppData from './AppData';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import axios from 'axios';
var OAuth = require('oauth');

class Main extends Component {
  constructor (props) {
    super(props);
    this.state = {
      oauth: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token')
    };
    this.saveLoginResults = this.saveLoginResults.bind(this);
  }

  async componentDidMount (props) {
    let code = (queryString.parse(this.props.location.search)).code;
    if (!code && !this.state.code) {
      window.location.assign(this.state.oauth.getAuthorizeUrl({
        redirect_uri: 'https://mwilkens731.github.io/jps',
        response_type: 'code'
      }));
    } else {
      let results = await axios.post('https://api.login.yahoo.com/oauth2/get_token', {}, {
        client_id: AppData.clientId,
        client_seciret: AppData.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://mwilkens731.github.io/jps'
      });
      console.log('results', results);
      // this.state.oauth.getOAuthAccessToken(code, {
      //   grant_type: 'authorization_code',
      //   redirect_uri: 'https://mwilkens731.github.io/jps'
      // }, this.saveLoginResults);
    }
  }

  saveLoginResults (e, code, access_token, refresh_token) {
    if (e) {
      console.log(e);
    } else {
      console.log('success!');
      console.log('access', access_token);
      console.log('refresh', refresh_token);
    }
    this.setState({
      code: code,
      accessToken: access_token,
      refreshToken: refresh_token
    });
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
