import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import {db} from "../firebase";

const STARTING_MONEY = 10000;

export const addUser = (starting_money,gameId,nickname,numDays,numSymbols) => {
    const {gameId,nickname} = this.state;
    const gameRef = db.collection('Rooms').doc(gameId);
    const userRef = gameRef.collection('users').doc();
    const userId = userRef.id;
    const empArray = Array.from(Array(numSymbols),()=>0);

    const gameInfo = {
        nickname: nickname,
        net_worth: starting_money,
        money_left: starting_money,
        curShares: empArray,
    }
    userRef.set(gameInfo);

    for(var i_day = 0; i_day < numDays; i_day++) {
        var newDoc = userRef.collection('investments').doc(i_day);
        newDoc.set({
            change: empArray,
        });
    }
    return userId;
}

export const setUpRoom = (NumOfSymbols,Rounds,userID,password) => {
    const roomRef = db.collection('Rooms').doc();
    roomRef.set({
        day_index: 0,
        phase: 'no-host',
        password: password,
        starting_money: STARTING_MONEY,
    });
    const roomID = roomRef.id;
    initSymbols(db,null,null,NumOfSymbols).then((symbolsL) => {
        initDates(db,symbolsL,Rounds).then((datesD)=> {
            roomRef.update({
                symbols: symbolsL,
                dates: datesD["dates"],
            });
            initializeQuiz(symbolsL,roomID,datesD["period"],datesD["dates"]);

        });
    });
    return roomID;
}

export const getChartUrl = async (roomId,symbol,endDate) =>{
    let imagesData = await db.collection('Rooms').doc(roomId).collection(symbol).doc('images').get().data();
    return imagesData["Stockpublic_image_url"][endDate];
}

export const getTechnicalUrl = async (roomId, symbol, endDate) => {
    let imagesData = await db.collection('Rooms').doc(roomId).collection(symbol).doc('images').get().data();
    return imagesData["Stockpublic_image_url"][endDate]
}

function randomDate(start, end) {
    var date = new Date(+start + Math.random() * (end - start));
    return date;
}

// Minimum Period is 1Month
export const initDates = async (symbols, Rounds) => {
    let Stocks= await db.collection("Ticker-Info").doc("Stock").collection("Stocks")
        .where("Symbol","in",symbols).get()
    let IPOyearMax = 0;
    let today = new Date();
    let year = today.getFullYear();
    Stocks.forEach(function(Stock){
        if (IPOyearMax < Stock.data().IPOyear){
            IPOyearMax = Stock.data().IPOyear;
        }
    });

    // No more than 7 rounds(Periods are measured in months)
    let min_window_size = 3;
    let yearDiff = year - (IPOyearMax+1);
    let maximum_period = Math.floor(((yearDiff * 12)  - min_window_size) / Rounds);
    let random_period =  Math.floor((Math.random()  * (maximum_period - min_window_size))+min_window_size);
    let startDate = new Date(IPOyearMax+1,1,1);
    let endDate =  new Date(IPOyearMax+1,1+random_period,1);
    let rand_startDate =  randomDate(startDate,endDate);
    let dates = [];
    let curr_date = rand_startDate;
    for(var i = 0; i < Rounds; i++) {
        dates.push(curr_date.toISOString().substring(0, 10));
        curr_date = new Date(curr_date.setMonth(curr_date.getMonth()+random_period));
    }
    const datesD ={
        "dates" : dates,
        "period": random_period
    }
    return datesD
}

