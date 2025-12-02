import { Edit, Package, Plus, Search, Trash2, RefreshCw, X, Save } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  KeyboardAvoidingView,
  Platform
} from "react-native";

const { width } = Dimensions.get("window");

interface Produto {
  id: number;
  name: string;
  description: string | null;
  category: string | null; 
  price: string | number;
  image: string | null;
  isAvailable: boolean;
  quantity: number;
}

// SEU IP
const BASE_URL = "http://10.188.227.122:4000";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ESTADOS DO MODAL ---
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<Produto | null>(null);

  // Campos do Formulário
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDesc, setFormDesc] = useState("");

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/products`);
      
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      
      const data = await response.json();
      setProdutos(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- ABRIR MODAL (CRIAR) ---
  const openCreateModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormPrice("");
    setFormQty("");
    setFormCategory("");
    setFormDesc("");
    setModalVisible(true);
  };

  // --- ABRIR MODAL (EDITAR) ---
  const openEditModal = (item: Produto) => {
    setEditingItem(item);
    
    setFormName(item.name);
    setFormPrice(String(item.price));
    setFormQty(String(item.quantity));
    
    // Tratamento seguro para categoria (objeto ou string)
    const catName = typeof item.category === 'object' && item.category !== null 
      ? (item.category as any).name 
      : item.category;
    setFormCategory(catName || "");
    
    setFormDesc(item.description || "");
    
    setModalVisible(true);
  };

  // --- SALVAR (POST ou PATCH) ---
  const handleSave = async () => {
    if (!formName || !formPrice) {
      Alert.alert("Atenção", "Nome e Preço são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      const isEditing = !!editingItem;
      const url = isEditing 
        ? `${BASE_URL}/products/${editingItem.id}` 
        : `${BASE_URL}/products`;
      
      // MUDANÇA AQUI: Usamos PATCH para editar (atualização parcial)
      const method = isEditing ? 'PATCH' : 'POST';

      // Conversão de valores
      const priceFloat = parseFloat(formPrice.replace(',', '.')) || 0;
      const qtyInt = parseInt(formQty) || 0;

      const payload = {
        name: formName,
        price: priceFloat,
        quantity: qtyInt,
        category: formCategory,
        description: formDesc,
        // Mantém disponibilidade original se editando
        isAvailable: isEditing ? editingItem.isAvailable : true 
      };

      console.log(`Enviando ${method} para ${url}`, payload);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // MUDANÇA: Lemos a resposta do servidor para saber o erro real
      if (!response.ok) {
        const errorText = await response.text(); 
        throw new Error(`Servidor respondeu: ${response.status} - ${errorText}`);
      }

      Alert.alert("Sucesso", isEditing ? "Produto atualizado!" : "Produto criado!");
      setModalVisible(false);
      fetchProdutos(); // Atualiza a lista

    } catch (error: any) {
      console.log(error);
      // Agora o alerta mostra a mensagem real do erro
      Alert.alert("Erro ao Salvar", error.message || "Verifique sua conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDisponibilidade = async (produtoId: number, currentStatus: boolean) => {
    try {
      // Optimistic Update (atualiza visualmente antes)
      setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, isAvailable: !currentStatus } : p));

      const response = await fetch(`${BASE_URL}/products/${produtoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });

      if (!response.ok) {
        // Reverte se der erro
        setProdutos(prev => prev.map(p => p.id === produtoId ? { ...p, isAvailable: currentStatus } : p));
        Alert.alert('Erro', 'Falha ao atualizar no servidor');
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível conectar');
    }
  };

  const deleteProduto = async (produtoId: number) => {
    Alert.alert('Confirmar', 'Excluir este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/products/${produtoId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            
            setProdutos(prev => prev.filter(p => p.id !== produtoId));
            Alert.alert('Sucesso', 'Produto excluído!');
          } catch (err) { 
            Alert.alert('Erro', 'Não foi possível excluir'); 
          }
        },
      },
    ]);
  };

  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (produto.category && String(produto.category).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const produtosDisponiveis = produtos.filter(p => p.isAvailable).length;
  const produtosBaixoEstoque = produtos.filter(p => p.quantity < 10 && p.quantity > 0).length;
  const produtosSemEstoque = produtos.filter(p => p.quantity === 0).length;

  if (loading) return (
    <View style={[styles.container, styles.centerContent]}>
      <ActivityIndicator size="large" color="#DC2626" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Cardápio</Text>
            <Text style={styles.subtitle}>Gerencie seu catálogo</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchProdutos} disabled={loading}>
            <RefreshCw size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Plus color="#FFF" size={18} />
          <Text style={styles.addButtonText}>Novo Produto</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={18} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{produtos.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Disp.</Text>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>{produtosDisponiveis}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Baixo</Text>
            <Text style={[styles.statValue, { color: "#EAB308" }]}>{produtosBaixoEstoque}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Zerado</Text>
            <Text style={[styles.statValue, { color: "#DC2626" }]}>{produtosSemEstoque}</Text>
          </View>
        </View>

        <View style={styles.produtosContainer}>
          {filteredProdutos.map((produto) => (
            <View key={produto.id} style={[styles.card, !produto.isAvailable && styles.cardIndisponivel]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{produto.name}</Text>
                    {!produto.isAvailable && (
                      <View style={styles.indisponivelBadge}>
                        <Text style={styles.indisponivelText}>INDISPONÍVEL</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardCategoria}>
                    {typeof produto.category === 'object' && produto.category ? (produto.category as any).name : produto.category}
                  </Text>
                  <Text style={styles.cardDescricao}>{produto.description}</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Preço:</Text>
                <Text style={styles.cardPreco}>R$ {Number(produto.price).toFixed(2)}</Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Estoque:</Text>
                <Text style={[styles.cardEstoque, { color: produto.quantity === 0 ? "#DC2626" : produto.quantity < 10 ? "#EAB308" : "#22C55E" }]}>
                  {produto.quantity} unidades
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(produto)}>
                  <Edit color="#9CA3AF" size={18} />
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleButton, produto.isAvailable ? styles.toggleButtonActive : styles.toggleButtonInactive]}
                  onPress={() => toggleDisponibilidade(produto.id, produto.isAvailable)}
                >
                  <Text style={styles.toggleButtonText}>{produto.isAvailable ? '✓' : '✗'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteProduto(produto.id)}>
                  <Trash2 color="#DC2626" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* --- MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? "Editar Produto" : "Novo Produto"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X color="#A1A1AA" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput 
                style={styles.modalInput} 
                value={formName}
                onChangeText={setFormName}
                placeholder="Ex: Coca-Cola"
                placeholderTextColor="#52525B"
              />

              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={{flex: 1}}>
                  <Text style={styles.inputLabel}>Preço (R$)</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    value={formPrice}
                    onChangeText={setFormPrice}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#52525B"
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.inputLabel}>Qtd. Estoque</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    value={formQty}
                    onChangeText={setFormQty}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#52525B"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Categoria</Text>
              <TextInput 
                style={styles.modalInput} 
                value={formCategory}
                onChangeText={setFormCategory}
                placeholder="Ex: Bebidas"
                placeholderTextColor="#52525B"
              />

              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput 
                style={[styles.modalInput, {height: 80, textAlignVertical: 'top'}]} 
                value={formDesc}
                onChangeText={setFormDesc}
                placeholder="Detalhes..."
                placeholderTextColor="#52525B"
                multiline
              />
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalSaveButton} 
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Save color="#FFF" size={18} />
                  <Text style={styles.modalSaveText}>Salvar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

/* --- ESTILOS --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#18181B", paddingHorizontal: 16, paddingTop: 40 },
  centerContent: { justifyContent: "center", alignItems: "center" },
  scroll: { paddingBottom: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { fontSize: 22, color: "#FFF", fontWeight: "700" },
  subtitle: { fontSize: 14, color: "#9CA3AF", marginTop: 4 },
  refreshButton: { padding: 8, backgroundColor: "#27272A", borderRadius: 8, borderWidth: 1, borderColor: "#3F3F46" },
  addButton: { flexDirection: "row", backgroundColor: "#DC2626", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  addButtonText: { color: "#FFF", marginLeft: 6, fontWeight: "600" },
  searchContainer: { position: "relative", marginBottom: 20 },
  searchIcon: { position: "absolute", left: 10, top: 12, zIndex: 1 },
  searchInput: { backgroundColor: "#27272A", color: "#FFF", borderRadius: 8, paddingLeft: 36, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: "#52525B" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, gap: 8 },
  statCard: { backgroundColor: "#27272A", borderRadius: 10, padding: 12, flex: 1, borderWidth: 1, borderColor: "#3F3F46", alignItems: "center" },
  statLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  produtosContainer: { alignItems: "center" },
  card: { backgroundColor: "#27272A", width: width * 0.9, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#3F3F46" },
  cardIndisponivel: { opacity: 0.7, borderColor: "#DC2626" },
  cardHeader: { flexDirection: "row", marginBottom: 8 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#FFF" },
  indisponivelBadge: { backgroundColor: "#DC2626", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  indisponivelText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  cardCategoria: { color: "#DC2626", fontSize: 12, marginBottom: 4 },
  cardDescricao: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },
  cardInfo: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  cardLabel: { color: "#9CA3AF", fontSize: 13 },
  cardPreco: { fontWeight: "bold", color: "#DC2626" },
  cardEstoque: { fontWeight: "bold" },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 8 },
  editButton: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8 },
  editText: { color: "#9CA3AF" },
  toggleButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, flex: 1, alignItems: "center" },
  toggleButtonActive: { backgroundColor: "#22C55E" },
  toggleButtonInactive: { backgroundColor: "#52525B" },
  toggleButtonText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  deleteButton: { padding: 8 },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#9CA3AF", marginTop: 8 },
  loadingText: { color: "#9CA3AF", marginTop: 12, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#27272A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#3F3F46', maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  closeBtn: { padding: 4 },
  inputLabel: { color: '#A1A1AA', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  modalInput: { backgroundColor: '#18181B', color: '#FFF', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#3F3F46', fontSize: 14 },
  modalSaveButton: { backgroundColor: '#DC2626', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 8, marginTop: 10, gap: 8 },
  modalSaveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});