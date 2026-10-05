# from fastapi import FastAPI
# from pydantic import BaseModel
# import nltk
# from nltk.sentiment import SentimentIntensityAnalyzer
# from sklearn.linear_model import LinearRegression
# from sklearn.preprocessing import LabelEncoder
# import numpy as np

# nltk.download('vader_lexicon', quiet=True) #kita buat quiet agar tidak muncul output di console

# app = FastAPI(title= "JasaGo ML Service")
# sia = SentimentIntensityAnalyzer()

# class TextInput(BaseModel):
#     text:str

# class predictHarga(BaseModel):
#     category: str
#     location: str
#     title: str
#     training_data: list[dict]

# @app.post("/analyze-statement")
# def analyze_statement(body: TextInput):
#     scores = sia.polarity_scores(body.text) #Ini artinya supaya mengambil nilai compound, pos, neg, dan neu dari text yang diinputkan
#     compound = scores['compound'] # Compount itu dari hasil analisis sentiment, nilainya antara -1 sampai 1. Semakin mendekati 1 maka semakin positif, semakin mendekati -1 maka semakin negatif, dan jika mendekati 0 maka netral.
#     if compound >= 0.5:
#         label = "Sangat Positif"
#     elif compound >= 0.05:
#         label = "Positif"
#     elif compound <= -0.5:
#         label = "Sangat Negatif"
#     elif compound <= -0.05:
#         label = "Negatif"
#     else:
#         label = "Netral"

#     return {
#         "label" : label,
#         "compound" : compound,
#         "positive" : scores['pos'],
#         "negative" : scores['neg'],
#         "neutral" : scores['neu']
#     }

# @app.post("/predict-price")
# def predict_harga(body:predictHarga):
#     training = body.training_data
#     if len(training) < 5:
#         return { "predicted_price": None,
#             "min_price": None,
#             "max_price": None,
#             "based_on": len(training),
#             "message": "Data belum cukup untuk prediksi (minimal 5 service).",
#         }
#     # ========== PROTEKSI 1: FILTER OUTLIER ==========
#     prices_all = sorted([float(t["price"]) for t in training])
#     n = len(prices_all)

#     if n >= 10:
#         # Buang 10% termurah & 10% termahal
#         lower_bound = prices_all[int(n * 0.1)]
#         upper_bound = prices_all[int(n * 0.9)]
#         training = [
#             t for t in training
#             if lower_bound <= float(t["price"]) <= upper_bound
#         ]

#     # ========== PROTEKSI 2: MINIMAL HARGA ==========
#     MIN_PRICE = 50000

#     categories = [t['category'] or " " for t in training] + [body.category]
#     locations = [t['location'] or " " for t in training] + [body.location]
#     titles = [t['title'] or " " for t in training] + [body.title]
#     prices = [float(t['price']) for t in training]

#     #Encode the features
#     le_category = LabelEncoder()
#     le_locations = LabelEncoder()
#     le_category.fit(categories)
#     le_locations.fit(locations)

#     X = []
#     for i in range(len(training)):
#         X.append([
#             le_category.transform([categories[i]])[0],
#             le_locations.transform([locations[i]])[0],
#             len(titles[i] or " ")
#         ])

#     X = np.array(X)
#     y = np.array(prices)

#     #Training the Model
#     model = LinearRegression()
#     model.fit(X, y)
#     if body.category not in le_category.classes_: #Ini artinya kalau category yang diinputkan belum ada di training data, maka akan ditambahkan ke list classes_ dari le_category
#         le_category.classes_ = np.append(le_category.classes_, body.category)
#     if body.location not in le_locations.classes_:
#         le_locations.classes_ = np.append(le_locations.classes_, body.location)
    
#     X_new = np.array([[
#         le_category.transform([body.category])[0],
#         le_locations.transform([body.location])[0],
#         len(body.title or " ")
#     ]])

#     predict_result = float(model.predict(X_new)[0])
#     predicted = max(predict_result, MIN_PRICE)

#     similar = [
#         float(t['price']) for t in training
#         if (t.get('category') or "") == body.category and body.location.lower() in (t.get("location") or "").lower()
#     ]
#     if not similar:
#         similar = [float(t["price"]) for t in training if t["category"] == body.category]
#     if not similar:
#         similar = prices

#     min_price = max(min(similar), MIN_PRICE)
#     max_price = max(similar)

#     predicted = round(predicted / 1000) * 1000
#     min_price = round(min_price / 1000) * 1000
#     max_price = round(max_price / 1000) * 1000

#     return {
#         "predicted_price": predicted,
#         "min_price": min_price,
#         "max_price": max_price,
#         "based_on": len(training),
#         "similar_count": len(similar),
#         "message": f"Berdasarkan {len(training)} data service (setelah filter outlier).",
#     }


