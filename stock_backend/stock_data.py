import firebase_admin
from flask import Flask, render_template, request
from flask_cors import CORS
from firebase_admin import credentials,firestore,storage
from Plot import SaveAllImages
from dateutil.relativedelta import relativedelta
import requests
import IntrinsicValue
import yfinance as yf
import datetime
import random
import numpy as np
import json

cred = credentials.Certificate("integrity-step-capstone-firebase-adminsdk-6oh0x-842f5d86d9.json")

firebase_admin.initialize_app(cred,{
    'storageBucket': 'integrity-step-capstone.appspot.com'
})

firebase_request_adapter = requests.Request()

app = Flask(__name__)
app.secret_key = "" # Secret key can't be on github
app.config['SESSION_TYPE'] = 'filesystem'
app.config['IMAGES'] = 'images/'
CORS(app)
db = firestore.client()
bucket = storage.bucket()

'''
Params:
Symbol- A string of the stock symbol
periodLen- 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
roomId- A string of the roomID
end-date- The last date of the period in format 2017-08-10 00:00:00

Returns:
A success code and it uploads the image to firebase cloud storage.
'''
@app.route('/get-stock-image',methods=['POST'])
def get_stock_image():
    symbols = json.loads(request.form['symbol'],encoding="utf-8")
    period = request.form['periodLen']
    roomID = request.form['RoomId']
    end_dates = json.loads(request.form['end-date'],encoding="utf-8")
    img  ={}
    RSIDict = {}
    MACDDict = {}
    ADXDict = {}
    StockDict = {}
    for symbol in symbols:
        for end_date in end_dates:
            SaveAllImages(symbol,end_date,int(period),roomID)

            expiration_date = datetime.date.today()+ relativedelta(days=2)
            exp_date_Time = datetime.datetime(
                year=expiration_date.year, 
                month=expiration_date.month,
                day=expiration_date.day,
            )

            RSIblob = bucket.blob(symbol + ' ' + roomID + ' ' +end_date + ' RSI Stock')
            RSIblob.upload_from_filename('images/' + symbol + ' ' + roomID + ' ' +end_date + ' RSI Stock.png')
            RSIDict[end_date] = RSIblob.generate_signed_url(expiration=exp_date_Time,
                                        version='v4')

            MACDblob = bucket.blob(symbol + ' ' + roomID + ' ' +end_date + ' MACD Stock')
            MACDblob.upload_from_filename('images/' + symbol + ' ' + roomID + ' ' +end_date + ' MACD Stock.png')
            MACDDict[end_date] = MACDblob.generate_signed_url(expiration=exp_date_Time,
                                        version='v4')

            ADXblob = bucket.blob(symbol + ' ' + roomID + ' ' +end_date + ' ADX Stock')
            ADXblob.upload_from_filename('images/' + symbol + ' ' + roomID + ' ' +end_date + ' ADX Stock.png')
            ADXDict[end_date] = ADXblob.generate_signed_url(expiration=exp_date_Time,
                                        version='v4')

            Stockblob = bucket.blob(symbol + ' ' + roomID + ' ' +end_date + ' Stock')
            Stockblob.upload_from_filename('images/' + symbol + ' ' + roomID + ' ' +end_date + ' Stock.png')
            StockDict[end_date] = Stockblob.generate_signed_url(expiration=exp_date_Time,
                                        version='v4')
    
            img = {
                    'RSIpublic_image_url':RSIDict,
                    'MACDpublic_image_url':MACDDict,
                    'ADXpublic_image_url':ADXDict,
                    'Stockpublic_image_url':StockDict,
            }
            db.collection('Rooms').document(roomID).collection(symbol).document('images').set(img)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

@app.route('/get-symbols',methods=['POST'])
def get_symbols():
    Industry = request.form['Industry']
    Sector = request.form['Sector']
    Num_of_Symbols = request.form['NumOfSymbols']

    IndSect = db.collection("Ticker-Info").doc("Stock").collection("Stocks").where("Industry","==",Industry) \
    .where("Sector","==", Sector).stream()
    num_of_stocks = 0
    symbols = []
    for stock in IndSect:
        num_of_stocks+=1
        symbols.append(stock.to_dict()['Stock Data']['Symbol'])

    responseD ={}
    if num_of_stocks == 0:
         responseD = {
            "Error":"No Symbols match the query"
        }
    elif num_of_stocks < Num_of_Symbols:
        responseD = {
            "symbols": symbols
        }
    else:
        responseD = {
            "symbols": random.choices(symbols,k=Num_of_Symbols)
        }

    response = app.response_class(
        response=json.dumps(responseD),
        status=200,
        mimetype='application/json'
    )
    return response
    

'''
Params:
Symbol- A string of the stock symbol
periodLen- 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
roomId- A string of the roomID
end-date- The last date of the period in format 2017-08-10 00:00:00

Returns:
A success code and it uploads the indicators to cloud storage
'''
@app.route('/get-technical-indicators',methods=['POST'])
def tech_indic():
    symbol = request.form['symbol']
    period = request.form['periodLen']
    roomID = request.form['RoomId']
    end_date = request.form['end-date']
    TechI = IntrinsicValue.getAllTechnicalIndicators(symbol,end_date,period)
    TechDict = TechI.to_dict(orient='index')
    db.collection('Rooms').document(roomID).collection(symbol).document('technical-indicators').set(TechDict)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

'''
Params:
Symbol-A string of the stock symbol
roomId
• The id of the room 
End-date
Ex:2006-06-15 00:00:00
Response:
It creates a json file of the corresponding data, or if the limit's been reached it will queue until the request gets data
'''
@app.route('/get-prices',methods=['POST'])
def time_series():
    symbols = json.loads(request.form['symbol'],encoding="utf-8")
    roomID = request.form['RoomId']
    end_dates = json.loads(request.form['end-date'],encoding="utf-8")
    for symbol in symbols:
        stock = yf.Ticker(symbol)
        prices = []
        for i in end_dates:
            hist  = stock.history(period="1D",start=i)
            Close = hist[['Close']]
            prices.append(Close.values.tolist()[0][0])
        price = {
            'prices': prices
        }
        db.collection('Rooms').document(roomID).collection(symbol).document('Prices').set(price)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
     
if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.

    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='localhost', port=8080, debug=True)