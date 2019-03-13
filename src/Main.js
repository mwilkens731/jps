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
      oauth: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token'),
      oauthWithProxy: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, AppData.corsAnywhereUrl + 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token'),
      redirectUri: window.location.host.indexOf('localhost') >= 0 ? 'oob' : 'https://mwilkens731.github.io/jps',
      authenticated: false,
      teamsRetrieved: false,
      draftResultsRetrieved: false,
      rostersRetrieved: 0,
      isLocalHost: window.location.host.indexOf('localhost') === 0,
      teams: []
    };
    this.state.oauthWithProxy.useAuthorizationHeaderforGET(true);
    this.saveLoginResults = this.saveLoginResults.bind(this);
    this.extractTeams = this.extractTeams.bind(this);
    this.getAxiosHeaders = this.getAxiosHeaders.bind(this);
    this.getRosters = this.getRosters.bind(this);
    this.getLoadingStatus = this.getLoadingStatus.bind(this);
    this.redirectToYahooAuth = this.redirectToYahooAuth.bind(this);
    this.getDraftResults = this.getDraftResults.bind(this);
  }

  async componentDidMount (props) {
    let code = (queryString.parse(this.props.location.search)).code;
    if (!code && !this.state.code) {
      this.redirectToYahooAuth();
    } else {
        this.state.oauthWithProxy.getOAuthAccessToken(code, {
          grant_type: 'authorization_code',
          redirect_uri: this.state.redirectUri
        }, this.saveLoginResults);
    }
  }

  redirectToYahooAuth(){
    window.location.assign(this.state.oauth.getAuthorizeUrl({
      redirect_uri: this.state.redirectUri,
      response_type: 'code'
    }));
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
    if (e && e.statusCode === 400 && !this.state.isLocalHost) {
        this.redirectToYahooAuth();
    } else {
      this.setState({
        code: code,
        accessToken: refresh_token.access_token,
        authenticated: true
      });
      let result = await axios.get(AppData.corsAnywhereUrl + 'https://fantasysports.yahooapis.com/fantasy/v2/league/' + AppData.leagueKeys.thisYear + '/teams?format=json', this.getAxiosHeaders(refresh_token.access_token));
      this.extractTeams(result.data.fantasy_content.league[1].teams, result.data.fantasy_content.league[0].draft_status === 'predraft');
    }
  }

  extractTeams (teams, predraft) {
    let teamsArray = [];
    this.setState({
      teamsRetrieved: true,
      predraft: predraft
    });
    for (let i = 0; i < teams.count; i++) {
      let thisTeam = teams[i];
      teamsArray.push({
        name: thisTeam.team[0][2].name,
        teamKey: thisTeam.team[0][0].team_key,
        lastYearTeamKey: AppData.leagueKeys.lastYear + AppData.lastYearTeamKeys[thisTeam.team[0][1].team_id],
        roster: []
      });
    }
    console.log('teamsArray', teamsArray);
    this.getDraftResults();
    this.getRosters(teamsArray);
  }

  getRosters (teams) {
    teams.forEach(async (team) => {
      let result = await axios.get(
        AppData.corsAnywhereUrl + 'https://fantasysports.yahooapis.com/fantasy/v2/team/' + (this.state.predraft ? team.lastYearTeamKey : team.teamKey) + '/roster?format=json',
        this.getAxiosHeaders(this.state.accessToken));
      let thisRoster = result.data.fantasy_content.team[1].roster[0].players;
      for(let i = 0; i < thisRoster.count; i++){
        let thisPlayer = thisRoster[i].player[0];
        let displayPostionIndex = 8;
        if(!thisPlayer[8].display_position){
          displayPostionIndex++;
          if(!thisPlayer[9].display_position){
            console.log('undefined player position for ', !thisPlayer[8].display_position);
          }
        }
        team.roster.push({
          playerKey: thisPlayer[0].player_key,
          name: thisPlayer[2].name.full,
          position: thisPlayer[displayPostionIndex].display_position
        });
      }
      this.setState({
        rostersRetrieved: this.state.rostersRetrieved + 1,
        teams: [...this.state.teams, team]
      });
    });

  }

  async getDraftResults(){
    let results = await axios.get(
      AppData.corsAnywhereUrl + 'https://fantasysports.yahooapis.com/fantasy/v2/league/' + (this.state.predraft ? AppData.leagueKeys.lastYear : AppData.leagueKeys.thisYear) + '/draftresults?format=json',
        this.getAxiosHeaders(this.state.accessToken));
    let extractedResults = results.data.fantasy_content.league[1].draft_results
    let draftResults = [];
    for(let i = 0; i < extractedResults.count; i++){
      draftResults.push({
        round: extractedResults[i].draft_result.round,
        playerKey: extractedResults[i].draft_result.player_key
      });
    }
    console.log('draft results', draftResults);
    this.setState({
      draftResultsRetrieved: true,
      draftResults: draftResults
    });
  }

  getLoadingStatus(){
    if (!this.state.authenticated){
      return 'Authenticating';
    } else if (!this.state.teamsRetrieved) {
      return 'Retrieving Team List...'
    } else if (!this.state.draftResultsRetrieved) {
      return 'Retrieving Draft Results...';
    }
    else if (this.state.rostersRetrieved < 12) {
      return `Retrieving Roster (${this.state.rostersRetrieved} / 12)`;
    }
    return 'Done';
  }

  render () {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <h1 className='col-12 jumbotron text-center'>Juan Pierre Sucks Keeper Costs</h1>
        </div>
        {this.getLoadingStatus() !== 'Done' &&
          <div>
            <div className='spinner-grow' style={{width: '10rem', height: '10rem'}} role='status'>
              <span className='sr-only'>Loading...</span>
            </div>
            <div className='row'>
              <h5 className='col-12 text-center'>{this.getLoadingStatus()}...</h5>
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
