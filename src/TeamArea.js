import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import ReactSelect from 'react-select';
import ReactTable from 'react-table';

class TeamArea extends Component {
  constructor (props) {
    super(props);
    this.deriveOptions = this.deriveOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      selected: '',
      dropdownOptions: this.deriveOptions()
    };
  }

  deriveOptions () {
    let options = [];
    this.props.teams.forEach((team) => {
      let newOption = {};
      newOption.value = team.teamKey;
      newOption.label = team.name;
      options.push(newOption);
    });
    options.push({label: 'Free Agents', value: 'fa'});
    return options;
    console.log('options', options);
  }

  handleChange (e) {

  }

  render () {
    console.log('state', this.state);
    return (
      <div className='container-fluid'>
        <ReactSelect options={this.state.dropdownOptions} selected={this.state.selected} onChange={this.handleChange} />
      </div>
    );
  }
}

TeamArea.propTypes = {
  freeAgents: PropTypes.array,
  teams: PropTypes.array,
  predraft: PropTypes.bool
};

export default TeamArea;
