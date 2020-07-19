import React, {Fragment, Component} from 'react';
import {Helmet} from 'react-helmet';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Create from './Components/pages/Create'
import Host from './Components/pages/Host'
import Play from './Components/pages/Play'
import Home from './Components/pages/Home'

import UserProvider from "./Components/authenticate/providers/UserProvider";
import Game from "./Components/Game";

class App extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }
  render() {
    return (
      <Router>
        <div className="App">
          <div id="content">
            <Route exact path="/play" render={() => <Play />} />
            <Route exact path="/host" render={() => <Host />} />
            <Route exact path="/create" render={() => <Create />} />
            <Route exact path="/" render={() => <Home />} />
          </div>
        </div>
      </Router>
    )
  }
}

export default App;