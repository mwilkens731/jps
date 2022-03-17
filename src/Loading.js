import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AppData from './data/AppData';
import queryString from 'query-string';
import axios from 'axios';
import moment from 'moment';
import Keepers from './data/Keepers';
import NextYearKeepers from './data/NextYearKeepers';
import { withRouter } from 'react-router';
var OAuth = require('oauth');

class Loading extends Component {
  constructor(props){
    super(props);
    this.getLoadingStatus = this.getLoadingStatus.bind(this);
    this.redirectToYahooAuth = this.redirectToYahooAuth.bind(this);
    this.saveLoginResults = this.saveLoginResults.bind(this);
    this.extractTeams = this.extractTeams.bind(this);
    this.getAxiosHeaders = this.getAxiosHeaders.bind(this);
    this.getRosters = this.getRosters.bind(this);
    this.getDraftResults = this.getDraftResults.bind(this);
    this.populateKeeperData = this.populateKeeperData.bind(this);
    this.populateFreeAgents = this.populateFreeAgents.bind(this);
    this.transformPlayer = this.transformPlayer.bind(this);
    this.enhancePlayer = this.enhancePlayer.bind(this);
    console.log('keepers in file: ' + Keepers.length);
    console.log('next year keepers in file: ' + NextYearKeepers.length);
    this.state = {
      oauth: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token'),
      oauthWithProxy: new OAuth.OAuth2(AppData.clientId, AppData.clientSecret, AppData.corsAnywhereUrl + 'https://api.login.yahoo.com/', 'oauth2/request_auth', 'oauth2/get_token'),
      redirectUri: window.location.host.indexOf('localhost') >= 0 ? 'oob' : 'https://mwilkens731.github.io/jps',
      authenticated: false,
      teamsRetrieved: false,
      draftResultsRetrieved: false,
      rostersRetrieved: false,
      rosterEnhancementStatus: false,
      freeAgentEnhancementStatus: false,
      isLocalHost: window.location.host.indexOf('localhost') === 0
    };
    this.state.oauthWithProxy.useAuthorizationHeaderforGET(true);
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

  redirectToYahooAuth () {
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
        lastYearTeamKey: AppData.lastYearTeamKeys[thisTeam.team[0][1].team_id] ? AppData.leagueKeys.lastYear + AppData.lastYearTeamKeys[thisTeam.team[0][1].team_id] : null,
        roster: []
      });
    }
    this.getDraftResults();
    this.getRosters(teamsArray);
  }

  async getDraftResults () {
    let results = await axios.get(
      AppData.corsAnywhereUrl + 'https://fantasysports.yahooapis.com/fantasy/v2/league/' + (this.state.predraft ? AppData.leagueKeys.lastYear : AppData.leagueKeys.thisYear) + '/draftresults?format=json',
        this.getAxiosHeaders(this.state.accessToken));
    let extractedResults = results.data.fantasy_content.league[1].draft_results;
    let draftResults = [];
    for (let i = 0; i < extractedResults.count; i++) {
      draftResults.push({
        round: extractedResults[i].draft_result.round,
        playerKey: extractedResults[i].draft_result.player_key
      });
    }
    this.setState({
      draftResultsRetrieved: true,
      draftResults: draftResults
    });
  }

  async getRosters (teams) {
    let commaSeparatedTeamKeys = '';
    console.log('teams', teams)
    teams.forEach((team) => {
      if (commaSeparatedTeamKeys.length === 0) {
        commaSeparatedTeamKeys = (this.state.predraft ? (team.lastYearTeamKey ? team.lastYearTeamKey : '') : team.teamKey);
      } else {
        if (team.lastYearTeamKey) {
            commaSeparatedTeamKeys += ',' + (this.state.predraft ? team.lastYearTeamKey : team.teamKey);
        }
      }
    });
    let result = await axios.get(
      AppData.corsAnywhereUrl + 'https://fantasysports.yahooapis.com/fantasy/v2/teams;team_keys=' + commaSeparatedTeamKeys + '/roster' + (this.state.predraft ? '' : (';date=' + moment().day(8).format('YYYY-MM-DD').toString())) + '?format=json',
      this.getAxiosHeaders(this.state.accessToken));
    for (let i = 0; i < teams.length; i++) {
      if(result.data.fantasy_content.teams[i]) {
        let thisRoster = result.data.fantasy_content.teams[i].team[1].roster[0].players;
        for (let j = 0; j < thisRoster.count; j++) {
          teams[i].roster.push(this.transformPlayer(thisRoster[j].player[0]));
        }
      }
    }
    this.setState({
      rostersRetrieved: true,
      teams: teams
    });
    this.populateKeeperData();
  }

  populateKeeperData () {
    let keepers = 0;
    let nextYearKeepers = 0;
    this.state.teams.forEach((thisTeam) => {
      thisTeam.roster.forEach((player) => {
        if (this.enhancePlayer(player)) {
          keepers++;
        }
        if (player.nextYearKeeper) {
          nextYearKeepers++;
        }
      });
    });
    this.setState({
      rosterEnhancementStatus: true
    });
    console.log('keepers on rosters: ', keepers);
    console.log('next year keepers on rosters', nextYearKeepers);
    this.populateFreeAgents();
  }

  async populateFreeAgents () {
    let freeAgents = this.state.draftResults.filter(pick => !pick.name);
    let faBatches = [];
    let fasAddedToRequest = 0;
    while (fasAddedToRequest < freeAgents.length) {
      let commaSeparatedPlayersKeys = '';
      for (let i = 0; i < 25 && fasAddedToRequest < freeAgents.length; i++) {
        if (commaSeparatedPlayersKeys.length === 0) {
          commaSeparatedPlayersKeys = freeAgents[fasAddedToRequest].playerKey;
        } else {
          commaSeparatedPlayersKeys += ',' + freeAgents[fasAddedToRequest].playerKey;
        }
        fasAddedToRequest++;
      }
      faBatches.push(commaSeparatedPlayersKeys);
    }
    let processedFAs = [];
    let keepers = 0;
    for (let j = 0; j < faBatches.length; j++) {
      let results = await axios.get(
        AppData.corsAnywhereUrl + 'https://fantasysports.yahooapis.com/fantasy/v2/players;player_keys=' + faBatches[j] + '?format=json',
        this.getAxiosHeaders(this.state.accessToken));
      let freeAgentsFromService = results.data.fantasy_content.players;
      for (let i = 0; i < freeAgentsFromService.count; i++) {
        let player = this.transformPlayer(freeAgentsFromService[i].player[0]);
        if (this.enhancePlayer(player)) {
          keepers++;
        }
        processedFAs.push(player);
      }
    }
    console.log('FA keepers', keepers);
    this.setState({
      freeAgentEnhancementStatus: true,
      freeAgents: processedFAs
    });
  }

  transformPlayer (thisPlayer) {
    let displayPostionIndex = 8;
    if (!thisPlayer[8].display_position) {
      displayPostionIndex++;
      if (!thisPlayer[9].display_position) {
        displayPostionIndex++;
        if (!thisPlayer[10].display_position) {
          console.log('undefined player position for ', thisPlayer);
        }
      }
    }
    return {
      playerKey: thisPlayer[0].player_key,
      name: thisPlayer[2].name.full,
      position: thisPlayer[displayPostionIndex].display_position,
      playerId: thisPlayer[1].player_id
    };
  }

  enhancePlayer (player) {
    console.log('player', player);
    let draftResult = this.state.draftResults.find(pick => pick.playerKey === player.playerKey);
    let draftRound = AppData.roundsInDraft + 1;
    if (draftResult) {
      draftResult.name = player.name;
      draftResult.position = player.position;
      draftRound = draftResult.round;
    }
    let keeper = Keepers.find(k => k.playerId === player.playerId);
    player.nextYearKeeper = !!NextYearKeepers.find(k => k.playerId === player.playerId);
    if (keeper) {
      player.cost = keeper.cost < AppData.roundsInDraft ? keeper.cost : AppData.roundsInDraft;
      player.year = keeper.year;
    } else {
      player.cost = draftRound === 1 ? 1 : draftRound - 1;
      player.year = 1;
    }
    return keeper;
  }

  getLoadingStatus () {
    if (!this.state.authenticated) {
      return 'Authenticating...';
    } else if (!this.state.teamsRetrieved) {
      return 'Retrieving Team List...';
    } else if (!this.state.draftResultsRetrieved) {
      return 'Retrieving Draft Results...';
    } else if (!this.state.rostersRetrieved) {
      return `Retrieving Rosters...`;
    } else if (!this.state.rosterEnhancementStatus) {
      return 'Populating Keeper Data...';
    } else if (!this.state.freeAgentEnhancementStatus) {
      return 'Importing Free Agents...';
    }
    console.log('state at end of imports', this.state);
    this.props.saveLoadingResults(this.state.freeAgents, this.state.teams, this.state.predraft);
    return 'Done';
  }

  render() {
    return (
      <div>
        <div className='spinner-grow' style={{width: '10rem', height: '10rem'}} role='status'>
          <span className='sr-only'>Loading...</span>
        </div>
        <div className='row'>
          <h5 className='col-12 text-center'>{this.getLoadingStatus()}</h5>
        </div>
      </div>
    );
  }

}

Loading.propTypes = {
  saveLoadingResults: PropTypes.func,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(Loading);
