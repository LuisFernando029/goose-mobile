import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain, // Ícone representando a IA
  Calendar,
  AlertCircle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Interface para a resposta da sua Machine Learning
interface PredictionResult {
  productId: string;
  productName: string;
  currentStock: number;
  predictedSales: number; // O que a IA acha que vai vender
  confidence: number; // 0 a 100 (certeza da IA)
  trend: 'up' | 'down' | 'stable'; // Tendência comparado à média
  suggestedAction: string; // Ex: "Comprar mais", "Fazer promoção"
}

const BASE_URL = "http://192.168.15.48:4000";

export default function PredictionScreen() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      
      // MOCK PARA TESTE VISUAL (Remova isso quando conectar na API real)
      // Simula um delay de processamento da IA
      /*
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockData: PredictionResult[] = [
        { productId: '1', productName: 'Coca-Cola 2L', currentStock: 50, predictedSales: 120, confidence: 92, trend: 'up', suggestedAction: 'Repor Urgente' },
        { productId: '2', productName: 'Heineken 600ml', currentStock: 200, predictedSales: 180, confidence: 85, trend: 'stable', suggestedAction: 'Estoque OK' },
        { productId: '3', productName: 'Porção de Fritas', currentStock: 80, predictedSales: 40, confidence: 78, trend: 'down', suggestedAction: 'Reduzir Compra' },
        { productId: '4', productName: 'Água Mineral', currentStock: 10, predictedSales: 60, confidence: 95, trend: 'up', suggestedAction: 'Repor Urgente' },
      ];
      setPredictions(mockData);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
      return; 
      */
      // FIM DO MOCK

      // --- INTEGRAÇÃO REAL COM MACHINE LEARNING ---
      // A rota '/predict' deve acionar seu modelo Python/Node
      const response = await fetch(`${BASE_URL}/predict`, {
        method: 'POST', // Geralmente POST para enviar dados de contexto (data, clima, etc)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDate: new Date().toISOString().split('T')[0], // Previsão para hoje/amanhã
          context: 'sales_forecast'
        })
      });

      if (!response.ok) throw new Error('Falha ao obter previsões da IA');

      const data = await response.json();
      setPredictions(data);
      setLastUpdate(new Date().toLocaleTimeString());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      Alert.alert("Erro na IA", `Não foi possível gerar previsões: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={20} color="#22C55E" />;
      case 'down': return <TrendingDown size={20} color="#DC2626" />;
      default: return <Minus size={20} color="#EAB308" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return '#22C55E'; // Alta confiança
    if (score >= 70) return '#EAB308'; // Média confiança
    return '#DC2626'; // Baixa confiança
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Processando dados...</Text>
        <Text style={styles.loadingSubText}>Consultando modelo de Machine Learning</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#9CA3AF" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Previsão de Demanda</Text>
              <View style={styles.aiBadge}>
                <Brain size={14} color="#C4B5FD" />
                <Text style={styles.subtitle}>
                  Powered by AI • Atualizado às {lastUpdate}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadPredictions}
            >
              <RefreshCw size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Resumo da IA */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { width: width * 0.92 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Calendar size={18} color="#8B5CF6" />
              <Text style={styles.statLabel}>Previsão para Próximas 24h</Text>
            </View>
            <Text style={styles.predictionSummary}>
              A IA identificou <Text style={{color: '#22C55E'}}>alta demanda</Text> prevista para bebidas.
              Recomenda-se reposição de estoque imediata.
            </Text>
          </View>
        </View>

        {/* Lista de Previsões */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Insights por Produto</Text>
          
          {predictions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AlertCircle color="#9CA3AF" size={40} />
              <Text style={styles.emptyText}>Nenhuma previsão gerada.</Text>
            </View>
          ) : (
            predictions.map((item) => (
              <View key={item.productId} style={styles.predictionCard}>
                
                {/* Cabeçalho do Card */}
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <View style={styles.trendContainer}>
                    {getTrendIcon(item.trend)}
                    <Text style={[
                      styles.trendText, 
                      { color: item.trend === 'up' ? '#22C55E' : item.trend === 'down' ? '#DC2626' : '#EAB308'}
                    ]}>
                      {item.trend === 'up' ? 'Alta' : item.trend === 'down' ? 'Baixa' : 'Estável'}
                    </Text>
                  </View>
                </View>

                {/* Dados Numéricos */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Estoque Atual</Text>
                    <Text style={styles.metricValue}>{item.currentStock}</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Previsão Venda</Text>
                    <Text style={[styles.metricValue, { color: '#8B5CF6' }]}>
                      {item.predictedSales}
                    </Text>
                  </View>
                </View>

                {/* Barra de Confiança da IA */}
                <View style={styles.confidenceContainer}>
                  <View style={styles.confidenceHeader}>
                    <Text style={styles.confidenceLabel}>Confiança da IA</Text>
                    <Text style={[styles.confidenceValue, { color: getConfidenceColor(item.confidence) }]}>
                      {item.confidence}%
                    </Text>
                  </View>
                  <View style={styles.confidenceBarBg}>
                    <View 
                      style={[
                        styles.confidenceBarFill, 
                        { 
                          width: `${item.confidence}%`,
                          backgroundColor: getConfidenceColor(item.confidence)
                        }
                      ]} 
                    />
                  </View>
                </View>

                {/* Sugestão de Ação */}
                <View style={styles.actionContainer}>
                  <Text style={styles.actionLabel}>Ação Sugerida:</Text>
                  <Text style={styles.actionText}>{item.suggestedAction}</Text>
                </View>

              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#18181B',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    color: '#9CA3AF',
    marginLeft: 8,
    fontSize: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#C4B5FD', // Roxo claro para remeter a tech/AI
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#27272A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubText: {
    color: '#9CA3AF',
    marginTop: 4,
    fontSize: 14,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6', // Borda roxa para destacar a IA
  },
  statLabel: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  predictionSummary: {
    color: '#E4E4E7',
    fontSize: 15,
    lineHeight: 22,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 14,
  },
  // Cards de Previsão
  predictionCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#18181B',
    padding: 12,
    borderRadius: 8,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#3F3F46',
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  confidenceLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  confidenceBarBg: {
    height: 6,
    backgroundColor: '#3F3F46',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)', // Fundo roxo bem claro
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  actionLabel: {
    color: '#8B5CF6',
    fontWeight: '700',
    fontSize: 13,
  },
  actionText: {
    color: '#C4B5FD',
    fontSize: 13,
    flex: 1,
  },
});