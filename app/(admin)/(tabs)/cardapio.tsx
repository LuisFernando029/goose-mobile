import { Edit, Package, Plus, Search, Trash2, RefreshCw } from "lucide-react-native";
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
} from "react-native";

const { width } = Dimensions.get("window");

interface Produto {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: string;
  image: string | null;
  isAvailable: boolean;
  quantity: number;
  createdAt: string;
}

const BASE_URL = "http://192.168.15.48:4000";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/products`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.status}`);
      }

      const data = await response.json();
      setProdutos(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      Alert.alert("Erro", `Não foi possível carregar os produtos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleDisponibilidade = async (produtoId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${BASE_URL}/products/${produtoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar disponibilidade');
      }

      // Atualiza localmente
      setProdutos(prev =>
        prev.map(p =>
          p.id === produtoId ? { ...p, isAvailable: !currentStatus } : p
        )
      );

      Alert.alert('Sucesso', `Produto ${!currentStatus ? 'disponibilizado' : 'indisponibilizado'}!`);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar o produto');
    }
  };

  const deleteProduto = async (produtoId: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BASE_URL}/products/${produtoId}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Erro ao excluir produto');
              }

              setProdutos(prev => prev.filter(p => p.id !== produtoId));
              Alert.alert('Sucesso', 'Produto excluído com sucesso!');
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível excluir o produto');
            }
          },
        },
      ]
    );
  };

  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (produto.category && produto.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const produtosDisponiveis = produtos.filter(p => p.isAvailable).length;
  const produtosIndisponiveis = produtos.filter(p => !p.isAvailable).length;
  const produtosBaixoEstoque = produtos.filter(p => p.quantity < 10 && p.quantity > 0).length;
  const produtosSemEstoque = produtos.filter(p => p.quantity === 0).length;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Package color="#DC2626" size={48} />
        <Text style={styles.errorText}>Erro ao carregar produtos</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProdutos}>
          <RefreshCw size={20} color="#FFF" />
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Gestão de Produtos</Text>
            <Text style={styles.subtitle}>
              Gerencie o catálogo e controle de estoque
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchProdutos}
            disabled={loading}
          >
            <RefreshCw size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Plus color="#FFF" size={18} />
          <Text style={styles.addButtonText}>Novo Produto</Text>
        </TouchableOpacity>

        {/* Campo de busca */}
        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={18} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar produtos..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{produtos.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Disponíveis</Text>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>
              {produtosDisponiveis}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Baixo Estoque</Text>
            <Text style={[styles.statValue, { color: "#EAB308" }]}>
              {produtosBaixoEstoque}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Sem Estoque</Text>
            <Text style={[styles.statValue, { color: "#DC2626" }]}>
              {produtosSemEstoque}
            </Text>
          </View>
        </View>

        {/* Lista de produtos */}
        <View style={styles.produtosContainer}>
          {filteredProdutos.map((produto) => (
            <View 
              key={produto.id} 
              style={[
                styles.card,
                !produto.isAvailable && styles.cardIndisponivel
              ]}
            >
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
                  {produto.category && (
                    <Text style={styles.cardCategoria}>{produto.category}</Text>
                  )}
                  {produto.description && (
                    <Text style={styles.cardDescricao}>{produto.description}</Text>
                  )}
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Preço:</Text>
                <Text style={styles.cardPreco}>
                  R$ {Number(produto.price).toFixed(2)}
                </Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Estoque:</Text>
                <Text
                  style={[
                    styles.cardEstoque,
                    { 
                      color: produto.quantity === 0 
                        ? "#DC2626" 
                        : produto.quantity < 10 
                          ? "#EAB308" 
                          : "#22C55E" 
                    },
                  ]}
                >
                  {produto.quantity} unidades
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade de edição em breve')}
                >
                  <Edit color="#9CA3AF" size={18} />
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    produto.isAvailable ? styles.toggleButtonActive : styles.toggleButtonInactive
                  ]}
                  onPress={() => toggleDisponibilidade(produto.id, produto.isAvailable)}
                >
                  <Text style={styles.toggleButtonText}>
                    {produto.isAvailable ? '✓ Disponível' : '✗ Indisponível'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteProduto(produto.id)}
                >
                  <Trash2 color="#DC2626" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredProdutos.length === 0 && (
            <View style={styles.emptyContainer}>
              <Package color="#9CA3AF" size={40} />
              <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------- ESTILOS ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#18181B",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    color: "#FFF",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: "#27272A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#DC2626",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#FFF",
    marginLeft: 6,
    fontWeight: "600",
  },
  searchContainer: {
    position: "relative",
    marginBottom: 20,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "#27272A",
    color: "#FFF",
    borderRadius: 8,
    paddingLeft: 36,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#52525B",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    backgroundColor: "#27272A",
    borderRadius: 10,
    padding: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: "#3F3F46",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  produtosContainer: {
    alignItems: "center",
  },
  card: {
    backgroundColor: "#27272A",
    width: width * 0.9,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  cardIndisponivel: {
    opacity: 0.7,
    borderColor: "#DC2626",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  indisponivelBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  indisponivelText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  cardCategoria: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 4,
  },
  cardDescricao: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  cardInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  cardLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  cardPreco: {
    fontWeight: "bold",
    color: "#DC2626",
  },
  cardEstoque: {
    fontWeight: "bold",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  editText: {
    color: "#9CA3AF",
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#22C55E",
  },
  toggleButtonInactive: {
    backgroundColor: "#52525B",
  },
  toggleButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#9CA3AF",
    marginTop: 8,
  },
  loadingText: {
    color: "#9CA3AF",
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    flexDirection: "row",
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
});
