import requests
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
from datetime import datetime

# CONFIGURAÇÕES
# A URL da sua API principal (onde estão os pedidos reais)
# Se estiver rodando local, use o IP da maquina, não localhost, para garantir visibilidade
SOURCE_API_URL = "http://localhost:4000/orders"  
MODEL_PATH = "data/stock_model.pkl"

def fetch_and_train():
    """
    1. Bate na API da Adega
    2. Baixa o histórico
    3. Treina a IA
    4. Salva o modelo novo
    """
    print(f"1. Buscando dados reais em {SOURCE_API_URL}...")
    
    try:
        # Simula o Postman fazendo a requisição GET
        response = requests.get(SOURCE_API_URL)
        response.raise_for_status() # Garante que deu 200 OK
        orders = response.json()
    except Exception as e:
        print(f"ERRO ao buscar dados: {e}")
        return False, str(e)

    # --- O MESMO TRATAMENTO DE DADOS DE ANTES ---
    sales_records = []
    
    for order in orders:
        created_at = order.get("createdAt")
        if not created_at: continue
        
        try:
            # Ajuste conforme seu formato de data
            dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            date_str = dt.strftime("%Y-%m-%d")
        except:
            continue

        for item in order.get("items", []):
            product = item.get("product", {})
            product_id = product.get("id")
            quantity = item.get("quantity", 0)
            
            if product_id and quantity > 0:
                sales_records.append({
                    "date": date_str,
                    "product_id": product_id,
                    "quantity": quantity,
                    "datetime": dt
                })

    if not sales_records:
        return False, "Nenhum pedido encontrado para treinar."

    df = pd.DataFrame(sales_records)
    
    # Agrupa vendas por dia e produto
    daily_sales = df.groupby(['date', 'product_id']).agg({
        'quantity': 'sum',
        'datetime': 'first'
    }).reset_index()

    # Cria Features
    daily_sales['month'] = daily_sales['datetime'].dt.month
    daily_sales['day_of_week'] = daily_sales['datetime'].dt.weekday
    daily_sales['day_of_year'] = daily_sales['datetime'].dt.dayofyear
    daily_sales['is_weekend'] = daily_sales['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
    
    # Treina
    X = daily_sales[['product_id', 'month', 'day_of_week', 'day_of_year', 'is_weekend']]
    y = daily_sales['quantity']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    
    print("Modelo retreinado com sucesso!")
    return True, "Modelo atualizado com os dados mais recentes!"

if __name__ == "__main__":
    fetch_and_train()