# @app.get("/")
# def root():
#     return("ML Service is Running !")

# @app.get("/health")
# def health():
#     return {"status": "ok"}

#Ini untuk deployment agar tidak berat di Replit!
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="JasaGo ML Service")


class TextInput(BaseModel):
    text: str


class PredictInput(BaseModel):
    category: str
    location: str
    title: str
    training_data: list[dict]


# ================== SENTIMENT (Kamus Indonesia) ==================
POSITIVE_WORDS = ["bagus", "baik", "berkualitas", "memuaskan", "sempurna", "mantap", "keren", "top", "luar biasa", "profesional", "rapi", "bersih", "terbaik", "hebat", "membantu", "cepat", "tepat waktu", "sigap", "ramah", "sopan", "peduli", "responsif", "sabar", "jujur", "murah", "terjangkau", "worth it", "sebanding", "puas", "senang", "suka", "rekomendasi", "untung"]
NEGATIVE_WORDS = ["buruk", "jelek", "parah", "asal", "kotor", "mengecewakan", "tidak profesional", "lambat", "telat", "terlambat", "lama", "kasar", "tidak sopan", "cuek", "malas", "bohong", "curang", "mahal", "kemahalan", "rugi", "kecewa", "menyesal", "tidak puas"]
NEGATION_WORDS = ["tidak", "bukan", "belum", "kurang", "jangan", "nggak", "gak"]

@app.post("/analyze-sentiment")
def analyze_sentiment(body: TextInput):
    if not body.text or not body.text.strip():
        return {"label": "Netral", "compound": 0.0, "positive": 0, "negative": 0}
    text = body.text.lower()
    words = text.split()
    score = 0
    pos_count = 0
    neg_count = 0
    for i, word in enumerate(words):
        is_negated = i > 0 and words[i - 1] in NEGATION_WORDS
        for pos_word in POSITIVE_WORDS:
            if pos_word in word:
                if is_negated:
                    score -= 1
                    neg_count += 1
                else:
                    score += 1
                    pos_count += 1
                break
        for neg_word in NEGATIVE_WORDS:
            if neg_word in word:
                if is_negated:
                    score += 1
                    pos_count += 1
                else:
                    score -= 1
                    neg_count += 1
                break
    if score >= 2: label = "Sangat Positif"
    elif score == 1: label = "Positif"
    elif score == -1: label = "Negatif"
    elif score <= -2: label = "Sangat Negatif"
    else: label = "Netral"
    total = pos_count + neg_count
    compound = score / total if total > 0 else 0.0
    return {"label": label, "compound": round(compound, 4), "positive": pos_count, "negative": neg_count, "neutral": 1 if score == 0 else 0}


# ================== PRICE PREDICTION (Mean-Based) ==================
@app.post("/predict-price")
def predict_price(body: PredictInput):
    training = body.training_data
    if len(training) < 5:
        return {"predicted_price": None, "min_price": None, "max_price": None, "based_on": len(training), "message": "Data belum cukup untuk prediksi (minimal 5 service)."}

    valid_prices = [float(t["price"]) for t in training if t.get("price") and float(t["price"]) > 0]
    if len(valid_prices) < 5:
        return {"predicted_price": None, "min_price": None, "max_price": None, "based_on": len(valid_prices), "message": "Data harga tidak valid."}

    # Filter outlier
    prices_sorted = sorted(valid_prices)
    n = len(prices_sorted)
    if n >= 10:
        lower_bound = prices_sorted[int(n * 0.1)]
        upper_bound = prices_sorted[int(n * 0.9)]
        valid_prices = [p for p in valid_prices if lower_bound <= p <= upper_bound]

    # Cari data serupa
    similar = [float(t["price"]) for t in training if (t.get("category") or "").lower() == body.category.lower() and body.location.lower() in (t.get("location") or "").lower() and t.get("price") and float(t["price"]) > 0]
    if not similar:
        similar = [float(t["price"]) for t in training if (t.get("category") or "").lower() == body.category.lower() and t.get("price") and float(t["price"]) > 0]
    if not similar:
        similar = valid_prices

    predicted = sum(similar) / len(similar)
    MIN_PRICE = 50000
    predicted = max(predicted, MIN_PRICE)
    min_price = max(min(similar), MIN_PRICE)
    max_price = max(similar)

    predicted = round(predicted / 1000) * 1000
    min_price = round(min_price / 1000) * 1000
    max_price = round(max_price / 1000) * 1000

    return {"predicted_price": predicted, "min_price": min_price, "max_price": max_price, "based_on": len(valid_prices), "similar_count": len(similar), "message": f"Berdasarkan {len(similar)} service serupa."}


@app.get("/")
def root():
    return {"message": "JasaGo ML Service is running"}

@app.get("/health")
def health():
    return {"status": "ok"}