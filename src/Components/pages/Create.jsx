import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {db, fire, auth, firestore} from '../../firebase.js';

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
            pagetype: 'not-created',
            gameId: '',
        }
        this.createGame = this.createGame.bind(this);
    }
    
    componentDidMount() {
    }

    createGame() {
        console.log("create game called");
        const that = this;
        //create game doc in firestore database
        var _gameId = generateGameId();
        this.setState({
            gameId: _gameId,
        });
        var gameRef = db.collection("Rooms").doc(_gameId);
        gameRef.set({
            created: Date.now(),
            currentQuestion: 0,
            phase: 'created',
            gameId: _gameId,
        })

        //create subcollections for users
        var questionsRef = gameRef.collection("questions").doc("Test Q").set({});
        var usersRef = gameRef.collection("users").doc("Test user").set({});

        //update props
        this.setState({
            pagetype: 'created',
        });
    }

    render() {
        console.log('render called');
        const {pagetype,gameId} = this.state;
        console.log(pagetype);
        console.log(gameId);
        return (

            <div className="app-page create-page">
                {pagetype === 'not-created' &&
                    <button onClick={() => this.createGame()}> Create Game! </button>
                }

                {pagetype === 'created' && (
                    <div>
                        <span>Created game PIN: </span>
                        {' '}
                        <span className="dynamic-text">{gameId}</span>
                        <Link to="/host">Copy this ID and use it host the game</Link>
                    </div>
                )}
            </div>
        );
    }
}

export default Create;