import React, {Component,Fragment} from 'react';
import {db,fire} from '../../firebase.js';
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

    /*
    Possible phases:
    - not-joined : display joining game
    - connection : players joining phase
    - question : displaying questions phase
    - between-question : display a page between questions
    - leaderboards : display the winners at the end
    - ended : the game has ended
     */

    constructor (props) {
        super(props);
        this.state = {
            game: {},
            gameId: null,
            password: '',
            phase: 'not-joined',
            userId: '',
            questionNum: 0,
            chartURLs: [],
            technicalIndicators: [],
            currentCash: 0,
            currentShares: [],
            currentPrice: null,
        };
        this.addUser = this.addUser.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.initGameListener = this.initGameListener.bind(this);
    }

    componentDidMount() {
    }

    handleChangeSelect = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleChange = name => (event) => {
        this.setState({
            [name]: event.target.value,
        });
    };

    initGameListener() {
        const that = this;
        const {questionNum,gameId} = this.state;
        const gameRef = db.collection('Rooms').doc(gameId);
        gameRef.onSnapshot(function(gameData) {
            const curQuestionNum = gameData.data().date_index;
            const curPhase = gameData.data().phase;
            if(questionNum != curQuestionNum) {
                that.setState({
                    questionNum: curQuestionNum,
                });
            }
            that.setState({
                phase: curPhase,
            })
        });
    }

    joinGame() {
        const {gameId,password} = this.state;
        const that = this;
        const gameRef = db.collection('Rooms').doc(gameId);
        gameRef.get().then(function(gameData) {
            if (gameData.exists) {
                var gameInfo = gameData.data();
                if (gameInfo.password === password && gameInfo.phase === 'connection') {
                    that.setState({
                        phase: 'connection',
                    });
                    var uniqueUserId = '1234567';
                    that.addUser("actual user",uniqueUserId);
                    that.setState({
                        userId: uniqueUserId,
                    });
                    that.initGameListener();
                    //create event listener
                    //that.initGameListener();

                } else if (gameInfo.password === password) {
                    console.log("game not being hosted yet");
                } else if (gameInfo.phase === 'connection') {
                    console.log("incorrect password");
                } else {
                    console.log("game does not exist");
                }
            } else {
                console.log("room " + gameId + " does not exist");
            }
        });
    }

    addUser(nickname,uniqueId) {
        var nickname = "singled out user"
        const {gameId} = this.state;
        const gameRef = db.collection('Rooms').doc(gameId);
        const userRef = gameRef.collection('users').doc(uniqueId);

        const gameInfo = {
            nickname: nickname,
            investments: [],
            personal_value: 10000,
            money_left: 10000,
            gains: 0,
            losses: 0,
        }

        this.setState({
            net_worth: gameInfo.personal_value,
            cash: gameInfo.money_left,
        })

        userRef.set(gameInfo);
    }

    render () {
        const {game,phase,password,playerKey,questionNum,gameId,recentGameId,recentGame,isRedirected,gametype} = this.state;
        if (phase === 'not-joined') {
            return (
                <div className="page-container play-page">
                    <div>
                        <FormControl>
                            <TextField label="Game PIN" name="Game ID" value={gameId} onChange={this.handleChange('gameId')}/>
                        </FormControl>
                        <FormControl>
                            <TextField label="Password" type="password" name="password" value={password}
                                       onChange={this.handleChange('password')}/>
                        </FormControl>
                        <Button onClick={() => this.joinGame()} variant="contained">Join</Button>
                    </div>
                </div>
            )
        } else if (phase === 'connection') {
            return (
                <div>
                    <p> Connected. Please wait for host to start game. </p>
                </div>
            )
        } else if (phase === 'question') {
            return (
                <div>
                    <span>Current question: </span>
                    {' '}
                    <span className="dynamic-text">{questionNum}</span>
                    <p> (question info will be displayed here) </p>
                    <button> Buy </button>
                    <button> Sell </button>
                    <button> Hold </button>
                </div>
            )
        }

    }
}

export default Play;