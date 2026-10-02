from fastapi import FastAPI
from pydantic import BaseModel
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
import numpy as np

nltk.download('vader_lexicon', quiet=True) #kita buat quiet agar tidak muncul output di console

app = FastAPI(title= "JasaGo ML Service")
sia = SentimentIntensityAnalyzer()

class TextInput(BaseModel):
    text:str

class predictHarga(BaseModel):
    category: str
    location: str
    title: str
    training_data: list[dict]

@app.post("/analyze-statement")
def analyze_statement(body: TextInput):
    scores = sia.polarity_scores(body.text) #Ini artinya supaya mengambil nilai compound, pos, neg, dan neu dari text yang diinputkan
    compound = scores['compound'] # Compount itu dari hasil analisis sentiment, nilainya antara -1 sampai 1. Semakin mendekati 1 maka semakin positif, semakin mendekati -1 maka semakin negatif, dan jika mendekati 0 maka netral.
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

@app.post("/predict-price")
def predict_harga(body:predictHarga):
    training = body.training_data
    if len(training) < 5:
        return { "predicted_price": None,
            "min_price": None,
            "max_price": None,
            "based_on": len(training),
            "message": "Data belum cukup untuk prediksi (minimal 5 service).",
        }
    # ========== PROTEKSI 1: FILTER OUTLIER ==========
    prices_all = sorted([float(t["price"]) for t in training])
    n = len(prices_all)

    if n >= 10:
        # Buang 10% termurah & 10% termahal
        lower_bound = prices_all[int(n * 0.1)]
        upper_bound = prices_all[int(n * 0.9)]
        training = [
            t for t in training
            if lower_bound <= float(t["price"]) <= upper_bound
        ]

    # ========== PROTEKSI 2: MINIMAL HARGA ==========
    MIN_PRICE = 50000

    categories = [t['category'] or " " for t in training] + [body.category]
    locations = [t['location'] or " " for t in training] + [body.location]
    titles = [t['title'] or " " for t in training] + [body.title]
    prices = [float(t['price']) for t in training]

    #Encode the features
    le_category = LabelEncoder()
    le_locations = LabelEncoder()
    le_category.fit(categories)
    le_locations.fit(locations)

    X = []
    for i in range(len(training)):
        X.append([
            le_category.transform([categories[i]])[0],
            le_locations.transform([locations[i]])[0],
            len(titles[i] or " ")
        ])

    X = np.array(X)
    y = np.array(prices)

    #Training the Model
    model = LinearRegression()
    model.fit(X, y)
    if body.category not in le_category.classes_: #Ini artinya kalau category yang diinputkan belum ada di training data, maka akan ditambahkan ke list classes_ dari le_category
        le_category.classes_ = np.append(le_category.classes_, body.category)
    if body.location not in le_locations.classes_:
        le_locations.classes_ = np.append(le_locations.classes_, body.location)
    
    X_new = np.array([[
        le_category.transform([body.category])[0],
        le_locations.transform([body.location])[0],
        len(body.title or " ")
    ]])

    predict_result = float(model.predict(X_new)[0])
    predicted = max(predict_result, MIN_PRICE)

    similar = [
        float(t['price']) for t in training
        if (t.get('category') or "") == body.category and body.location.lower() in (t.get("location") or "").lower()
    ]
    if not similar:
        similar = [float(t["price"]) for t in training if t["category"] == body.category]
    if not similar:
        similar = prices

    min_price = max(min(similar), MIN_PRICE)
    max_price = max(similar)

    predicted = round(predicted / 1000) * 1000
    min_price = round(min_price / 1000) * 1000
    max_price = round(max_price / 1000) * 1000

    return {
        "predicted_price": predicted,
        "min_price": min_price,
        "max_price": max_price,
        "based_on": len(training),
        "similar_count": len(similar),
        "message": f"Berdasarkan {len(training)} data service (setelah filter outlier).",
    }


@app.get("/")
def root():
    return("ML Service is Running !")

@app.get("/health")
def health():
    return {"status": "ok"}

    