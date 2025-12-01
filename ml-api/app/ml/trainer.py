import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
from datetime import datetime, timedelta

MODEL_PATH = "data/stock_model.pkl"

def generate_sales_history(days=365):
    """
    Gera um histórico fictício de 1 ano de vendas
    para treinar a IA a entender padrões de consumo.
    """
    data = []
    start_date = datetime.now() - timedelta(days=days)
    
    # IDs fictícios: 1=Hamburguer, 2=Batata, 3=Refri, 4=Cerveja
    product_ids = [1, 2, 3, 4] 

    for day in range(days):
        current_date = start_date + timedelta(days=day)
        
        is_weekend = 1 if current_date.weekday() >= 5 else 0
        month = current_date.month
        
        for pid in product_ids:
            # Lógica base de vendas
            base_sales = np.random.randint(5, 15)
            
            # Fatores que aumentam a venda (O SEGREDO DA IA)
            if is_weekend:
                base_sales += np.random.randint(10, 30) # Vende muito mais fds
                
            if pid == 4 and is_weekend: # Cerveja no fds explode
                base_sales += 20
                
            if pid == 1 and is_weekend: # Hamburguer no fds
                base_sales += 15

            # Sazonalidade (Dezembro vende mais)
            if month == 12:
                base_sales += 10

            data.append({
                'date': current_date.strftime("%Y-%m-%d"),
                'product_id': pid,
                'month': month,
                'day_of_week': current_date.weekday(),
                'day_of_year': current_date.timetuple().tm_yday,
                'is_weekend': is_weekend,
                'quantity_sold': base_sales # O ALVO (Target)
            })

    return pd.DataFrame(data)

def train_stock_model():
    print("1. Gerando histórico de vendas (Mock)...")
    df = generate_sales_history()
    
    # Features (Perguntas) vs Target (Resposta)
    X = df[['product_id', 'month', 'day_of_week', 'day_of_year', 'is_weekend']]
    y = df['quantity_sold']
    
    print("2. Treinando IA para prever demanda...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"3. Modelo salvo em {MODEL_PATH}")

if __name__ == "__main__":
    train_stock_model()