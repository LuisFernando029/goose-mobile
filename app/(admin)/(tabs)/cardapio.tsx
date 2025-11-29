import { Edit, Package, Plus, Search, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
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
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  estoque: number;
}

const produtosIniciais: Produto[] = [
  { id: 1, nome: "Vinho Tinto Reserva", descricao: "Cabernet Sauvignon, safra 2020", categoria: "Vinhos", preco: 89.9, estoque: 15 },
  { id: 2, nome: "Vinho Branco Seco", descricao: "Chardonnay, safra 2021", categoria: "Vinhos", preco: 75.0, estoque: 20 },
  { id: 3, nome: "Cerveja Artesanal IPA", descricao: "American IPA, 500ml", categoria: "Cervejas", preco: 18.0, estoque: 30 },
  { id: 4, nome: "Caipirinha", descricao: "Limão, cachaça artesanal", categoria: "Drinks", preco: 18.0, estoque: 100 },
  { id: 5, nome: "Tábua de Frios", descricao: "Queijos, salames, azeitonas", categoria: "Petiscos", preco: 45.0, estoque: 20 },
  { id: 6, nome: "Espumante Brut", descricao: "Método tradicional", categoria: "Vinhos", preco: 95.0, estoque: 8 },
];

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>(produtosIniciais);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Gestão de Produtos</Text>
          <Text style={styles.subtitle}>Gerencie o catálogo e controle de estoque</Text>
          <TouchableOpacity style={styles.addButton}>
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
            <Text style={styles.statValue}>{produtos.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Baixo Estoque</Text>
            <Text style={[styles.statValue, { color: "#DC2626" }]}>
              {produtos.filter((p) => p.estoque < 10).length}
            </Text>
          </View>
        </View>

        {/* Lista de produtos */}
        <View style={styles.produtosContainer}>
          {filteredProdutos.map((produto) => (
            <View key={produto.id} style={styles.card}>
              <Text style={styles.cardTitle}>{produto.nome}</Text>
              <Text style={styles.cardCategoria}>{produto.categoria}</Text>
              <Text style={styles.cardDescricao}>{produto.descricao}</Text>

              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Preço:</Text>
                <Text style={styles.cardPreco}>R$ {produto.preco.toFixed(2)}</Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Estoque:</Text>
                <Text
                  style={[
                    styles.cardEstoque,
                    { color: produto.estoque < 10 ? "#DC2626" : "#FFF" },
                  ]}
                >
                  {produto.estoque} unidades
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton}>
                  <Edit color="#9CA3AF" size={18} />
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton}>
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
  },
  statCard: {
    backgroundColor: "#27272A",
    borderRadius: 10,
    padding: 14,
    width: width * 0.43,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  cardCategoria: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 6,
  },
  cardDescricao: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 8,
  },
  cardInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    marginTop: 12,
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
  },
});
