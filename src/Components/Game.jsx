import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
//import logo from './logo.svg';
//import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';


import Home from './pages/Home';
import GameLobby from './pages/Lobby.js';
import Play from './quiz/Play.js';
import SignIn from "./authenticate/SignIn";
import SignUp from "./authenticate/SignUp";

function Game() {
  return (
    <Router>
      <Route path = "/" exact component={Home}/>
      <Route path = "/play/lobby" exact component={GameLobby}/>
      <Route path = "/play/game" exact component={Play}/>
      <Route path = "/auth/signIn" exact component={SignIn}/>
      <Route path = "/auth/signUp" exact component={SignUp}/>
    </Router>
  );
}

export default Game;