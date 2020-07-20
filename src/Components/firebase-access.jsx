import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const STARTING_MONEY = 10000;

export const setUpRoom = (db,NumOfSymbols,Rounds,userID,password) => {
    const roomRef = db.collection('Rooms').doc();
    roomRef.set({
        day_index: 0,
        phase: 'no-host',
        password: password,
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

    // const usersRef = roomRef.collection('users');
    // const userRef = usersRef.doc(userID);
    // console.log("SetUp room was called")

    // const gameInfo = {
    //     investments: [],
    //     personal_value: STARTING_MONEY,
    //     money_left: STARTING_MONEY,
    //     gains: 0,
    //     losses: 0,
    // }
    // await fetch(userRef.set(gameInfo));
    return roomID;
}

export const getUserShares = async (db, roomID, userID) => {
    const userRef = db.collection('Rooms').doc(roomID)
        .collection('users').doc(userID);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    return userData.investments;
}

export const getUserBalance = async (db, roomID, userID) => {
    const userRef = db.collection('Rooms').doc(roomID)
        .collection('users').doc(userID);

    const userDoc = await userRef.get();
    const userData = userDoc.data();
    return userData.money_left;
}

export const getChartUrl = async (db,roomId,symbol,endDate) =>{
    let images = await db.collection('Rooms').doc(roomId).collection(symbol).doc('images').get();
    let imagesData = images.data();
    return imagesData["Stockpublic_image_url"][endDate]
}

export const getTechnicalUrl = async (db, roomId, symbol, endDate) => {
    let images = await db.collection('Rooms').doc(roomId).collection(symbol).doc('images').get();
    let imagesData = images.data();
    return imagesData["Stockpublic_image_url"][endDate]
}

function randomDate(start, end) {
    var date = new Date(+start + Math.random() * (end - start));
    return date;
}

// Minimum Period is 1Month
export const initDates = async (db, symbols, Rounds) => {
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

export const initSymbols = async(db,Industry,Sector,NumOfSymbols) =>{
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

export const getSymbols = async (db,roomID) =>{
    const symbol = await db.collection('Rooms').doc(roomID).get();
    const symbolData = await symbol.data();
    return symbolData.symbols;
}

export const getDate = async (db, roomID) => {
    const roomDoc = await db.collection('Rooms').doc(roomID).get();
    const roomData = roomDoc.data();
    return roomData.dates[roomData.day_index];
}


export const getCurrentPrice = async (db,symbol,roomID) => {
    try {
        const Price = await db.collection('Rooms').doc(roomID).collection(symbol).doc('Prices').get();
        const priceData = Price.data();
        try {
            const data = await db.collection('Rooms').doc(roomID).get()
            const roomData = data.data();
            return priceData.prices[roomData.day_index];
        } catch(error) {
            console.log("Error is " +  error)
        }
    } catch(error){
        console.log("Error is " +  error)
    }
}

export const advanceDay = async (db, roomID) => {
    const roomRef = await db.collection('Rooms').doc(roomID);
    const data = await roomRef.get();
    const roomData = data.data();
    if(roomData.day_index < roomData.dates.length){
        roomRef.update({
            day_index: firebase.firestore.FieldValue.increment(1)
        });
        return 1
    }
    else{
        return 0;
    }
}

export const makeInvestment = (db, roomID, userID, symbol, price, num_shares) => {

    const invJSON = {
        "symbol": symbol,
        "share_price": price,
        "num_shares": num_shares,
        "total_purchase_price": (price * num_shares)
    }

    const userRef = db.collection('Rooms').doc(roomID)
        .collection('users').doc(userID);

    const moneySpent = (price * num_shares) * -1;

    // add investment and update money_left
    userRef.update({
        investments: firebase.firestore.FieldValue.arrayUnion(invJSON),
        money_left: firebase.firestore.FieldValue.increment(moneySpent)
    });
}