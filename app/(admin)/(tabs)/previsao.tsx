import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  TrendingDown, 
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Package,
  X
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// ------------------------------------------------------------------
// 1. CONFIGURAÇÕES DE REDE
// ------------------------------------------------------------------
const MEU_IP = '192.168.15.68'; // <--- SEU IP
const NODE_PORT = '4000';       
const ML_PORT = '8000';         

const API_NODE_URL = `http://${MEU_IP}:${NODE_PORT}`; 
const API_ML_URL =   `http://${MEU_IP}:${ML_PORT}`;

// ------------------------------------------------------------------
// 2. O SEU TEMA EXATO (Copiado da constants)
// ------------------------------------------------------------------
const theme = {
  colors: {
    background: '#09090b', // zinc-950
    surface: '#18181b',    // zinc-900
    surfaceHighlight: '#27272a', // zinc-800
    
    primary: '#ef4444',    // red-500
    primaryDark: '#b91c1c', // red-700
    
    text: '#fafafa',       // zinc-50
    textSecondary: '#a1a1aa', // zinc-400
    
    border: '#27272a',     // zinc-800
    
    success: '#22c55e',    // green-500
    warning: '#eab308',    // yellow-500
    danger: '#ef4444',     // red-500
  },
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  }
};

interface StockItem {
  id: string;
  name: string;
  category: string;
  current: number;
  min: number;
  predictedSales?: number; 
  projectedStock?: number; 
  aiStatus?: 'ok' | 'low' | 'critical';
}

