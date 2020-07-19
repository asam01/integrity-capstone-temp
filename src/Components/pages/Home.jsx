import React, {Component,Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {Link, withRouter} from 'react-router-dom';

import UserProvider from "../authenticate/providers/UserProvider";
import { UserContext } from "../authenticate/providers/UserProvider";

import { BrowserRouter as Router, Route } from 'react-router-dom';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state={};
    }
    render() {
        return (
            <Fragment>
                <Helmet><title> toohak stonks quizzes </title></Helmet>
                <div id="home">
                    <section>
                        <div></div>
                        <h1>toohak app</h1>
                        <div className="play-button-container">
                            <ul>
                                <li><Link to="/play">Play</Link></li>
                            </ul>
                        </div>
                        <div className="host-button-container">
                            <p><Link to="/host">Host a room</Link></p>
                        </div>
                        <div className="create-button-container">
                            <p><Link to="/create">Create a room</Link></p>
                        </div>
                        <div className="auth-container">
                            <Link to="/auth/signIn">Login</Link>
                            <Link to="/auth/signUp">Signup</Link>
                        </div>
                    </section>
                </div>
            </Fragment>
        )
    }
}

export default Home;