import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import {db} from "../firebase";

const STARTING_MONEY = 10000;


export const addUser = (starting_money,gameId,nickname,numDays,numSymbols) => {
  const gameRef = db.collection('Rooms').doc(gameId);
  const userRef = gameRef.collection('users').doc();
  const userId = userRef.id;
  const empArray = Array.from(Array(numSymbols),()=>0);

  const gameInfo = {
      nickname: nickname,
      net_worth: starting_money,
      money_left: starting_money,
      currentShares: empArray,
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

// sets up the room to store symbols, indicator graphs, time series,
// and default portfolio values
export const setUpRoom = (db,symbolsL,Rounds,password) => {
  const roomRef = db.collection('Rooms').doc();
  roomRef.set({
      day_index: 0,
      phase: 'no-host',
      password: password,
  });
  const roomID = roomRef.id;
  initDates(db,symbolsL,Rounds).then((datesD)=> {
      roomRef.update({
          symbols: symbolsL,
          dates: datesD["dates"],
      });
      initializeQuiz(symbolsL,roomID,datesD["period"],datesD["dates"]);
  });
  return roomID;
}

export const getUserShares = async (db, roomID, userID, dayIndex) => {
  const userInvRef = db.collection('Rooms').doc(roomID)
    .collection('users').doc(userID).collection('investments').doc(dayIndex);
  const userInvDoc =  await userInvRef.get();
  const invDocData = userInvDoc.data();
  return invDocData.change;
}

export const getChartUrl = async (db, roomID, symbol, endDate) => {
  let images = await db.collection('Rooms').doc(roomID).collection(symbol).doc('images').get();
  let imagesData = images.data();
  return imagesData["Stockpublic_image_url"][endDate];
}

export const getTechnicalUrl = async (db, roomID, symbol, endDate) => {
  let images = await db.collection('Rooms').doc(roomID).collection(symbol).doc('images').get();
  let imagesData = images.data();
  return [imagesData["ADXpublic_image_url"][endDate],imagesData["MACDpublic_image_url"][endDate],imagesData['RSIpublic_image_url']]
}

function randomDate(start, end) {
  var date = new Date(+start + Math.random() * (end - start));
  return date;
}

// gets dates in equally spaced intervals for which to retrieve stock data
// note: Minimum Period is 1Month
export const initDates = async (db, symbols, Rounds) => {
  let Stocks= await db.collection("Ticker-Info").doc("Stock").collection("Stocks")
    .where("Symbol","in",symbols).get();

  let IPOyearMax = 0;
  let today = new Date();
  let year = today.getFullYear();

  Stocks.forEach(function(Stock) {
      if (IPOyearMax < Stock.data().IPOyear){
        IPOyearMax = Stock.data().IPOyear;
      }
  });
  
  // No more than 7 rounds(Periods are measured in months)
  let min_window_size = 3;
  let yearDiff = year - (IPOyearMax+1);
  let maximum_period = Math.floor(((yearDiff * 12)  - min_window_size) / Rounds);
  let random_period =  Math.floor((Math.random()  * (maximum_period - min_window_size))+min_window_size);
  let startDate = new Date(IPOyearMax + 1, 1, 1);
  let endDate =  new Date(IPOyearMax + 1, 1 + random_period, 1);
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
  return datesD;
}

// chooses random symbols to be used during the game
function atLeastTwo(a,b,c) {
  return a ? (b || c) : (b && c);
}
// Return a list of symbols used in the configuration process.
export const initSymbols = async(db,Industry,Sector,MarketCap,NumOfSymbols) =>{
  let symbols = [];
  if(atLeastTwo(Industry,Sector,MarketCap)){
      //In the case where a person wants to query using multiple features it may return a larger request, 
      //so we send it to the backend
      let formData = new FormData();
      if(Industry)
          formData.append('Industry',Industry);
      if(Sector)
          formData.append('Sector',Sector);
      if(MarketCap)
          formData.append('MarketCap',MarketCap);
      formData.append('NumOfSymbols',NumOfSymbols);
      var token =  localStorage.getItem('Token');
      try{
          let response = await fetch('https://us-central1-integrity-step-capstone.cloudfunctions.net/get_symbols ', {
              method: 'POST',
              body: formData,
              headers: {
                Authorization: (' Bearer ' + token)
              }
          })
          let symbolJson = await response.json();
          if (symbolJson.hasOwnProperty("Error")){
              console.log("No Symbols for your query")
              return symbols;
          }
          symbols = symbolJson['symbols'];
      }
      catch(error){
          console.log("Error with Query: " + error);
      }

  }
  // All of the rest of the values use a search by Xpos to make the query as small as possible(O(numOfSymbols))
  else if(Industry !== null){

      let IndustryInfo =  await db.collection("Ticker-Info").doc("Industry").get();
      let numOfIndustries= IndustryInfo.data().Industry[Industry];
      let cutoff = Math.floor((Math.random()  * (numOfIndustries - NumOfSymbols))+NumOfSymbols);
      let Industries = await db.collection("Ticker-Info").doc("Stock").collection("Stocks")
          .where("Industry","==",Industry)
          .where("IndustryPos","<=", cutoff)
          .orderBy("IndustryPos").limit(NumOfSymbols).get();
      Industries.forEach(function(doc){
          symbols.push(doc.data().Symbol);
      })
  }
  else if(MarketCap !== null){
      let MarketCapInfo = await db.collection("Ticker-Info").doc("Market-Cap").get();
      let numStocks= MarketCapInfo.data().MarketCap[MarketCap];
      let cutoff = Math.floor((Math.random()  * (numStocks - NumOfSymbols))+NumOfSymbols);
      let Stocks = await db.collection("Ticker-Info").doc("Stock").collection("Stocks")
          .where("MarketCapSize","==",MarketCap)
          .where("MarketCapPos","<=", cutoff)
          .orderBy("MarketCapPos").limit(NumOfSymbols).get();
      Stocks.forEach(function(doc){
          symbols.push(doc.data().Symbol);
      })
  }
  else if(Sector !== null){

      let SectorInfo =  await db.collection("Ticker-Info").doc("Sector").get();
      let numOfSectors= SectorInfo.data().Sector[Sector];
      let cutoff = Math.floor((Math.random()  * (numOfSectors - NumOfSymbols))+NumOfSymbols);
      let Sectors = await db.collection("Ticker-Info").doc("Stock").collection("Stocks")
          .where("Sector","==",Sector)
          .where("SectorPos","<=", cutoff)
          .orderBy("SectorPos").limit(NumOfSymbols).get();
      Sectors.forEach(function(doc){
          symbols.push(doc.data().Symbol);
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
          symbols.push(Stock.data().Symbol);
      })

  }
  return symbols;
}

// requests prices and technical indicator images to be written to the database
export const initializeQuiz = async (symbols, roomId, periodLen, endDates) => {
  var formData = new FormData();
  formData.append('symbol',JSON.stringify(symbols));
  formData.append('RoomId',roomId);
  formData.append('end-date',JSON.stringify(endDates));
  var token =  localStorage.getItem('Token');
  try{
      let response = await fetch("/get_prices", {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: ("Bearer " + token)
        },
      })
      console.log(response);
  }
  catch(err) {
      console.log("Error is " +  err)
  }
  formData.append('periodLen',periodLen)
  try{
      let response  = await fetch('/get_stock_image', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization:("Bearer " + token)
          }
      })
      console.log(await response.json());
  }
  catch(error){
      console.log("Error is " +  error)
  }
}