export const initSymbols = async(Industry,Sector,NumOfSymbols) =>{
    let symbols = []
    if(Sector !== null && Industry !== null){

        let formData = new FormData();
        formData.append('Industry',Industry);
        formData.append('Sector',Sector)
        formData.append('NumOfSymbols',NumOfSymbols)
        try{
            let response = await fetch('http://localhost:8080/get-symbols', {
                method: 'POST',
                mode: 'cors',
                body: formData
            })
            let symbolJson = await response.json()
            if (symbolJson.hasOwnProperty("Error")){
                console.log("No Symbols for your query")
                return symbols
            }
            symbols = symbolJson['symbols']
        }
        catch(error){
            console.log("Error with Query: " + error)
        }

    }
    else if(Industry !== null){

        let IndustryInfo =  await db.collection("Ticker-Info").doc("Industry").get();
        let numOfIndustries= IndustryInfo.data().Industry[Industry];
        let cutoff = Math.floor((Math.random()  * (numOfIndustries - NumOfSymbols))+NumOfSymbols);
        let Industries = await db.collection("Ticker-Info").doc("Stock").collection("Stocks")
            .where("Industry","==",Industry)
            .where("IndustryPos","<=", cutoff)
            .orderBy("IndustryPos").limit(NumOfSymbols).get()
        Industries.forEach(function(doc){
            symbols.push(doc.data().Symbol)
        })

    }
    else if(Sector !== null){

        let SectorInfo =  await db.collection("Ticker-Info").doc("Sector").get();
        let numOfSectors= SectorInfo.data().Sector[Sector];
        let cutoff = Math.floor((Math.random()  * (numOfSectors - NumOfSymbols))+NumOfSymbols);
        let Sectors = await db.collection("Ticker-Info").doc("Stock").collection("Stocks")
            .where("Sector","==",Sector)
            .where("SectorPos","<=", cutoff)
            .orderBy("SectorPos").limit(NumOfSymbols).get()
        Sectors.forEach(function(doc){
            symbols.push(doc.data().Symbol)
        })

    }
    else{

        let StockInfo =  await db.collection("Ticker-Info").doc("Stock").get();
        let numOfStocks = StockInfo.data().NumOfStocks - 1;
        let cutoff = Math.floor((Math.random()  * (numOfStocks - NumOfSymbols))+NumOfSymbols);
        let Stocks = await db.collection("Ticker-Info").doc("Stock").collection("Stocks")
            .where("RandomPos",">=", cutoff)
            .orderBy("RandomPos").limit(NumOfSymbols).get()
        Stocks.forEach(function(Stock){
            symbols.push(Stock.data().Symbol)
        })

    }
    return symbols
}

export const initializeQuiz = async (symbols, roomId, periodLen, endDates) => {
    var formData = new FormData();
    formData.append('symbol',JSON.stringify(symbols));
    formData.append('RoomId',roomId);
    formData.append('end-date',JSON.stringify(endDates));
    try{
        await fetch('http://localhost:8080/get-prices', {
            method: 'POST',
            mode: 'cors',
            body: formData
        })
    }
    catch(err) {
        console.log("Error is " +  err)
    }
    formData.append('periodLen',periodLen)
    try{
        await fetch('http://localhost:8080/get-stock-image', {
            method: 'POST',
            mode: 'cors',
            body: formData
        })
    }
    catch(error){
        console.log("Error is " +  error)
    }
}

export const getSymbols = async (roomID) =>{
    const roomData = await getRoomData(roomID);
    return roomData.symbols;
}

export const getDayIndex = async (roomID) => {
    const roomData = await getRoomData(roomID);
    return roomData.day_index;
}

// returns current price for all symbols being tracked
export const getPrices = async (roomID, dayIndex) => {
    const roomData = await getRoomData(roomID);
    const symbolNamesArray = roomData.symbols;

    var prices = [];

    // save all current prices in an array
    for (var index = 0; index < symbolNamesArray.length; index++) {
        const currentName = symbolNamesArray[index];
        const symbolPricesDoc = await db.collection('Rooms').doc(roomID).collection(currentName).doc('Prices').get();
        const symbolPricesData = symbolPricesDoc.data();
        const currentPrice = symbolPricesData.prices[dayIndex];
        prices.push(currentPrice);
    }

    return prices;
}

