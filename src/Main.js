import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import { withRouter } from 'react-router';
import TeamArea from './TeamArea';
import Loading from './Loading';

class Main extends Component {
  constructor (props) {
    super(props);
    this.saveLoadingResults = this.saveLoadingResults.bind(this);
    this.state = {
      teams: [],
      freeAgents: [],
      predraft: false,
      loadingComplete: false
    };
  }

  saveLoadingResults(freeAgents, teams, predraft) {
    this.setState({
      loadingComplete: true,
      freeAgents: freeAgents,
      teams: teams,
      predraft: predraft
    })
  }

  render () {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <h1 className='col-12 jumbotron text-center'>Juan Pierre Sucks Keeper Costs</h1>
        </div>
        {!this.state.loadingComplete &&
          <Loading saveLoadingResults={this.saveLoadingResults}/>
        }
        {this.state.loadingComplete &&
          <div className='row'>
            <div className='col-12 col-md-6'>
              <h5>Select Team</h5>
              <TeamArea freeAgents={this.state.freeAgents} teams={this.state.teams} predraft={this.state.predraft} />
            </div>
            <div className='col-12 col-md-6'>
              <h5>Select Team</h5>
              <TeamArea freeAgents={this.state.freeAgents} teams={this.state.teams} predraft={this.state.predraft} />
            </div>
          </div>
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
