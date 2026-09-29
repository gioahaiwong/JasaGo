from fastapi import FastAPI
from pydantic import BaseModel
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

nltk.download('vader_lexicon', quiet=True) #kita buat quiet agar tidak muncul output di console

app = FastAPI(title= "JasaGo ML Service")
sia = SentimentIntensityAnalyzer()

class TextInput(BaseModel):
    text:str



@app.post("/analyze-statement")
def analyze_statement(body: TextInput):
    scores = sia.polarity_scores(body.text) #Ini artinya supaya
    compound = scores['compound']
    if compound >= 0.5:
        label = "Sangat Positif"
    elif compound >= 0.05:
        label = "Positif"
    elif compound <= -0.5:
        label = "Sangat Negatif"
    elif compound <= -0.05:
        label = "Negatif"
    else:
        label = "Netral"

    return {
        "label" : label,
        "compound" : compound,
        "positive" : scores['pos'],
        "negative" : scores['neg'],
        "neutral" : scores['neu']
    }


@app.get("/")
def root():
    return("ML Service is Running !")

    