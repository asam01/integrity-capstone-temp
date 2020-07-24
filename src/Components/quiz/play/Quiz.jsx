import React, { Component } from 'react';

import {firestore} from '../../../firebase';
import {getUserID} from '../../../firebase';
import {makeInvestment} from '../../firebase-access';


/*
inherited from Play:
  - chart URLs
  - roomID
  - symbols array
  - prices array
  - dayIndex

what Quiz does:
  - retrieves and displays user information
  - gets graph URLs from parent and displays
  - HTML form to gather all input data
  - submitHandlers for:
    - buy (+ # of shares)
    - sell (+ # of shares)
  - create changeArray to record investment in firestore
*/

// const NUM_SYMBOLS = 2;
// const DAY_INDEX = 0;
// const ROOMID = 'f82Cnzhyhs54aRWKKVaA';
// const USERID = '1K8yFtgBkrFr8FMd05YT';
// const CHARTURL = 'something';
//
// const BUY = "BUY";
// const SELL = "SELL";
// const HOLD = "HOLD";

class Quiz extends Component {

    constructor(props) {
        super(props);
        this.state = {
            roomId: null,
            password: '',
            userId: '',
            nickname: '',
            numSymbols: 0,

            //frequently updated properties
            questionNum: 0,
            chartUrls: null,
            net_worth: 0,
            money_left: 0,
            curShares: [],
            prices: [],
            curBuyArray: null,
        };
    }

    componentDidMount () {
        const numSymbols = this.props.numSymbols;
        var empArray = new Array(this.props.numSymbols).fill(0);
        this.setState({
            numSymbols: this.props.numSymbols,
            roomId: this.props.roomId,
            userId: this.props.userId,
            nickname: this.props.nickname,
            questionNum: this.props.questionNum,
            chartUrls: this.props.chartUrls,
            net_worth: this.props.net_worth,
            money_left: this.props.money_left,
            curShares: this.props.curShares,
            prices: this.props.prices,
            curBuyArray: empArray,
        });
    }

    static getDerivedStateFromProps(props,state) {
        return {
            questionNum: props.questionNum,
            chartUrls: props.chartUrls,
            net_worth: props.net_worth,
            money_left: props.money_left,
            curShares: props.curShares,
            prices: props.prices,
        }
    }

    // getSymbolData = () => {
    //     let rows = [];
    //
    //     // get current price and user shares held for each of the symbols
    //     // also present the BUY/HOLD/SELL options
    //     for (let i = 0; i < NUM_SYMBOLS; i++) {
    //         const currentPrice = this.getPrice(i);
    //         const numShares = this.state.userShares[i];
    //
    //         const toRender = (
    //             <div key={i}>
    //                 <p>Symbol{i}:</p>
    //                 <p>Current price is: {currentPrice}.</p>
    //                 <p>You currently hold {numShares} share(s).</p>
    //
    //                 <button type="button">BUY</button>
    //                 <input type="number" placeholder="10" onChange={(event) => this.updateFormState(event, i, BUY)}/>
    //
    //                 <button type="button" onClick={(event) => this.updateFormState(event, i, HOLD)}>HOLD</button>
    //
    //                 <button type="button">SELL</button>
    //                 <input type="number" placeholder="10" onChange={(event) => this.updateFormState(event, i, SELL)}/>
    //                 <br/>
    //             </div>
    //         );
    //         rows.push(toRender);
    //         this.addRowToFormData(i);
    //     }
    //
    //     return rows;
    // }
    //
    // // update state variable to reflect number of shares
    // updateFormState = (event, index, state) => {
    //     var newState = {
    //         BUY: null,
    //         HOLD: null,
    //         SELL: null
    //     };
    //
    //     // handle different states
    //     if (state === BUY) {
    //         var numShares = event.target.value;
    //
    //         // value is deleted
    //         if (!numShares) {
    //             this.state.formInput[index][BUY] = null;
    //             return;
    //         }
    //
    //         newState[BUY] = Number(numShares);
    //     }
    //     else if (state === HOLD) {
    //         newState[HOLD] = 1;  // indicate that user wants to Hold this investment with boolean flag
    //     }
    //     else if (state === SELL) {
    //         var numShares = event.target.value;
    //
    //         // deletion
    //         if (!numShares) {
    //             this.state.formInput[index][SELL] = null;
    //             return;
    //         }
    //
    //         newState[SELL] = Number(numShares);
    //     }
    //     else {
    //         throw "An unexpected error occurred when trying to process the state";
    //     }
    //
    //     this.state.formInput[index] = newState;
    // }
    //
    // //parse form submission results and convert into a changeArray (for firestore)
    // parseResults = () => {
    //     var changeArray = [];
    //     for (let i = 0; i < this.state.formInput.length; i++) {
    //         const currentRow = this.state.formInput[i];
    //
    //         if (currentRow[BUY]) {
    //             changeArray.push(currentRow[BUY]);
    //         }
    //         else if (currentRow[HOLD]) {
    //             changeArray.push(0);  // invest 0 in symbol
    //         }
    //         else if (currentRow[SELL]) {
    //             changeArray.push((currentRow[SELL] * -1));
    //         }
    //         else {
    //             alert("Please enter an action for each symbol");
    //             break;
    //         }
    //     }
    //
    //     this.validate(changeArray);
    //     makeInvestment(ROOMID, this.state.userID, DAY_INDEX, changeArray);
    //     alert('investment recorded');
    // }

    //TODO make this implement buyArray instead of just buying one share of the first symbol
    buy() {
        const {roomId, userId, questionNum} = this.state;
        var arr = new Array(this.props.numSymbols).fill(0);
        arr[0] = 1;
        makeInvestment(roomId,userId,questionNum,arr);
    }

    sell() {
        const {roomId, userId, questionNum} = this.state;
        var arr = new Array(this.props.numSymbols).fill(0);
        arr[0] = -1;
        makeInvestment(roomId,userId,questionNum,arr);
    }

    render() {
        const {questionNum,chartUrls,net_worth,money_left,curShares,prices,curBuyArray,nickname,roomId} = this.state;
        console.log("----------------------------");
        console.log(chartUrls);
        console.log(chartUrls['0']);
        console.log(chartUrls[0]);
        console.log(chartUrls['0']['0']);
        var imgUrls = chartUrls[0];
        console.log("----------------------------");
        return (
            <div>
                <p>room id: {roomId}</p>
                <p>nickname: {nickname}</p>
                <p>question number: {questionNum}</p>
                <p>chart:</p>
                <img src={imgUrls[0]}/>
                <p>net worth: {net_worth}</p>
                <p>cash: {money_left}</p>
                <p>current shares of symbol: {curShares[0]}</p>
                <p>price of symbol: {prices[0]}</p>
                <button onClick={() => this.buy()}>buy</button>
                <button onClick={() => this.sell()}>sell</button>
            </div>
        );
    }
};

export {Quiz};