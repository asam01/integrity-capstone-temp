import React, {Component,Fragment} from 'react';
import {fire} from '../../firebase.js';
import {Quiz} from '../quiz/play/Quiz.jsx';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import {Helmet} from 'react-helmet';
import {isRedirect} from "@reach/router";

function fetchGame(gameId,callback) {
    fire.database().ref('/Rooms').orderByChild('gameId').equalTo(gameId).once('value',callback);
}

class Play extends Component {

    constructor (props) {
        super(props);
        this.state = {
            game: {},
            gameId: '',
            gametype: 'other',
            recentGameId: localStorage.getItem('RecentGameIdPlay') || '',
            playerKey: '',
            chartURLs: null,
            technicalIndicators: null,
            currentCash: null,
            currentShares: null,
            currentPrice: null,
        };
        this.createPlayer = this.createPlayer.bind(this);
        this.joinGame = this.joinGame.bind(this);
    }

    componentDidMount() {
        const {recentGameId} = this.state;
        if (recentGameId) {
            fetchGame('default',recentGameId, (snapshot) => {
                if (snapshot.val()) {
                    var game;
                    snapshot.forEach((child) => {
                        game = child.val();
                    });
                    if (game.status === 'in_progress') {
                        this.setState({recentGame:game});
                    }
                }
            })
        }
    }

    handleChangeSelect = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleChange = name => (event) => {
        this.setState({
            [name]: event.target.value,
        });
    };

    updateShares(changeInShares,playerId) {
        var current
    }

    joinGame(gameId) {
        const {gametype} = this.state;
        const that = this;
        fetchGame(gametype, gameId, (snapshot) => {
            if (snapshot.val()) {
                var game;
                snapshot.forEach((child) => {
                    game = child.val();
                });
                if (game.phase === 'connection') {
                    const storedPlayerKey = localStorage.getItem('RecentPlayerKey');
                    if (storedPlayerKey && game.players && game.players[storedPlayerKey]) {
                        that.setState({playerKey: storedPlayerKey});
                    }
                    that.initGameListener(game);
                } else if (game.phase === 'setup') {
                    //game not started
                } else {
                    const storedPlayerKey = localStorage.getItem('RecentPlayerKey');
                    if (storedPlayerKey && game.players && game.players[storedPlayerKey]) {
                        that.setState({playerkey: storedPlayerKey});
                        localStorage.setItem('RecentGameIdPlay',game.gameId);
                        that.initGameListener(game);
                    } else {
                        //game in progress
                    }
                }
            } else {
                //no game found
            }
        });
    }

    initGameListener(gameParameter) {
        var gameRef;
        gameRef = fire.database().ref('/Rooms/$(gameParameter.key)');
        const that = this;
        gameRef.on('value', (snapshot) => {
            const game = snapshot.val();
            if (game) {
                that.setState({
                    game,
                });
            } else {
                that.setState({
                    game: '',
                })
            }
        });
    }

    createPlayer(player) {
        const {game} = this.state;
        var playerRef;
        playerRef = fire.database().ref('/Rooms/$(game.key}/players').push();
        const newPlayer = Object.assign({key:playerRef.key},player);
        const that = this;
        playerRef.set(newPlayer, (error) => {
            if (error) {
                //handle error
            } else {
                that.setState({
                    playerKey: newPlayer.key,
                });
                localStorage.setItem('RecentPlayerKey',newPlayer.key);
            }
        });
    }

    render () {
        const {game,playerKey,gameId,recentGameId,recentGame,isRedirected,gametype} = this.state;
        if (!game.phase) {
            return (
                <div className="page-container play-page">
                    <div>
                        <FormControl>
                            <TextField label="Game PIN" name="Game ID" value={gameId} onChange={this.handleChange('gameId')}/>
                        </FormControl>
                        <Button onClick={() => this.joinGame(gameId)} variant="contained">Join</Button>
                    </div>
                </div>
            )
        }
        return (
            <div className="page-container play-page">
                {game.gametype === 'quiz' && <Quiz game={game} createPlayer={this.createPlayer} playerKey={playerKey}/>}
            </div>
        );
    }
}

export default Play;