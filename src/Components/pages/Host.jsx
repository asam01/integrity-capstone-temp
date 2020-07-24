import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import {Quiz} from '../quiz/host/Quiz.js';
import {db,fire,fval} from '../../firebase.js';
import {addUser,getUserData,getUserRef,getRoomData,getRoomRef,getNumDays} from '../firebase-access.jsx';

/*
Possible phases:
- not-joined : display joining game
- connection : players joining phase
- question : displaying questions phase
- between-question : display a page between questions
- leaderboards : display the winners at the end
- ended : the game has ended
 */

/*
Game structure:
- phase: (see above)
- starting_money: contains starting value for users
- day_index: which date is used
- password: password
- symbols: array of symbols
* User collection

 */

class Host extends Component {

    constructor(props) {
        super(props);
        this.state = {
            phase: 'not-joined',
            questionNum: 0,
            roomId: null,
            password: '',
            authenticated: 'no',
            listening: 'no',
            users: [],
        }
        this.userExists = this.userExists.bind(this);
        this.updateUsers = this.updateUsers.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.updatePhase = this.updatePhase.bind(this);
        this.initGameListener = this.initGameListener.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.quitGame = this.quitGame.bind(this);
        this.endGame = this.endGame.bind(this);
        this.debug = this.debug.bind(this);
    }

    debug(str) {
        console.log(str);
    }

    componentDidMount() {
        const {roomId} = this.state;
    }

    componentDidChange() {
    }

    handleChangeSelect = (event) => {
        this.setState({[event.target.name]:event.target.value});
    };

    handleChange = name => (event) => {
        this.setState({
            [name]:event.target.value,
        });
    }

    userExists(userId) {
        const {users} = this.state;
        var exists = false;
        console.log("type of users: " + typeof(users));
        Array.from(users).forEach(function(item) {
            console.log("item ID " + item.userId);
            console.log("checked user ID " + userId);
            if (item.userId == userId) {
                console.log("they are equal");
                exists = true;
            } else {
                console.log(item.userId + " and " + userId + " are not equal");
            }
        });
        return exists;
    }

    updatePhase(gameupdate) {
        const {roomId} = this.state;
        this.setState({
            phase: gameupdate,
        });
        db.collection('Rooms').doc(roomId).update({
            phase: gameupdate,
        });
    }

    restartGame() {

    }

    quitGame() {
        const {toggleHeader} = this.props;
        this.updateGame({phase:null});
    }

    endGame(){
        this.updateGame({phase:'final_result'});
    }

    // addDummyUser(nickname) {
    //     const {gameId} = this.state;
    //     const gameRef = db.collection('Rooms').doc(gameId);
    //     const userRef = gameRef.collection('users').doc(nickname);
    //
    //     const gameInfo = {
    //         nickname: nickname,
    //         investments: [],
    //         personal_value: -1,
    //         money_left: -1,
    //         gains: 0,
    //         losses: 0,
    //     }
    //     userRef.set(gameInfo);
    // }

    updateUsers() {
        const {password,roomId} = this.state;
        const that = this;
        var roomRef = db.collection('Rooms').doc(roomId);
        roomRef.collection('users').get().then((snapshot) => {
            snapshot.docs.forEach(user => {
                var userData = user.data();
                const userExistsBool = that.userExists(userData.userId);
                console.log("userExistsBool value is " + userExistsBool);
                if (userExistsBool == false) {
                    console.log("adding new user");
                    console.log("user id is " + userData.userId);
                    that.setState({
                        users: that.state.users.concat([userData]),
                    })
                }
            });
        });
    }

    async joinGame() {
        const {password,roomId} = this.state;
        const that = this;
        var roomRef = getRoomRef(roomId);
        var roomData = await getRoomData(roomId);
        if (roomData != null) {
            console.log(roomData);
            if (roomData.password === password && roomData.phase === 'no-host') {
                that.setState({
                    authenticated: 'yes',
                    phase: 'connection',
                });
                that.debug("ckpoint 1 host");
                await addUser(roomId,"dummy user");
                that.debug("ckpoint 2 host");
                await that.updateUsers();
                that.debug("ckpoint 3 host");
                await that.initGameListener();
                that.debug("ckpoint 4 host");
                roomRef.update({
                    phase: 'connection',
                });
                var numDays = getNumDays(roomId);
                that.setState({
                    numDays: numDays,
                })
            } else {
                console.log("wrong password");
            }
        } else {
            console.log("room " + roomId + " does not exist");
        }
    }

    initGameListener() {
        const {roomId} = this.state;
        var roomRef = db.collection('Rooms').doc(roomId);
        const that = this;

        roomRef.collection('users').onSnapshot(function(roomData) {
            that.updateUsers();
        });
    }

    startGame() {
        const that = this;
        that.updatePhase('question');
    }

    advanceQuestion() {
        const {roomId} = this.state;
        const that = this;
        this.setState({
            questionNum: that.state.questionNum + 1,
        });
        db.collection('Rooms').doc(roomId).update({
            day_index: fval.increment(1),
        });

    }

    /*
    Possible phases:
    - not-joined : display joining game
    - connection : players joining phase
    - question : displaying questions phase
    - between-question : display a page between questions
    - leaderboards : display the winners at the end
    - ended : the game has ended
     */
    render() {
        const {roomId, password, phase, authenticated, users, questionNum} = this.state;
        const gameFunctions = {
            update: this.updateGame,
            restart: this.restartGame,
            end: this.endGame,
            quit: this.quitGame,
        }

        if (authenticated === 'no') {
            return (
                <div className="page-container host-page">
                    <FormControl>
                        <TextField label="Game PIN" name="Game ID" value={roomId}
                                   onChange={this.handleChange('roomId')}/>
                    </FormControl>
                    <FormControl>
                        <TextField label="Password" type="password" name="password" value={password}
                                   onChange={this.handleChange('password')}/>
                    </FormControl>
                    <Button onClick={() => this.joinGame()} variant="contained">Host</Button>
                </div>
            )
        } else if (authenticated === 'yes') {
            if (phase === 'connection') {
                return (
                    <div className="page-container host-page">
                        <p> Users List </p>
                        <ul id="user-list">
                            {users.map(user => (
                                <li >{user.nickname}</li>
                            ))
                            }
                        </ul>
                        <button onClick={() => this.startGame()}>start stonks game</button>
                    </div>
                )
            } else if (phase === 'question') {
                return (
                    <div className="page-container host-page">
                        <span>Current question: </span>
                        {' '}
                        <span className="dynamic-text">{questionNum}</span>
                        <p> Users List </p>
                        <ul id="user-list">
                            {users.map(user => (
                                <li key={user.id}>{user.nickname}</li>
                            ))
                            }
                        </ul>
                        <button onClick={() => this.advanceQuestion()}>next question</button>
                    </div>
                )
            }
        }
        // return (
        //     <div className="page-container host-page">
        //         {game.gametype === 'quiz' && <Quiz game={game} gameFunc={gameFunctions}/>}
        //     </div>
        // );
    }
}

export default Host;