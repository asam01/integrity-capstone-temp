import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Quiz from '../quiz/host/Quiz';
import { fire, fireGolf } from '../../base';

function fetchGame(gameId, callback) {
    return fire.database().ref('/Rooms').orderByChild('gameId').equalTo(gameId).once('value',callback);
}

class Host extends Component {
    constructor(props) {
        super(props);
        this.state = {
            game: {},
            gameId: localStorage.getItem('RecentGameId') || '',
            password: '',
        }
        this.updateGame = this.updateGame.bind(this);
        this.initGameListener = this.initGameListener.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.quitGame = this.quitGame.bind(this);
        this.endGame = this.endGame.bind(this);
    }

    handleChange = name => (event) => {
        this.setState({
            [name]:event.target.value,
        });
    }

    updateGame(gameupdate) {
        const {game} = this.state;
        fire.database().ref('games/${game.key}').update(gameupdate);
    }

    restartGame() {
        const game = {};
        game.players = [];
        game.phase = 'setup';
        this.updateGame(game);
    }

    quitGame() {
        const {toggleHeader} = this.props;
        this.updateGame({phase:null});
        toggleHeader(true);
    }

    endGame(){
        this.updateGame({phase:'final_result'});
    }

    joinGame(gameId) {
        const {password} = this.state;
        const {toggleHeader} = this.props;
        const that = this;
        fetchGame(gameId, (snapshot) => {
            if (snapshot.val()) {
                var game;
                snapshot.forEach((child) => {
                    game = child.val();
                });
                if (game.password === password) {
                    that.initGameLIstener(game);
                    toggleHeader();
                } else {
                    //no matching game
                }
            } else {
                //no games
            }
        });
    }

    initGameListener(gameParameter) {
        var gameRef;
        gameRef = fire.database().ref('Rooms/$(gameParameter.key}');
        const that = this;
        gameRef.on('value',(snapshot) => {
            const game = snapshot.val();
            if (!game.phase) {
                game.phase = 'setup';
            }
            if (game) {
                that.setState({
                    game,
                });
            } else {
                that.setState({
                    game: '',
                });
            }
        });
    }
    render() {
        const {game, gameId, password} = this.state;
        const gameFunctions = {
            update: this.updateGame,
            restart: this.restartGame,
            end: this.endGame,
            quit: this.quitGame,
        }

        if (!game.phase) {
            return (
                <div className="page-container host-page">
                    <FormControl>
                        <TextField label="Game PIN" name="Game ID" value={gameId} onChange={this.handleChange('gameId')}/>
                    </FormControl>
                    <FormControl>
                        <TextField label="Password" type="password" name="password" value={password} onChange={this.handleChange('password')}/>
                    </FormControl>
                    <Button onClick={() => this.joinGame(gameId)} variant="contained">Host</Button>
                </div>
            )
        }
        return (
            <div className="page-container host-page">
                <Quiz game={game} gameFunc={gameFunctions}/>
            </div>
        );
    }
}

export default Host;