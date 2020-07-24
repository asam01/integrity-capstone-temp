import React, {Component,Fragment} from 'react';
import {db,fire} from '../../firebase.js';
import {Quiz} from '../quiz/play/Quiz.jsx';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import {addUser,getCharts,getSymbols,getDayIndex,getPrices,getUserData,getUserRef,makeInvestment,
getCash,getShares,getRoomData,getRoomRef,getNetWorth} from '../firebase-access.jsx';
import {Helmet} from 'react-helmet';
import {isRedirect} from "@reach/router";

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
            //static properties
            roomId: null,
            password: '',
            userId: '',
            nickname: '',
            numSymbols: 0,

            //frequently updated properties
            phase: 'not-joined',
            questionNum: 0,
            chartURLs: null,
            net_worth: 0,
            money_left: [],
            curShares: [],
            prices: [],
        };
        this.updatePortfolio = this.updatePortfolio.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.initGameListener = this.initGameListener.bind(this);
        this.debug = this.debug.bind(this);
    }

    debug(str) {
        console.log(str);
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

    ////frequently updated properties
    //             phase: 'not-joined',
    //             questionNum: 0,
    //             chartURLs: [],
    //             technicalIndicatorUrls: [],
    //             netWorth: 0,
    //             money_left: [],
    //             curShares: [],
    //             prices: [],
    /*
            phase: 'not-joined',
            questionNum: 0,

            chartURLs: [],

            net_worth: 0,
            money_left: [],
            curShares: [],
            prices: [],
     */
    async updatePortfolio() {
        console.log("CALLING UPDATEPORTFOLIO");
        const {roomId,userId} = this.state;
        console.log("updatePortfolio checkpoint 1");
        var roomData = await getRoomData(roomId);
        console.log("updatePortfolio checkpoint 2");
        var userData = await getUserData(roomId,userId);
        console.log("updatePortfolio checkpoint 3");
        var chartUrls = await getCharts(roomId,roomData.day_index);
        console.log("updatePortfolio checkpoint 4");
        var prices = await getPrices(roomId,roomData.day_index);

        console.log("chartUrls from play.jsx updatePortfolio " + chartUrls);

        this.setState({
            questionNum: roomData.day_index,
            chartUrls: chartUrls,
            prices: prices,
            net_worth: userData.net_worth,
            money_left: userData.money_left,
            curShares: userData.curShares,
        });
    }

    async makeInvestmentWrapper(changeArray) {
        const that = this;
        await that.updatePortfolio();
        const {roomId,userId,questionNum} = this.state;
        var successful = await makeInvestment(roomId,userId,questionNum,changeArray);
        if (successful) {
            that.debug("make investment sucessful");
        }
        else that.debug("make investment failed");
    }

    async initGameListener() {
        const that = this;
        const {questionNum,roomId,phase,nickname,userId} = this.state;
        const roomRef = db.collection('Rooms').doc(roomId);
        const userRef = roomRef.collection('users').doc(userId);
        roomRef.onSnapshot(await async function(roomDoc) {
            const roomData = roomDoc.data();
            console.log(roomData);
            if (questionNum != roomData.day_index || phase != roomData.phase) {
                await that.updatePortfolio();
                that.setState({
                    phase: roomData.phase,
                })
            }
        });
        userRef.onSnapshot(await async function(userDoc) {
            await that.updatePortfolio();
        });
    }

    async joinGame() {
        const {roomId,password,nickname} = this.state;
        const that = this;
        console.log("play page roomID: " + roomId);
        const roomRef = db.collection('Rooms').doc(roomId);
        await roomRef.get().then(await async function(roomData) {
            if (roomData.exists) {
                console.log("room exists");
                var roomInfo = roomData.data();
                if (roomInfo.password === password && roomInfo.phase === 'connection') {
                    console.log("room entered");
                    var uniqueUserId = await addUser(roomId,nickname);
                    console.log("finished creating user, userID is " + uniqueUserId);
                    that.setState({
                        phase: 'connection',
                        userId: uniqueUserId,
                        numSymbols: roomInfo.symbols.length,
                        net_worth: roomInfo.starting_money,
                        money_left: roomInfo.starting_money,
                    });
                    await that.initGameListener();
                    await that.updatePortfolio();
                } else if (roomInfo.password === password) {
                    console.log("room not being hosted yet");
                } else if (roomInfo.phase === 'connection') {
                    console.log("incorrect password");
                } else {
                    console.log("room does not exist");
                }
            } else {
                console.log("room " + roomId + " does not exist");
            }
        });
    }

    render () {
        const {phase,password,nickname,playerKey,questionNum,roomId,isRedirected} = this.state;
        if (phase === 'not-joined') {
            return (
                <div className="page-container play-page">
                    <div>
                        <FormControl>
                            <TextField label="Nickname" name="nickname" value={nickname}
                                       onChange={this.handleChange('nickname')}/>
                        </FormControl>
                        <FormControl>
                            <TextField label="Game PIN" name="Game ID" value={roomId} onChange={this.handleChange('roomId')}/>
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
                    <Quiz {...this.state}></Quiz>
                </div>
            )
        } else if (phase === 'ended') {
            return (
                <div>
                    <p> Game has ended </p>
                </div>
            )
        }
    }
}

export default Play;