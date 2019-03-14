import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import ReactSelect from 'react-select';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const keeperColumns = [
  {
    Header: 'Team Data',
    columns: [
      {
        Header: 'Player Name',
        id: 'name',
        accessor: 'name',
        filterMethod: (filter, row) => {
          return caseInsensitiveFilter(filter, row);
        }
      },
      {
        Header: 'Positions',
        id: 'position',
        accessor: 'position',
        filterMethod: (filter, row) => {
          return caseInsensitiveFilter(filter, row);
        }
      },
      {
        Header: 'Round Cost',
        id: 'cost',
        accessor: 'cost'
      },
      {
        Header: 'Year',
        id: 'year',
        accessor: 'year'
      }
    ]
  }
];

const caseInsensitiveFilter = function(filter, row){
  let rowValue = row[filter.id];
  if(rowValue){
    return rowValue.toLowerCase().includes(filter.value.toLowerCase());
  }
  return false;
}

class TeamArea extends Component {
  constructor (props) {
    super(props);
    this.deriveOptions = this.deriveOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      selected: '',
      dropdownOptions: this.deriveOptions(),
      tableData: []
    };
  }

  deriveOptions () {
    let options = [];
    for(let i = 0; i < this.props.teams.length; i++){
      let newOption = {};
      newOption.value = i;
      newOption.label = this.props.teams[i].name;
      options.push(newOption);
    }
    options.push({label: 'Free Agents', value: this.props.teams.length});
    return options;
  }

  handleChange (e) {
    this.setState({
      selected: e,
      tableData: e.value === this.props.teams.length ? this.props.freeAgents : this.props.teams[e.value].roster
    });
  }

  render () {
    return (
      <div className='container-fluid'>
        <ReactSelect options={this.state.dropdownOptions} selected={this.state.selected} onChange={this.handleChange} placeholder={'Select Team To View...'} className='col-6 offset-3 pb-3'/>
        {this.state.selected !== '' &&
          <ReactTable className='text-center -striped -highlight' filterable defaultSorted={[{id: 'cost'}]} data={this.state.tableData} columns={keeperColumns} defaultPageSize={30} />
        }
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
