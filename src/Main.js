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
    let redirectUri = 'https://mwilkens731.github.io/jps';
    if (window.location.host.indexOf('localhost') >= 0) {
      redirectUri = 'oob';
    }
    this.state = {
      oauth: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token'),
      oauthWithProxy: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, AppData.corsAnywhereUrl + 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token'),
      redirectUri: redirectUri,
      loading: true
    };
    this.state.oauthWithProxy.useAuthorizationHeaderforGET(true);
    this.saveLoginResults = this.saveLoginResults.bind(this);
    this.extractTeams = this.extractTeams.bind(this);
    this.getAxiosHeaders = this.getAxiosHeaders.bind(this);
    this.getRosters = this.getRosters.bind(this);
  }

  async componentDidMount (props) {
    let code = (queryString.parse(this.props.location.search)).code;
    if (!code && !this.state.code) {
      window.location.assign(this.state.oauth.getAuthorizeUrl({
        redirect_uri: this.state.redirectUri,
        response_type: 'code'
      }));
    } else {
      this.state.oauthWithProxy.getOAuthAccessToken(code, {
        grant_type: 'authorization_code',
        redirect_uri: this.state.redirectUri
      }, this.saveLoginResults);
    }
  }

  getAxiosHeaders (accessToken) {
    if (!accessToken) {
      return {
        headers: {
          'Authorization': 'Bearer ' + this.state.accessToken
        }
      };
    } else {
      return {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      };
    }
  }

  async saveLoginResults (e, code, access_token, refresh_token) {
    if (e) {
      console.log(e);
    } else {
      this.setState({
        code: code,
        accessToken: refresh_token.access_token
      });
      let result = await axios.get(AppData.corsAnywhereUrl + 'https://fantasysports.yahooapis.com/fantasy/v2/league/' + AppData.leagueKeys.thisYear + '/teams?format=json', this.getAxiosHeaders(refresh_token.access_token));
      this.extractTeams(result.data.fantasy_content.league[1].teams, result.data.fantasy_content.league[0].draft_status === 'predraft');
    }
  }

  extractTeams (teams, predraft) {
    console.log('teams', teams);
    let teamsArray = [];
    for (let i = 0; i < teams.count; i++) {
      let thisTeam = teams[i];
      teamsArray.push({
        name: thisTeam.team[0][2].name,
        teamKey: thisTeam.team[0][0].team_key,
        lastYearTeamKey: AppData.leagueKeys.lastYear + AppData.lastYearTeamKeys[thisTeam.team[0][1].team_id]
      });
    }
    console.log('teamsArray', teamsArray);
    return this.getRosters(teamsArray, predraft);
  }

  getRosters (teams, predraft) {
    teams.forEach(async (team) => {
      let result = await axios.get(
        AppData.corsAnywhereUrl + 'https://fantasysports.yahooapis.com/fantasy/v2/team/' + (predraft ? team.lastYearTeamKey : team.teamKey) + '/roster?format=json',
        this.getAxiosHeaders(this.state.accessToken));
      console.log('roster results', result.data.fantasy_content.team[1].roster[0].players);
    });
    this.setState({
      loading: false
    });
  }

  render () {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <h1 className='col-12 jumbotron text-center'>Juan Pierre Sucks Keeper Costs</h1>
        </div>
        {this.state.loading &&
          <div>
            <div className='spinner-grow' style={{width: '10rem', height: '10rem'}} role='status'>
              <span class='sr-only'>Loading...</span>
            </div>
            <div className='row'>
              <h5 className='col-12 text-center'>Loading Yahoo data...</h5>
            </div>
          </div>

        }
        {!this.state.loading &&
          <div>{this.state.accessToken}</div>
        }

      </div>
    );
  }
}

Main.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(Main);
