import pandas as pd
from datetime import datetime

def extract_date_features(date_str: str, product_id: int) -> pd.DataFrame:
    """
    Transforma uma data (ex: '2025-12-25') em números que a IA entende.
    """
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        # Fallback para hoje se a data vier errada
        dt = datetime.now()

    # Criação das features baseadas no calendário
    features = {
        'product_id': [product_id], # O produto importa (Cerveja vende diferente de agua)
        'month': [dt.month],        # Dezembro vende mais que Fevereiro?
        'day_of_week': [dt.weekday()], # 0=Segunda, 6=Domingo
        'day_of_year': [dt.timetuple().tm_yday],
        'is_weekend': [1 if dt.weekday() >= 5 else 0]
    }

    return pd.DataFrame(features)