// gets a list of all symbols being tracked
export const getSymbols = async (db, roomID) => {
  const symbol = await db.collection('Rooms').doc(roomID).get();
  const symbolData = await symbol.data();
  return symbolData.symbols;
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

export const getDayIndex = async (roomID) => {
  const roomData = await getRoomData(roomID);
  return roomData.day_index;
}


export const getDate = async (db, roomID) => {
  const roomDoc = await db.collection('Rooms').doc(roomID).get();
  const roomData = roomDoc.data();
  return roomData.dates[roomData.day_index];
}

// returns current price for all symbols being tracked
export const getCurrentPrice = async (db, roomID) => {
  const roomDoc = await db.collection('Rooms').doc(roomID).get();
  const roomData = roomDoc.data();
  const dayIndex = roomData.day_index;
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
function compDoc(a, b){
  if ( a.value < b.value ) {
      return -1;
  }
  if ( a.value > b.value ) {
    return 1;
  }
  return 0;
}

export const getIndustries = async (db) => {
  let Industries = await db.collection("Ticker-Info").doc("Industry").get();
  let IndustryData =  Industries.data().Industry;
  let IndustryList = [];
  for(const Industry in IndustryData) {
    IndustryList.push({value: Industry, label: Industry});
  }
  IndustryList.push({value: null, label: "None"});
  IndustryList.sort(compDoc);
  return IndustryList;
}

export const getSectors = async (db) => {
  let Sectors = await db.collection("Ticker-Info").doc("Sector").get();
  let SectorData =  Sectors.data().Sector;
  let SectorList = [];
  for(const Sector in SectorData) {
    SectorList.push({value: Sector, label: Sector});
  }
  SectorList.push({value: null, label:"None"});
  SectorList.sort(compDoc);
  return SectorList;
}

export const getMarketCaps = async (db) => {
  let MarketCaps = await db.collection("Ticker-Info").doc("Market-Cap").get();
  let MarketCapData =  MarketCaps.data().MarketCap;
  let MarketCapList = [];
  for(const Stock in MarketCapData) {
    MarketCapList.push({value: Stock, label: Stock});
  }
  MarketCapList.push({value: null, label:"None"});
  MarketCapList.sort(compDoc);
  return MarketCapList;
}

// advances to the next round (day) in the game or returns that the game is over
export const advanceDay = async (db, roomID) => {
  const roomRef = db.collection('Rooms').doc(roomID);
  const data = await roomRef.get();
  const roomData = data.data();

  if(roomData.day_index < roomData.dates.length) {
    roomRef.update({
      day_index: firebase.firestore.FieldValue.increment(1)
    });
    return 1;
  }
  else {
    return 0;
  }
}

// gets user document data
export const getUserData = async (roomID, userID) => {
  const userDoc = await db.collection('Rooms').doc(roomID).collection('users').doc(userID).get();
  return userDoc.data();
}

export const getUserRef = (roomID, userID) => {
  return db.collection('Rooms').doc(roomID).collection('users').doc(userID);
}

// verify that the user has enough money/shares to complete trade
export const verifyOk = async (roomID, userID, dayIndex, changeArray, prices) => {

  var consistentInvestment = true;
  const userRef = getUserRef(roomID, userID);
  const userData = await getUserData(roomID, userID);

  var curArray = userData.currentShares;
  var sum = curArray.map(function(num, idx) {return num + changeArray[idx];});
  consistentInvestment = consistentInvestment && sum.every((e) => e >= 0);

  // check cash ok
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
  const investRef = userRef.collection('investments').doc(dayIndex.toString());
  const userData = await getUserData(roomID,userID);

  // update currentShares array
  var curArray = userData.currentShares;
  var sum = curArray.map(function(num,idx) {return num + changeArray[idx];});
  userRef.update({currentShares: sum});

  // TODO: current have a separate call for investment. Consider accessing it through userData to save time
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
  updateNetWorth(roomID, userID, dayIndex, prices);

  return true;
}
export const getCurrentShares = async (roomID, userID) => {
  const userData = await getUserData(roomID,userID);
  return userData.currentShares;
}

export const getCash = async (roomID, userID) => {
  const userData = await getUserData(roomID,userID);
  return userData.money_left;
}

export const getRoomData = async (roomID) => {
  const roomDoc = await db.collection('Rooms').doc(roomID).get();
  return roomDoc.data();
}

export const getNetWorth = async (roomID, userID) => {
  const userData = await getUserData(roomID, userID);
  return userData.net_worth;
}

export const updateNetWorth = async (roomID, userID, dayIndex, prices) => {
  const userData = await getUserData(roomID, userID);
  const userRef = getUserRef(roomID, userID);

  const currentShares = userData.currentShares;
  var netWorth = userData.money_left;
  currentShares.map((numShares,idx) => {netWorth += numShares * prices[idx];});
  userRef.update({net_worth: netWorth});
}

// retrieves symbol name given the symbol's index
export const getSymbolNameFromIndex = async (db, roomID, symbolIndex) => {
  const roomDoc = await db.collection('Rooms').doc(roomID).get();
  const symbols = roomDoc.data().symbols;
  return symbols[symbolIndex];
}
