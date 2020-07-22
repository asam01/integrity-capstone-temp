import pandas as pd
import json
import webbrowser
import os
import time
import math
from pathlib import Path
from dateutil.relativedelta import relativedelta
import datetime
from firebase_admin import credentials,firestore
from random import randrange
import firebase_admin
import numpy as np



cred = credentials.Certificate("integrity-step-capstone-firebase-adminsdk-6oh0x-842f5d86d9.json")
firebase_admin.initialize_app(cred,{
    'storageBucket': 'integrity-step-capstone.appspot.com'
})

db = firestore.client()

def get_download_path():
    """Returns the default downloads path for linux or windows"""
    if os.name == 'nt':
        import winreg
        sub_key = r'SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders'
        downloads_guid = '{374DE290-123F-4565-9164-39C4925E467B}'
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, sub_key) as key:
            location = winreg.QueryValueEx(key, downloads_guid)[0]
        return location
    else:
        return str(os.path.join(Path.home(), "Downloads"))
path = get_download_path()
print(path)
ans = input("Is this your download Path? Type Yes or paste your actual Download Path:")
if ans.lower() != 'y' and ans.lower() != 'yes':
    path = ans
if path[-1]  is '/':
    path[:-1]

webbrowser.open("https://old.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nasdaq&render=download")
time.sleep(3)
NASDAQ =  pd.read_csv(path  +"/companylist.csv")
os.remove(path +"/companylist.csv")
webbrowser.open("https://old.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nyse&render=download")
time.sleep(3)
NYSE =  pd.read_csv(path + "/companylist.csv")
os.remove(path +"/companylist.csv")

# Merging the NASDAQ and NYSE database
StockEx = NASDAQ.append(NYSE)

Industry =  StockEx['industry'].drop_duplicates().reset_index(drop=True)
Sector = StockEx['Sector'].drop_duplicates().reset_index(drop=True)

Stock = StockEx.drop_duplicates()

# If the IPO year is N/A it means it was established earlier than 1972.
Stock['IPOyear'].fillna(1972)

# We want at least 2 years worth of data to work with not including the present year
# So we always delete data before that.
IPOCutoff = datetime.date.today() - relativedelta(years=3)
Stock =  Stock[Stock.IPOyear <= IPOCutoff.year]
StockD =  Stock.reset_index(drop=True).to_dict(orient='index')

StockD = {str(k):v for (k,v) in StockD.items()}
StockV = StockD.values()
i = 0
random_pos = range(len(StockV))
curr_len = len(random_pos)

IndustryList = Industry.values.tolist()
SectorList = Sector.values.tolist()


IndD ={}
SectorD = {}
curr_IndL = {}
curr_SectorL = {}

#These loops get the number of stocks in each industry and sector and
# make lists to use to randomly assign a position.
for ind in IndustryList:
    stocks = Stock[Stock.industry == ind]
    if stocks.empty is not True:
        IndD[ind] = range(len(stocks.index))
        curr_IndL[ind] = len(IndD[ind])

for sect in SectorList:
    stocks = Stock[Stock.Sector == sect]
    if stocks.empty is not True:
        SectorD[sect] = range(len(stocks.index))
        curr_SectorL[sect] = len(SectorD[sect])

StocksD = {
    "NumOfStocks": curr_len,
}

IndD.pop(np.nan,None)
SectorD.pop(np.nan,None)
curr_IndL.pop(np.nan, None)
curr_SectorL.pop(np.nan,None)

IndDocument = {
    "Industry":curr_IndL
}
SectorDocument ={
    "Sector":curr_SectorL
}
db.collection('Ticker-Info').document('Industry').set(IndDocument)
db.collection('Ticker-Info').document('Sector').set(SectorDocument)
db.collection('Ticker-Info').document('Stock').set(StocksD)

for Info in StockV:
    NewD = {
        'Symbol': Info['Symbol'],
        'Name': Info['Name'], 
        'LastSale': Info['LastSale'],
        'MarketCap': Info['MarketCap'],
        'IPOyear': Info['IPOyear'],
        'Sector': Info['Sector'],
        'industry': Info['industry'], 
        'Summary Quote': Info['Summary Quote'],
        # Used to increase ease of querying
        'RandomPos' :random_pos[randrange(curr_len)],
        'IndustryPos': -1 if Info['industry'] is np.nan or Stock[Stock.industry == Info['industry']].empty else IndD[Info['industry']][randrange(curr_IndL[Info['industry']])],
        'SectorPos' : -1 if Info['Sector'] is np.nan or Stock[Stock.Sector == Info['Sector']].empty else SectorD[Info['Sector']][randrange(curr_SectorL[Info['Sector']])]
    }
    db.collection('Ticker-Info').document('Stock').collection('Stocks').document(Info['Symbol']).set(NewD)
    i+=1
    curr_len-=1
    if Info['industry'] is not np.nan:
        curr_IndL[Info['industry']]-=1 
    if Info['Sector'] is not np.nan:
        curr_SectorL[Info['Sector']]-=1
    print(str(i)+ "\\" + str(len(StockV)) + ":" + Info['Symbol'] +" has been added to the database with IPO year " +  str(Info['IPOyear']))


