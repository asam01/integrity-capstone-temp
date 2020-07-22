import React, { Component } from 'react';
import {fire} from '../../../firebase.js';


class Quiz extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.saveAnswer = this.saveAnswer.bind(this);
    }

    saveAnswer(answer) {
        let that = this;
        let currentQuestionId = this.props.game.quiz.questions[this.props.game.quiz.currentQuestion].id;
        fire.database().ref('/Rooms/' + that.props.game.key + '/players/' + this.props.playerKey + '/answers/' + currentQuestionId).set(answer, function(error) {
            var x = 1+1;
        }
        );
    }

    render() {
        return (
            <div></div>
        );
    }
};

export {Quiz};


/* Code for Round.jsx is below
import React, {Component,Fragment} from 'react';
import {Helmet} from 'react-helmet';

import {firestore} from '../../firebase';
import {getUserID} from '../../firebase';

import {getChartUrl, getTechnicalUrl,getSymbols} from '../firestore-access';
import {getCurrentPrice} from '../firestore-access';
import {advanceDay} from '../firestore-access';
import {getDate} from '../firestore-access';
import {DATES} from '../firestore-access';
import {getUserShares} from '../firestore-access';
import {makeInvestment} from '../firestore-access';
import {getUserBalance} from '../firestore-access';

class Round extends React.Component {

    constructor (props) {
        super(props)
        this.state = {
            chartURL: null,
            technicalIndicators: null,
            roomID: this.props.location.state.roomID,
            currentCash: null,
            currentShares: null,
            currentPrice: null,
            userChoice: null,
            userNumShares: null,
            currSymbol: null,
            //leaderboard: null,
        }
    }

    async componentDidMount() {
        console.log("RoomID is " + this.state.roomID)

        const userID = getUserID();
        const end  = getDate(firestore,this.state.roomID);
        const symbols = await getSymbols(firestore,this.state.roomID)
        let symbol = symbols[0]
        this.setState({
            currSymbol: symbol,
            technicalIndicators: await getTechnicalUrl(firestore,this.state.roomID,symbol,end) ,
            chartURL: await getChartUrl(firestore,this.state.roomID,symbol,end),
            currentCash: await getUserBalance(firestore, this.state.roomID, userID),
            currentShares: await getUserShares(firestore, this.state.roomID, userID),
            currentPrice: await getCurrentPrice(firestore, symbol,this.state.roomID),
            userNumShares: (await getUserShares(firestore, this.state.roomID, userID)).length
        });
    }

    buy = () => {
      this.setState({userChoice: 'buy'});
    }

    hold = () => {
      this.setState({userChoice: 'hold'});
    }

    sell = () => {
      this.setState({userChoice: 'sell'});
    }

    submitHandler = (event) => {
      event.preventDefault(); // prevent page
      // make the investment
      makeInvestment(firestore, this.state.roomID, getUserID(), this.state.currSymbol, 100, 3);
    if(advanceDay(firestore,this.state.roomID))
    {
        alert("recorded the investment");
    }
    else
    {
        alert("Game is finished.")
    }
    }

    render () {
        return (
            <div>
                <p className="price">The current price per share is ${this.state.currentPrice}</p>
                <p className="usr-current-shares">You current hold {this.state.userNumShares} shares</p>
                <p className="usr-available-money">You have ${this.state.currentCash} left to spend.</p>

                <form onSubmit={this.submitHandler}>
                    <button onClick={this.buy}>Buy</button>

                    <label>Enter number of shares:</label>
                    <input
                        name="num-shares"
                        type="number"
                    />

                    <button onClick={this.sell}>Sell</button>
                    <button onClick={this.hold}>Hold</button>

                    <input
                        type="submit"
                    />
                </form>


                <div id="confirmation"></div>
            </div>
        )
    }
    }

    export default Round;
*/