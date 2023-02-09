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
          <h1 className='col-12 jumbotron text-center'>We've Moved!</h1>
        </div>
          <div className='row'>
            <div className='col-12 offset-5'>
              <h5>We've moved!</h5>
            </div>
            <div className='col-12 offset-4'>
              <p>New Site is located at <a href='https://jps.onrender.com'>jps.onrender.com</a></p>
            </div>

      </div>
    );
  }
}

Main.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(Main);
