/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Edit, Package, Plus, Search, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

interface Product {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

const API_URL = "http://192.168.0.20:4000/products";

export default function ProdutosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    isAvailable: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      router.replace("/auth/login");
      throw new Error("Token não encontrado. Faça login novamente.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleAuthError = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    Alert.alert(
      "Sessão expirada",
      "Sua sessão expirou. Faça login novamente.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/auth/login"),
        },
      ]
    );
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("=== FETCH PRODUCTS ===");
      console.log("URL:", API_URL);

      const headers = await getAuthHeader();
      console.log("Headers preparados");

      const response = await fetch(API_URL, {
        method: "GET",
        headers,
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        await handleAuthError();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Products loaded:", data.length);

      const productsWithNumberPrice = data.map((p: any) => ({
        ...p,
        price: Number(p.price),
      }));

      setProducts(productsWithNumberPrice);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao carregar produtos:", errorMessage);
      setError(errorMessage);

      if (!errorMessage.includes("Token não encontrado")) {
        Alert.alert("Erro ao carregar produtos", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: "", price: "", isAvailable: true });
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      isAvailable: product.isAvailable,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    const price = parseFloat(formData.price.replace(",", "."));
    if (isNaN(price) || price <= 0) {
      Alert.alert("Erro", "Preço inválido");
      return;
    }

    try {
      const headers = await getAuthHeader();
      const url = editingProduct ? `${API_URL}/${editingProduct.id}` : API_URL;
      const method = editingProduct ? "PATCH" : "POST"; // CORRIGIDO: PUT -> PATCH

      console.log("=== SALVANDO PRODUTO ===");
      console.log("URL:", url);
      console.log("Method:", method);
      console.log("Body:", {
        name: formData.name.trim(),
        price: price,
        isAvailable: formData.isAvailable,
      });

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          name: formData.name.trim(),
          price: price,
          isAvailable: formData.isAvailable,
        }),
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        await handleAuthError();
        return;
      }

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        Alert.alert(
          "Erro",
          `Erro ao salvar produto (${response.status})`
        );
        return;
      }

      if (contentType && contentType.includes("application/json")) {
        const savedProduct = await response.json();
        console.log("Produto salvo:", savedProduct);

        if (editingProduct) {
          setProducts(
            products.map((p) =>
              p.id === editingProduct.id
                ? { ...savedProduct, price: Number(savedProduct.price) }
                : p
            )
          );
          Alert.alert("Sucesso", "Produto atualizado com sucesso");
        } else {
          setProducts([
            ...products,
            { ...savedProduct, price: Number(savedProduct.price) },
          ]);
          Alert.alert("Sucesso", "Produto adicionado com sucesso");
        }

        setShowModal(false);
        setEditingProduct(null);
        setFormData({ name: "", price: "", isAvailable: true });
      } else {
        const responseText = await response.text();
        console.log("Resposta não-JSON:", responseText);
        Alert.alert(
          "Erro",
          "Servidor retornou resposta inválida. Verifique a API."
        );
      }
    } catch (error) {
      console.error("Erro detalhado ao salvar:", error);
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Erro ao salvar produto"
      );
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: "", price: "", isAvailable: true });
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      "Confirmar exclusão",
      "Deseja realmente excluir este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const headers = await getAuthHeader();

              const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers,
              });

              if (response.status === 401) {
                await handleAuthError();
                return;
              }

              if (response.ok) {
                setProducts(products.filter((p) => p.id !== id));
                Alert.alert("Sucesso", "Produto removido com sucesso");
              } else {
                Alert.alert("Erro", "Não foi possível remover o produto");
              }
            } catch (error) {
              Alert.alert("Erro", "Erro ao remover produto");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const headers = await getAuthHeader();

      console.log("=== ATUALIZANDO DISPONIBILIDADE ===");
      console.log("URL:", `${API_URL}/${product.id}`);
      console.log("Body:", { isAvailable: !product.isAvailable });

      const response = await fetch(`${API_URL}/${product.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          isAvailable: !product.isAvailable,
        }),
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        await handleAuthError();
        return;
      }

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        Alert.alert("Erro", "Não foi possível atualizar o produto");
        return;
      }

      if (contentType && contentType.includes("application/json")) {
        const updated = await response.json();
        setProducts(
          products.map((p) =>
            p.id === product.id
              ? { ...updated, price: Number(updated.price) }
              : p
          )
        );
      } else {
        const responseText = await response.text();
        console.log("Resposta não-JSON:", responseText);
        Alert.alert("Erro", "Resposta inválida do servidor");
      }
    } catch (error) {
      console.error("Erro ao atualizar disponibilidade:", error);
      Alert.alert("Erro", "Erro ao atualizar produto");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableProducts = products.filter((p) => p.isAvailable).length;
  const unavailableProducts = products.filter((p) => !p.isAvailable).length;

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
        <Package color="#DC2626" size={60} />
        <Text style={styles.errorTitle}>Erro ao carregar produtos</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Gestão de Produtos</Text>
          <Text style={styles.subtitle}>Gerencie o catálogo de produtos</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Plus color="#FFF" size={18} />
            <Text style={styles.addButtonText}>Novo Produto</Text>
          </TouchableOpacity>
        </View>

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
            <Text style={styles.statLabel}>Total de Produtos</Text>
            <Text style={styles.statValue}>{products.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Disponíveis</Text>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {availableProducts}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Indisponíveis</Text>
            <Text style={[styles.statValue, { color: "#DC2626" }]}>
              {unavailableProducts}
            </Text>
          </View>
        </View>

        {/* Lista de produtos */}
        <View style={styles.produtosContainer}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{product.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleAvailability(product)}
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: product.isAvailable
                        ? "#10B98120"
                        : "#DC262620",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: product.isAvailable ? "#10B981" : "#DC2626",
                      },
                    ]}
                  >
                    {product.isAvailable ? "Disponível" : "Indisponível"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Preço:</Text>
                <Text style={styles.cardPreco}>
                  R$ {product.price.toFixed(2)}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(product)}
                >
                  <Edit color="#9CA3AF" size={18} />
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(product.id)}
                >
                  <Trash2 color="#DC2626" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredProducts.length === 0 && products.length > 0 && (
            <View style={styles.emptyContainer}>
              <Package color="#9CA3AF" size={40} />
              <Text style={styles.emptyText}>
                Nenhum produto encontrado na busca
              </Text>
            </View>
          )}

          {products.length === 0 && (
            <View style={styles.emptyContainer}>
              <Package color="#9CA3AF" size={40} />
              <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
              <Text style={styles.emptySubtext}>
                Adicione produtos para começar
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Adicionar/Editar */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do Produto *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: Pizza Margherita"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Preço (R$) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: 25.90"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() =>
                  setFormData({
                    ...formData,
                    isAvailable: !formData.isAvailable,
                  })
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    formData.isAvailable && styles.checkboxChecked,
                  ]}
                >
                  {formData.isAvailable && (
                    <Text style={styles.checkboxIcon}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Produto disponível</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSave}
              >
                <Text style={styles.modalSaveText}>
                  {editingProduct ? "Atualizar" : "Adicionar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  loadingText: {
    color: "#9CA3AF",
    marginTop: 12,
    fontSize: 14,
  },
  errorTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  errorText: {
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  scroll: {
    paddingBottom: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: "#FFF",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#DC2626",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
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
    padding: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  cardPreco: {
    fontWeight: "bold",
    color: "#DC2626",
    fontSize: 14,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#3F3F46",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editText: {
    color: "#9CA3AF",
  },
  deleteButton: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#9CA3AF",
    marginTop: 8,
    fontSize: 16,
  },
  emptySubtext: {
    color: "#52525B",
    marginTop: 4,
    fontSize: 13,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#27272A",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#18181B",
    color: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#52525B",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#52525B",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  checkboxIcon: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxLabel: {
    color: "#FFF",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#3F3F46",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#FFF",
    fontWeight: "600",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalSaveText: {
    color: "#FFF",
    fontWeight: "600",
  },
});
