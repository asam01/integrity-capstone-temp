import datetime as dt
from datetime import datetime
from ta.trend import ADXIndicator
from dateutil.relativedelta import relativedelta
import os
import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
# Uncomment this when we start using earnings
# from yahoo_earnings_calendar import YahooEarningsCalendar 
'''
We're using yfinance for this, because Finnhub does not offer dividends for free.
Params: Symbol(String)
Returns:If the company is a dividend company it gives the latest dividend yearly, 
otherwise, it gives a -1 to tell the function caller it is a non paying dividend company.

'''
def getLatestDividend(symbol):
   stock = yf.Ticker(symbol)
   dividend = stock.dividends
   latest = dividend.last('1D')
   if(len(latest.values.tolist()) > 0):
      value = latest.values.tolist()[0]
   else:
      print("This company does not pay dividends")
      return -1
   value *=4 # Its an annual dividend
   return value

#TODO: Make get earnings calendar so we can add alerts for the game
# def getEarningsDate()
'''
Paramaters: 
Data-A pandas dataframe of the Closing data of a stock 
Time-window-Default:14(Period of time used for calculation)

Return
-a Pandas dataframe of the rsi values for the period of the data specified 
with the exception of the last (time_window) days
Columns:RSI

'''
def getRSIList (data, time_window):
    data = data.Close
    diff = data.diff(1).dropna()        # diff in one field(one day)

    # this preservers dimensions off diff values
    up_chg = 0 * diff
    down_chg = 0 * diff
    
    # up change is equal to the positive difference, otherwise equal to zero
    up_chg[diff > 0] = diff[ diff>0 ]
    
    # down change is equal to negative deifference, otherwise equal to zero
    down_chg[diff < 0] = diff[ diff < 0 ]
    
    up_chg_avg   = up_chg.ewm(com=time_window-1 , min_periods=time_window).mean()
    down_chg_avg = down_chg.ewm(com=time_window-1 , min_periods=time_window).mean()
    
    rs = abs(up_chg_avg/down_chg_avg)
    rsi = 100 - 100/(1+rs)

    rsi.name = 'RSI'
    rsi.columns = 'RSI'

    return rsi

'''
Paramaters: 
Data-A pandas dataframe of the High low and closing data of a stock


Return
-a Pandas dataframe of the ADX values for the period of the data specified
 and positive and negative directional indicators
Colums are ['adx','pos_directional_indicator','neg_directional_indicator']

'''
def getADXList(data):
   adxI = ADXIndicator(data['High'],data['Low'],data['Close'],14,False)
   data['pos_directional_indicator'] = adxI.adx_pos()
   data['neg_directional_indicator'] = adxI.adx_neg()
   data['adx'] = adxI.adx()
   return data[['pos_directional_indicator','neg_directional_indicator','adx']]

'''
Paramaters: 
Data-A pandas dataframe  closing data of a stock.
Days-An integer specifing the type of SMA(Usually 50 or 200)

Return
-a Pandas dataframe of the SMA values for the period of the data specified
Colums are [' X Days SMA']

'''
def getSMAList(data,days):
   SMAList = data.Close.rolling(window=days).mean()
   SMAList.name = str(days) + ' Day SMA'
   return SMAList  
   
'''
Paramaters: 
Data-A pandas dataframe  closing data of a stock.
Days-An integer specifing the type of EMA(Usually 10)

Return
-a Pandas dataframe of the SMA values for the period of the data specified
Colums are [' X Days EMA']

'''
def getEMAList(data,days):
   EMAList = data.Close.ewm(span=days, adjust=False).mean()
   EMAList.name = str(days) + ' Day EMA'
   return EMAList

'''
Paramaters: 
Data-A pandas dataframe  closing data of a stock.
Return
-a Pandas dataframe of the MACD values for the period of the data specified 
as well as the corresponding signal
Colums are ['MACD','Signal']

'''
def getMACDList(data):
   EMA12 = data.Close.ewm(span=12).mean()
   EMA26 = data.Close.ewm(span=26).mean()
   MACD = (EMA12 - EMA26)
   MACDSignal = MACD.ewm(span=9).mean()
   MACD  = pd.concat([MACD, MACDSignal], axis=1)
   MACD.columns = ['MACD','Signal']
   return MACD


'''
Paramaters: 
Symbol- A string of the stock symbol
periodLen- 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
end-date- The last date of the period in format 2017-08-10 00:00:00
Return
-a Pandas dataframe all technical indicators for that time period
Colums are 
['MACD','Signal','10 Day EMA','50 Day SMA','200 Day SMA','adx',
'pos_directional_indicator','neg_directional_indicator','RSI']

'''
def getAllTechnicalIndicators(symbol,end_date,period):
   stock = yf.Ticker(symbol)
   data = stock.history(period=period,end = end_date, interval="1D")
   MACD = getMACDList(data)
   EMA10 = getEMAList(data,10)
   SMA50 = getSMAList(data,50)
   SMA200 = getSMAList(data,200)
   ADX = getADXList(data)
   RSI = getRSIList(data,14)
   TechI = pd.concat([MACD,EMA10,SMA50,SMA200,ADX,RSI],axis=1)
   TechI.index = TechI.index.to_series().dt.strftime('%Y-%m-%d  %H:%M:%S')
   return TechI