export default function StockPredictionScreen() {
  const router = useRouter();
  
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [retraining, setRetraining] = useState(false);

  // --- BUSCA DADOS ---
  const fetchProductsFromDB = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`${API_NODE_URL}/products`); 
      if (!response.ok) throw new Error('Falha na API Node');
      const data = await response.json();
      
      let itemsArray = Array.isArray(data) ? data : (data.data || []);

      const formattedItems: StockItem[] = itemsArray.map((item: any) => ({
        id: String(item.id || item._id),
        name: item.name || item.nome || 'Sem Nome',
        category: item.category?.name || item.category || 'Geral',
        current: Number(item.quantity || item.stock || 0),
        min: Number(item.minStock || 10),
      }));

      setStockItems(formattedItems);
      if (formattedItems.length > 0) fetchAIPredictions(formattedItems);

    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível carregar o estoque.');
    } finally {
      setLoadingData(false);
    }
  };

  // --- IA PREDICT ---
  const fetchAIPredictions = async (items: StockItem[]) => {
    setLoadingAI(true);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const updatedItems = await Promise.all(items.map(async (item) => {
        try {
          const response = await fetch(`${API_ML_URL}/predict-stock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              target_date: dateStr,
              product_id: parseInt(item.id) || 0,
              product_name: item.name,
              current_stock: item.current
            })
          });
          
          if (!response.ok) return item;
          const data = await response.json();
          
          let status: 'ok' | 'low' | 'critical' = 'ok';
          if (data.prediction.projected_stock_end_of_day < 0) status = 'critical';
          else if (data.prediction.projected_stock_end_of_day < item.min) status = 'low';

          return {
            ...item,
            predictedSales: data.prediction.estimated_sales,
            projectedStock: data.prediction.projected_stock_end_of_day,
            aiStatus: status
          };
        } catch { return item; }
      }));
      setStockItems(updatedItems);
    } catch { } finally { setLoadingAI(false); }
  };

  // --- RE-TREINAR ---
  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const response = await fetch(`${API_ML_URL}/retrain-model`, { method: 'POST' });
      if (response.ok) {
        Alert.alert('Sucesso', 'Inteligência atualizada com novos pedidos!');
        fetchProductsFromDB();
      } else {
        Alert.alert('Erro', 'Falha ao treinar modelo.');
      }
    } catch { 
      Alert.alert('Erro', 'Servidor Python parece offline.');
    } finally { setRetraining(false); }
  };

  useEffect(() => { fetchProductsFromDB(); }, []);

  const categories = ['Todos', ...new Set(stockItems.map(i => i.category))];
  const filteredStock = useMemo(() => {
    return stockItems.filter(item => {
      const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [stockItems, selectedCategory, searchQuery]);

  // --- CARD DO ITEM ---
  const renderItem = ({ item, index }: { item: StockItem, index: number }) => {
    let statusColor = theme.colors.success;
    let StatusIcon = CheckCircle2;
    if (item.aiStatus === 'low') { statusColor = theme.colors.warning; StatusIcon = AlertTriangle; }
    if (item.aiStatus === 'critical') { statusColor = theme.colors.danger; StatusIcon = TrendingDown; }

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => setSelectedItem(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            {/* Ícone */}
            <View style={[styles.iconBox, { backgroundColor: statusColor + '20' }]}>
              <StatusIcon size={20} color={statusColor} />
            </View>
            
            {/* Textos */}
            <View style={{flex: 1, marginLeft: 12}}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.category}</Text>
            </View>

            {/* Valores */}
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.stockValue}>{item.current}</Text>
              {loadingAI ? (
                 <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={[styles.predictionText, { color: statusColor }]}>
                  {item.predictedSales ? `-${item.predictedSales} prev.` : '--'}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Previsão IA</Text>
            <Text style={styles.headerSubtitle}>Estoque Inteligente</Text>
          </View>
        </View>

        {/* BOTÃO CÉREBRO (Estilo Botão Vermelho) */}
        <TouchableOpacity 
          onPress={handleRetrain} 
          disabled={retraining}
          style={styles.aiButton}
        >
          {retraining ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <BrainCircuit size={22} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar item..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* CATEGORIAS */}
      <View style={{ height: 40, marginBottom: 16 }}>
        <FlatList
          horizontal
          data={categories}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.catPill, 
                selectedCategory === item && styles.catPillActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.catText, 
                selectedCategory === item && styles.catTextActive
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* LISTA */}
      {loadingData ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStock}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Package size={40} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
            </View>
          }
        />
      )}

      {/* MODAL BOTTOM SHEET */}
      {selectedItem && (
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSelectedItem(null)} />
          <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                <Text style={styles.modalCategory}>{selectedItem.category}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.closeIcon}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* AI INFO BOX */}
            <View style={styles.aiBox}>
              <View style={{flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8}}>
                <BrainCircuit size={18} color={theme.colors.primary} />
                <Text style={styles.aiLabel}>Diagnóstico da IA</Text>
              </View>
              <Text style={styles.aiText}>
                {selectedItem.aiStatus === 'critical' 
                  ? "Risco Crítico: Baseado no histórico, o estoque deve acabar amanhã."
                  : selectedItem.aiStatus === 'low'
                  ? "Atenção: Estoque ficará abaixo do mínimo de segurança."
                  : "Saudável: Estoque suficiente para a demanda prevista."}
              </Text>
            </View>

            {/* ESTATÍSTICAS */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Atual</Text>
                <Text style={styles.statValue}>{selectedItem.current}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Venda Prev.</Text>
                <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                  {selectedItem.predictedSales || 0}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Est. Final</Text>
                <Text style={[styles.statValue, {
                  color: selectedItem.aiStatus === 'critical' ? theme.colors.danger : theme.colors.success
                }]}>
                  {selectedItem.projectedStock || 0}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setSelectedItem(null)}
            >
              <Text style={styles.closeBtnText}>Fechar Detalhes</Text>
            </TouchableOpacity>

          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // HEADER
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, marginBottom: 20, marginTop: 10
  },
  backBtn: { marginRight: 15, padding: 4 },
  headerTitle: { fontFamily: theme.fonts.bold, fontSize: 24, color: theme.colors.text },
  headerSubtitle: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.textSecondary },
  
  aiButton: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  // SEARCH
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: theme.colors.surface, height: 48, 
    borderRadius: 12, paddingHorizontal: 16, gap: 12,
    borderWidth: 1, borderColor: theme.colors.border
  },
  searchInput: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 15, color: theme.colors.text },

  // CATEGORIAS
  catPill: { 
    paddingHorizontal: 16, paddingVertical: 8, 
    backgroundColor: theme.colors.surface, borderRadius: 20, 
    borderWidth: 1, borderColor: theme.colors.border, marginRight: 0 
  },
  catPillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  catText: { fontFamily: theme.fonts.medium, fontSize: 13, color: theme.colors.textSecondary },
  catTextActive: { color: '#FFF' },

  // LISTA & CARDS
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { 
    backgroundColor: theme.colors.surface, marginBottom: 10, borderRadius: 12, 
    borderWidth: 1, borderColor: theme.colors.border,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontFamily: theme.fonts.semiBold, fontSize: 15, color: theme.colors.text },
  cardSubtitle: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textSecondary },
  stockValue: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.text },
  predictionText: { fontFamily: theme.fonts.medium, fontSize: 12 },

  // LOADING & EMPTY
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { fontFamily: theme.fonts.medium, color: theme.colors.textSecondary, marginTop: 10 },
  emptyText: { fontFamily: theme.fonts.medium, color: theme.colors.textSecondary, marginTop: 10 },

  // MODAL
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: theme.colors.surface, 
    borderTopLeftRadius: 24, borderTopRightRadius: 24, 
    padding: 24, paddingBottom: 40, 
    borderWidth: 1, borderColor: theme.colors.border 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontFamily: theme.fonts.bold, fontSize: 20, color: theme.colors.text },
  modalCategory: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.textSecondary },
  closeIcon: { padding: 4 },
  
  aiBox: { 
    backgroundColor: theme.colors.background, 
    padding: 16, borderRadius: 12, marginBottom: 20, 
    borderWidth: 1, borderColor: theme.colors.border 
  },
  aiLabel: { fontFamily: theme.fonts.semiBold, fontSize: 14, color: theme.colors.primary },
  aiText: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.text, lineHeight: 20 },
  
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { 
    flex: 1, backgroundColor: theme.colors.background, 
    borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border
  },
  statLabel: { fontFamily: theme.fonts.medium, fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
  statValue: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.text },

  closeBtn: { 
    backgroundColor: theme.colors.primary,
    borderRadius: 12, alignItems: 'center', paddingVertical: 14 
  },
  closeBtnText: { fontFamily: theme.fonts.semiBold, color: '#FFF', fontSize: 16 },
});