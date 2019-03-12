import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import AppData from './AppData';
import { withRouter } from 'react-router';
import queryString from 'query-string';
var OAuth = require('oauth');

class Main extends Component {
  constructor (props) {
    super(props);
    this.state = {
      oauth: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token'),
      oauthWithProxy: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, AppData.corsAnywhereUrl + 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token')
    };
    this.state.oauthWithProxy.useAuthorizationHeaderforGET(true);
    this.saveLoginResults = this.saveLoginResults.bind(this);
    this.saveTeams = this.saveTeams.bind(this);
  }

  async componentDidMount (props) {
    let code = (queryString.parse(this.props.location.search)).code;
    if (!code && !this.state.code) {
      window.location.assign(this.state.oauth.getAuthorizeUrl({
        redirect_uri: 'https://mwilkens731.github.io/jps',
        response_type: 'code'
      }));
    } else {
      this.state.oauthWithProxy.getOAuthAccessToken(code, {
        grant_type: 'authorization_code',
        redirect_uri: 'https://mwilkens731.github.io/jps'
      }, this.saveLoginResults);
    }
  }

  async saveLoginResults (e, code, access_token, refresh_token) {
    if (e) {
      console.log(e);
    } else {
      console.log('success!');
      console.log('access', access_token);
      console.log('refresh', refresh_token);
      let result = await this.state.oauthWithProxy.get(AppData.corsAnywhereUrl + 'https://fantasysports.yahooapis.com/fantasy/v2/league/' + AppData.leagueKey + '/teams?format=json', refresh_token.access_token, this.saveTeams);
      console.log('save result', result);
    }
    this.setState({
      code: code,
      accessToken: refresh_token.access_token
    });
  }

  saveTeams(response){
    console.log('response', response);
  }

  render () {
    return (
      <div>
        <div>Hi</div>
        <div>{this.state.accessToken}</div>
      </div>
    );
  }
}

Main.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(Main);
