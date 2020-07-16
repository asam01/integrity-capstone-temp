import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {fire, auth, firestore} from '../../firebase.js';

function generateGameId() {
    let id = '';
    const possible = '0123456789';
    for (let i=0; i<6; i++) {
        id += possible.charAt(Math.floor(Math.random() * 10));
    }
    return id;
}

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameId: '',
        }
        this.createGame = this.createGame.bind(this);
    }

    createGame(g) {
        const game = g;
        game.gameId = generateGameId();
        game.created = Date.now();
        game.status = 'created';
        game.phase = 'setup';
        const that = this;
        var roomRef = fire.database().ref('/Rooms').push();
        game.key = roomRef.key;
        roomRef.set(game);
        this.setState({
            gameId: game.gameId,
            gametype: done,
        });
        localStorage.setItem('RecentGameId',game.gameId);
    }

    render() {
        const {gameId} = this.state;
        return (
            <div className="app-page create-page">
                {gametype === 'done' && (
                    <div>
                        <span>Create game PIN: </span>
                        {' '}
                        <span className="dynamic-text">{gameId}</span>
                        <Link to="/host">Host game</Link>
                    </div>
                )}
            </div>
        );
    }
}

export default Create;