export const getUserData = async (roomID, userID) => {
    await updateNetWorth(roomID,userID);
    return await db.collection('Rooms').doc(roomID).collection('users').doc(userID).get().data();
}

export const getUserRef = (roomID, userID) => {
    return db.collection('Rooms').doc(roomID).collection('users').doc(userID);
}

export const verifyOk = async (roomID, userID, dayIndex, changeArray, prices) => {

    var consistentInvestment = true;
    const userRef = getUserRef(roomID, userID);
    const userData = await getUserData(roomID, userID);

    var curArray = userData.curShares;
    var sum = curArray.map(function(num,idx) {return num + changeArray[idx];});
    consistentInvestment = consistentInvestment && sum.every((e) => e>=0);

    //check cash ok
    var totalMoney = userData.money_left;
    var moneySpentArr = prices.map(function(price,idx) {totalMoney -= price * changeArray[idx];});
    consistentInvestment = consistentInvestment && totalMoney >= 0;

    return consistentInvestment;
}

export const changeCash = async (roomID, userID, dayIndex, changeArray, prices) => {
    const userRef = getUserRef(roomID, userID);
    const userData = await getUserData(roomID,userID);
    var totalMoney = userData.money_left;
    prices.map(function(num,idx) {totalMoney -= num * changeArray[idx];});
    userRef.update({money_left: totalMoney});
}

export const changeShares = async (roomID, userID, dayIndex, changeArray) => {
    const userRef = getUserRef(roomID, userID);
    const investRef = userRef.collection('investments').doc(dayIndex);
    const userData = await getUserData(roomID,userID);
    //update curShares array
    var curArray = userData.curShares;
    var sum = curArray.map(function(num,idx) {return num + changeArray[idx];});
    userRef.update({curShares: sum});

    //update
    //TODO: current have a separate call for investment. Consider accessing it through userData to save time
    investRef.get().then(function(investDoc) {
        if (investDoc.exists) {
            var investData = investDoc.data();
            var curArray = investData.change;
            var sum = curArray.map(function(num,idx) {
                return num + changeArray[idx];
            });
            investRef.update({
                change: sum,
            });
        }
    });
}

export const makeInvestment = async (roomID, userID, dayIndex, changeArray) => {
    const prices = await getPrices(roomID, dayIndex);

    if (!(await verifyOk(roomID,userID,dayIndex,changeArray,prices))) return false;

    changeCash(roomID,userID,dayIndex,changeArray,prices);
    changeShares(roomID,userID,dayIndex,changeArray);

    return true;
}

export const getShares = async (roomID, userID) => {
    const userData = await getUserData(roomID,userID);
    return userData.currentShares;
}

export const getCash = async (roomID, userID) => {
    const userData = await getUserData(roomID,userID);
    return userData.money_left;
}

export const getRoomData = async (roomID) => {
    return await db.collection('Rooms').doc(roomID).get().data();
}

export const getNetWorth = async (roomID, userID) => {
    await updateNetWorth(roomID, userID);
    const userData = await getUserData(roomID, userID);
    return userData.net_worth;
}

//TODO: this method can be called many times, which leads to latency due to a lot of awaits. See if can pass userData from other methods
export const updateNetWorth = async (roomID, userID) => {
    const dayIndex = await getDayIndex(roomID);
    const prices = await getPrices(roomID, dayIndex);
    const userData = await getUserData(roomID, userID);
    const userRef = getUserRef(roomID, userID);
    const curShares = userData.curShares;
    var netWorth = userData.money_left;
    curShares.map((numShares,idx) => {netWorth += numShares * prices[idx];});
    if (userData.net_worth == netWorth) return;
    await userRef.update({net_worth: netWorth});
}

// retrieves symbol name given the symbol's index
export const getSymbolNameFromIndex = async (db, roomID, symbolIndex) => {
    const roomDoc = await db.collection('Rooms').doc(roomID).get();
    const symbols = roomDoc.data().symbols;
    return symbols[symbolIndex];
}