import requests
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
from datetime import datetime

# --- CONFIGURAÇÃO ---
# Endereço da sua API Node (Cardápio) - Use localhost aqui pois o Python está no mesmo PC
SOURCE_API_URL = "http://localhost:4000/orders" 
MODEL_PATH = "data/stock_model.pkl"

def run_training_pipeline():
    """
    Função que o botão do App vai chamar.
    1. Busca dados no Node
    2. Treina a IA
    3. Salva o modelo novo
    """
    print(f"--- INICIANDO RE-TREINO VIA APP ---")
    print(f"1. Buscando dados em {SOURCE_API_URL}...")
    
    try:
        response = requests.get(SOURCE_API_URL)
        if response.status_code != 200:
            return False, f"Erro na API Node: {response.status_code}"
            
        orders = response.json()
    except Exception as e:
        return False, f"Erro de conexão: {str(e)}"

    if not orders:
        return False, "Nenhum pedido encontrado para treinar."

    # --- PROCESSAMENTO DOS DADOS ---
    sales_records = []
    
    for order in orders:
        created_at = order.get("createdAt") or order.get("created_at")
        if not created_at: continue
        
        try:
            dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            date_str = dt.strftime("%Y-%m-%d")
        except:
            continue

        items = order.get("items") or order.get("itens") or []
        for item in items:
            product = item.get("product") or item.get("produto") or {}
            
            # Garante que pega o ID mesmo se product for objeto ou int
            if isinstance(product, dict):
                pid = product.get("id")
            else:
                pid = product # Caso venha apenas o ID direto
                
            qty = item.get("quantity") or item.get("quantidade") or 0
            
            if pid and qty > 0:
                sales_records.append({
                    "date": date_str,
                    "product_id": int(pid),
                    "quantity": qty,
                    "datetime": dt
                })

    if not sales_records:
        return False, "Dados recebidos, mas nenhum item válido encontrado."

    df = pd.DataFrame(sales_records)
    
    # Agrupamento (Dia + Produto)
    daily_sales = df.groupby(['date', 'product_id']).agg({
        'quantity': 'sum',
        'datetime': 'first'
    }).reset_index()

    # Features
    daily_sales['month'] = daily_sales['datetime'].dt.month
    daily_sales['day_of_week'] = daily_sales['datetime'].dt.weekday
    daily_sales['is_weekend'] = daily_sales['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
    
    # Treino
    X = daily_sales[['product_id', 'month', 'day_of_week', 'is_weekend']]
    y = daily_sales['quantity']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Salvar
    # Garante que salva na pasta 'data' na raiz do projeto ml-api
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__))) # volta 3 pastas
    save_path = os.path.join(base_dir, MODEL_PATH)
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    joblib.dump(model, save_path)
    
    print(f"Modelo salvo em: {save_path}")
    return True, f"Sucesso! IA treinada com {len(sales_records)} itens vendidos."