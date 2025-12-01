from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any
import joblib
import pandas as pd
import os

# Importa a função nova que criamos acima
from app.ml.training_service import run_training_pipeline 

app = FastAPI(title="Adega Stock IA")

# Caminho absoluto para evitar erros de "arquivo não encontrado"
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "data/stock_model.pkl")

model = None

# ... (Mantenha suas classes BaseModel aqui se tiver) ...
class StockQuery(BaseModel):
    target_date: str
    product_id: int
    product_name: str
    current_stock: int

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print(f"MODELO CARREGADO: {MODEL_PATH}")
        except:
            print("Erro ao carregar modelo. Necessário re-treinar.")
    else:
        print(f"Modelo não encontrado em {MODEL_PATH}. Use o botão de treino no App.")

@app.post("/retrain-model")
def trigger_retraining():
    """
    Rota chamada pelo botão 'Cérebro' no App.
    """
    success, message = run_training_pipeline()
    
    if success:
        # Recarrega o modelo na memória imediatamente
        load_model()
        return {"status": "success", "message": message}
    else:
        raise HTTPException(status_code=500, detail=message)

@app.post("/predict-stock")
def predict_stock(query: StockQuery):
    if not model:
        raise HTTPException(status_code=503, detail="IA não treinada. Clique no cérebro para treinar.")

    # Converte data string para features
    from datetime import datetime
    try:
        dt = datetime.strptime(query.target_date, "%Y-%m-%d")
    except:
        dt = datetime.now()
        
    # Monta o DataFrame com as mesmas colunas do treino
    features = pd.DataFrame([{
        'product_id': query.product_id,
        'month': dt.month,
        'day_of_week': dt.weekday(),
        'is_weekend': 1 if dt.weekday() >= 5 else 0
    }])
    
    try:
        prediction = int(model.predict(features)[0])
    except:
        prediction = 0 # Fallback se der erro
        
    final_stock = query.current_stock - prediction
    
    return {
        "product": query.product_name,
        "prediction": {
            "estimated_sales": prediction,
            "projected_stock_end_of_day": final_stock
        }
    }