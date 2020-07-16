import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
//import logo from './logo.svg';
//import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import UserProvider from "./Components/authenticate/providers/UserProvider";
import Game from "./Components/Game";

function App() {
  
  return (
    <UserProvider>
      <Game />
    </UserProvider>
  );
}

export default App;