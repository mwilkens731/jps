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
            <Route path='/auth' component={Auth} />
            <Route path='/' component={Main} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
