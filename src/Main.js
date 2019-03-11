import Yahoo from 'yahoo-fantasy';
import React, { Component } from 'react';
import './App.css';
import AppData from './AppData';

let yahooFantasy = new Yahoo(AppData.clientId, AppData.clientSecret);

class Main extends Component {

  async componentDidUpdate(prevProps){
    // if(!this.state.yahoo){
    //   this.setState({
    //     yahoo: new Yahoo(AppData.clientId, AppData.clientSecret)
    //   })
    //
    // }
    if(!this.state.gameKey){
      let gameKeyResponse = await yahooFantasy.meta('mlb');
      this.setState({gameKey: gameKeyResponse.gameKey});
      console.log(this.state);
    }
  }

  render(){
    return (
      <div>Hi</div>
    );

  }
}

export default Main;
