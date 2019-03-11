import React, { Component } from 'react';
import './App.css';
import Main from './Main';
import {Auth} from './Auth';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

class App extends Component {

  render () {
    return (
      <div className='App'>
        <BrowserRouter>
          <Switch>
            <Route path='/' component={Main} />
            <Route path='auth' component={Auth} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
