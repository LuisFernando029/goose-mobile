import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Minus, ShoppingCart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
}

interface ItemPedido {
  produto: Produto;
  quantidade: number;
}

export default function ClientCardapioScreen() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedido, setPedido] = useState<ItemPedido[]>([]);
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    loadClientData();
    loadProdutos();
  }, []);

  const loadClientData = async () => {
    const data = await AsyncStorage.getItem('clientData');
    if (data) {
      setClientData(JSON.parse(data));
    }
  };

  const loadProdutos = () => {
    // Mock de produtos - na prática viria da API
    const produtosMock: Produto[] = [
      { id: 1, nome: "Vinho Tinto Reserva", descricao: "Cabernet Sauvignon, safra 2020", categoria: "Vinhos", preco: 89.9 },
      { id: 2, nome: "Vinho Branco Seco", descricao: "Chardonnay, safra 2021", categoria: "Vinhos", preco: 75.0 },
      { id: 3, nome: "Cerveja Artesanal IPA", descricao: "American IPA, 500ml", categoria: "Cervejas", preco: 18.0 },
      { id: 4, nome: "Caipirinha", descricao: "Limão, cachaça artesanal", categoria: "Drinks", preco: 18.0 },
      { id: 5, nome: "Tábua de Frios", descricao: "Queijos, salames, azeitonas", categoria: "Petiscos", preco: 45.0 },
    ];
    setProdutos(produtosMock);
  };

  const adicionarItem = (produto: Produto) => {
    setPedido(prev => {
      const existing = prev.find(item => item.produto.id === produto.id);
      if (existing) {
        return prev.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const removerItem = (produtoId: number) => {
    setPedido(prev => {
      const existing = prev.find(item => item.produto.id === produtoId);
      if (existing && existing.quantidade > 1) {
        return prev.map(item =>
          item.produto.id === produtoId
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        );
      }
      return prev.filter(item => item.produto.id !== produtoId);
    });
  };

  const getQuantidade = (produtoId: number) => {
    const item = pedido.find(i => i.produto.id === produtoId);
    return item ? item.quantidade : 0;
  };

  const getTotalPedido = () => {
    return pedido.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0);
  };

  const finalizarPedido = () => {
    if (pedido.length === 0) {
      Alert.alert('Pedido vazio', 'Adicione itens ao pedido antes de finalizar.');
      return;
    }

    Alert.alert(
      'Confirmar Pedido',
      `Total: R$ ${getTotalPedido().toFixed(2)}\n\nPara a mesa ${clientData?.mesa}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            // Aqui enviaria o pedido para a API
            Alert.alert('Sucesso!', 'Pedido enviado para a cozinha!');
            setPedido([]);
          }
        },
      ]
    );
  };

  if (!clientData?.mesa) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Nenhuma mesa reservada</Text>
          <Text style={styles.errorText}>
            Você precisa reservar uma mesa antes de fazer pedidos
          </Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Reservar Mesa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Cardápio</Text>
          <Text style={styles.subtitle}>Mesa {clientData.mesa} - {clientData.nome}</Text>
        </View>

        <View style={styles.produtosContainer}>
          {produtos.map((produto) => (
            <View key={produto.id} style={styles.produtoCard}>
              <View style={styles.produtoInfo}>
                <Text style={styles.produtoNome}>{produto.nome}</Text>
                <Text style={styles.produtoDescricao}>{produto.descricao}</Text>
                <Text style={styles.produtoCategoria}>{produto.categoria}</Text>
                <Text style={styles.produtoPreco}>R$ {produto.preco.toFixed(2)}</Text>
              </View>

              <View style={styles.controles}>
                <TouchableOpacity
                  style={styles.controleButton}
                  onPress={() => removerItem(produto.id)}
                  disabled={getQuantidade(produto.id) === 0}
                >
                  <Minus size={20} color={getQuantidade(produto.id) === 0 ? "#6B7280" : "#DC2626"} />
                </TouchableOpacity>

                <Text style={styles.quantidade}>
                  {getQuantidade(produto.id)}
                </Text>

                <TouchableOpacity
                  style={styles.controleButton}
                  onPress={() => adicionarItem(produto)}
                >
                  <Plus size={20} color="#22C55E" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {pedido.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.pedidoInfo}>
            <Text style={styles.pedidoTotal}>
              Total: R$ {getTotalPedido().toFixed(2)}
            </Text>
            <Text style={styles.pedidoItens}>
              {pedido.reduce((total, item) => total + item.quantidade, 0)} itens
            </Text>
          </View>
          <TouchableOpacity style={styles.finalizarButton} onPress={finalizarPedido}>
            <ShoppingCart size={20} color="#FFF" />
            <Text style={styles.finalizarButtonText}>Finalizar Pedido</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  scroll: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  produtosContainer: {
    padding: 16,
  },
  produtoCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  produtoDescricao: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  produtoCategoria: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  produtoPreco: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantidade: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
    backgroundColor: '#27272A',
  },
  pedidoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pedidoTotal: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pedidoItens: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  finalizarButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  finalizarButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});