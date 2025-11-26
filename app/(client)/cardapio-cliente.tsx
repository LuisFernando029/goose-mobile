/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Minus, Plus, Search, ShoppingCart } from "lucide-react-native";
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
    View
} from "react-native";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get("window");

interface Product {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const API_URL = "http://192.168.0.20:4000/products";

export default function CardapioClientePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
   
  }, [cart]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error);
    }
  };

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

      const headers = await getAuthHeader();

      const response = await fetch(API_URL, {
        method: "GET",
        headers,
      });

      if (response.status === 401) {
        await handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const productsWithNumberPrice = data.map((p: any) => ({
        ...p,
        price: Number(p.price),
      }));

      // Filtrar apenas produtos disponíveis
      const availableProducts = productsWithNumberPrice.filter(
        (p: Product) => p.isAvailable
      );

      setProducts(availableProducts);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao carregar produtos:", errorMessage);
      setError(errorMessage);

      if (!errorMessage.includes("Token não encontrado")) {
        Alert.alert("Erro ao carregar cardápio", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    const existingItem = cart.find((item) => item.product.id === productId);

    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setCart(cart.filter((item) => item.product.id !== productId));
    }
  };

  const getCartQuantity = (productId: number): number => {
    const item = cart.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Carregando cardápio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorTitle}>Erro ao carregar cardápio</Text>
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
          <Text style={styles.title}>Cardápio</Text>
          <Text style={styles.subtitle}>
            Escolha seus produtos favoritos
          </Text>
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

        {/* Lista de produtos */}
        <View style={styles.productsContainer}>
          {filteredProducts.map((product) => {
            const quantity = getCartQuantity(product.id);

            return (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.productImageText}>
                      {product.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>
                      R$ {product.price.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {quantity === 0 ? (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addToCart(product)}
                  >
                    <Plus color="#FFF" size={20} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => removeFromCart(product.id)}
                    >
                      <Minus color="#FFF" size={16} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => addToCart(product)}
                    >
                      <Plus color="#FFF" size={16} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {filteredProducts.length === 0 && products.length > 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum produto encontrado na busca
              </Text>
            </View>
          )}

          {products.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum produto disponível no momento
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Carrinho Fixo */}
      {cart.length > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <View style={styles.cartBadge}>
              <ShoppingCart color="#FFF" size={20} />
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
            <View>
              <Text style={styles.cartLabel}>Total do pedido</Text>
              <Text style={styles.cartTotal}>
                R$ {getTotalPrice().toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => {
              // TODO: Navegar para tela de checkout
              Alert.alert("Em breve", "Finalização de pedido em desenvolvimento");
            }}
          >
            <Text style={styles.checkoutButtonText}>Finalizar Pedido</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#18181B",
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
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
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
  productsContainer: {
    gap: 12,
  },
  productCard: {
    backgroundColor: "#27272A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3F3F46",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productImageText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    color: "#DC2626",
    fontSize: 18,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: "#DC2626",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181B",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
  },
  quantityButton: {
    backgroundColor: "#DC2626",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  cartFooter: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: "#27272A",
    borderTopWidth: 1,
    borderTopColor: "#3F3F46",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartBadge: {
    backgroundColor: "#DC2626",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBadgeText: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFF",
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: "center",
    lineHeight: 20,
  },
  cartLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  cartTotal: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },
  checkoutButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
});