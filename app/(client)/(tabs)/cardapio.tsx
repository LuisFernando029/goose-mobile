import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Minus, ShoppingCart, Package, RefreshCw, Sandwich, Coffee, Cookie, Salad, MessageSquare } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface ItemPedido {
  productId: number;
  quantity: number;
  name: string;
  price: string;
}

const BASE_URL = "http://192.168.0.20:4000";

const CATEGORIAS = [
  { nome: 'Lanches', key: 'lanches', icon: Sandwich, color: '#DC2626' },
  { nome: 'Bebidas', key: 'bebidas', icon: Coffee, color: '#2563EB' },
  { nome: 'Acompanhamentos', key: 'acompanhamentos', icon: Salad, color: '#059669' },
  { nome: 'Sobremesas', key: 'sobremesas', icon: Cookie, color: '#EAB308' },
];

export default function ClientCardapioScreen() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedido, setPedido] = useState<ItemPedido[]>([]);
  const [observacao, setObservacao] = useState('');
  const [clientData, setClientData] = useState<any>(null);
  const [mesaOcupada, setMesaOcupada] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarObservacao, setMostrarObservacao] = useState(false);

  useEffect(() => {
    loadClientData();
    loadProdutos();
  }, []);

  const loadClientData = async () => {
    try {
      const data = await AsyncStorage.getItem('clientData');
      if (data) {
        const client = JSON.parse(data);
        setClientData(client);
        
        if (client.mesaId && client.mesaLabel) {
          setMesaOcupada({
            id: client.mesaId,
            label: client.mesaLabel
          });
        } else if (client.nome) {
          await loadMesaOcupada(client.nome);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    }
  };

  const loadMesaOcupada = async (clientName: string) => {
    try {
      const response = await fetch(`${BASE_URL}/tables`);
      if (!response.ok) return;

      const mesas = await response.json();
      const mesaOcupadaPeloCliente = mesas.find(
        (mesa: any) => 
          mesa.status === 'busy' && 
          mesa.reservedBy === clientName
      );

      setMesaOcupada(mesaOcupadaPeloCliente);
    } catch (error) {
      console.error('Erro ao carregar mesa ocupada:', error);
    }
  };

  const loadProdutos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/products`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.status}`);
      }

      const data = await response.json();
      
      const produtosDisponiveis = data.filter(
        (produto: Produto) => produto.isAvailable && produto.quantity > 0
      );
    
      setProdutos(produtosDisponiveis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      Alert.alert("Erro", `Não foi possível carregar os produtos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const adicionarItem = (produto: Produto) => {
    const existing = pedido.find(item => item.productId === produto.id);
    const quantidadeAtual = existing ? existing.quantity : 0;
    
    if (quantidadeAtual >= produto.quantity) {
      Alert.alert('Estoque insuficiente', `Apenas ${produto.quantity} unidades disponíveis.`);
      return;
    }
    
    if (existing) {
      setPedido(prev =>
        prev.map(item =>
          item.productId === produto.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setPedido(prev => [
        ...prev,
        {
          productId: produto.id,
          quantity: 1,
          name: produto.name,
          price: produto.price
        }
      ]);
    }
  };

  const removerItem = (produtoId: number) => {
    const existing = pedido.find(item => item.productId === produtoId);
    
    if (existing && existing.quantity > 1) {
      setPedido(prev =>
        prev.map(item =>
          item.productId === produtoId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setPedido(prev => prev.filter(item => item.productId !== produtoId));
    }
  };

  const getQuantidade = (produtoId: number) => {
    const item = pedido.find(i => i.productId === produtoId);
    return item ? item.quantity : 0;
  };

  const getTotalPedido = () => {
    return pedido.reduce((total, item) => {
      return total + (Number(item.price) * item.quantity);
    }, 0);
  };

  const finalizarPedido = async () => {
    if (pedido.length === 0) {
      Alert.alert('Pedido vazio', 'Adicione itens ao pedido antes de finalizar.');
      return;
    }

    if (!mesaOcupada) {
      Alert.alert(
        'Mesa não ocupada',
        'Você precisa ocupar uma mesa antes de fazer pedidos.',
        [
          { text: 'OK', style: 'cancel' },
          {
            text: 'Ocupar Mesa',
            onPress: () => router.push('/(client)/mesas')
          }
        ]
      );
      return;
    }

    // Mostra campo de observação se ainda não estiver visível
    if (!mostrarObservacao) {
      setMostrarObservacao(true);
      return;
    }

    // Confirmação final
    const mensagemConfirmacao = observacao.trim() 
      ? `Total: R$ ${getTotalPedido().toFixed(2)}\n\nPara ${mesaOcupada.label}\n\nObservação: ${observacao}`
      : `Total: R$ ${getTotalPedido().toFixed(2)}\n\nPara ${mesaOcupada.label}`;

    Alert.alert(
      'Confirmar Pedido',
      mensagemConfirmacao,
      [
        { 
          text: 'Voltar', 
          style: 'cancel',
          onPress: () => setMostrarObservacao(true)
        },
        { 
          text: 'Confirmar', 
          onPress: () => enviarPedido()
        },
      ]
    );
  };

  const enviarPedido = async () => {
    try {
      setLoadingPedido(true);

      const body = {
        customerName: clientData.nome,
        tableId: mesaOcupada.id,
        notes: observacao.trim() || null,
        items: pedido.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar pedido');
      }

      const novoPedido = await response.json();

      // Limpa o pedido e observação
      setPedido([]);
      setObservacao('');
      setMostrarObservacao(false);

      Alert.alert(
        'Pedido Enviado!',
        `Seu pedido #${novoPedido.id} foi enviado para a cozinha!\n\nTotal: R$ ${getTotalPedido().toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              loadProdutos();
              // Redireciona para Meus Pedidos
              router.push('/(client)/(tabs)/meusPedidos');
            }
          }
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      Alert.alert('Erro', `Não foi possível enviar o pedido: ${errorMessage}`);
    } finally {
      setLoadingPedido(false);
    }
  };

  const getProdutosPorCategoria = (categoriaKey: string) => {
    return produtos.filter(p => 
      p.category?.toLowerCase() === categoriaKey.toLowerCase()
    );
  };

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
        <Package color="#DC2626" size={48} />
        <Text style={styles.errorTitle}>Erro ao carregar cardápio</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.errorButton} onPress={loadProdutos}>
          <RefreshCw size={20} color="#FFF" />
          <Text style={styles.errorButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Cardápio</Text>
          <Text style={styles.subtitle}>
            {mesaOcupada ? `${mesaOcupada.label} - ${clientData?.nome}` : clientData?.nome || 'Cliente'}
          </Text>
          {!mesaOcupada && (
            <TouchableOpacity
              style={styles.ocuparMesaButton}
              onPress={() => router.push('/(client)/mesas')}
            >
              <Text style={styles.ocuparMesaText}>Ocupar uma Mesa</Text>
            </TouchableOpacity>
          )}
        </View>

        {mesaOcupada && (
          <View style={styles.mesaInfo}>
            <Text style={styles.mesaInfoText}>
              📍 Você está na {mesaOcupada.label}
            </Text>
          </View>
        )}

        <View style={styles.produtosContainer}>
          {produtos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Package color="#9CA3AF" size={40} />
              <Text style={styles.emptyText}>Nenhum produto disponível no momento</Text>
            </View>
          ) : (
            CATEGORIAS.map((categoria) => {
              const produtosCategoria = getProdutosPorCategoria(categoria.key);
              const CategoriaIcon = categoria.icon;

              if (produtosCategoria.length === 0) return null;

              return (
                <View key={categoria.key} style={styles.categoriaSection}>
                  <View style={styles.categoriaHeader}>
                    <CategoriaIcon size={24} color={categoria.color} />
                    <Text style={styles.categoriaTitulo}>{categoria.nome}</Text>
                    <View style={[styles.categoriaBadge, { backgroundColor: `${categoria.color}20` }]}>
                      <Text style={[styles.categoriaBadgeText, { color: categoria.color }]}>
                        {produtosCategoria.length}
                      </Text>
                    </View>
                  </View>

                  {produtosCategoria.map((produto) => (
                    <View key={produto.id} style={styles.produtoCard}>
                      <View style={styles.produtoInfo}>
                        <Text style={styles.produtoNome}>{produto.name}</Text>
                        {produto.description && (
                          <Text style={styles.produtoDescricao}>{produto.description}</Text>
                        )}
                        <View style={styles.precoEstoqueContainer}>
                          <Text style={styles.produtoPreco}>R$ {Number(produto.price).toFixed(2)}</Text>
                          <Text style={styles.produtoEstoque}>
                            {produto.quantity} {produto.quantity === 1 ? 'unidade' : 'unidades'}
                          </Text>
                        </View>
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
                          disabled={getQuantidade(produto.id) >= produto.quantity}
                        >
                          <Plus size={20} color={getQuantidade(produto.id) >= produto.quantity ? "#6B7280" : "#22C55E"} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {pedido.length > 0 && (
        <View style={styles.footer}>
          {mostrarObservacao && (
            <View style={styles.observacaoContainer}>
              <View style={styles.observacaoHeader}>
                <MessageSquare size={16} color="#9CA3AF" />
                <Text style={styles.observacaoLabel}>Observações (opcional)</Text>
              </View>
              <TextInput
                style={styles.observacaoInput}
                placeholder="Ex: Sem cebola, pouco sal..."
                placeholderTextColor="#6B7280"
                value={observacao}
                onChangeText={setObservacao}
                multiline
                numberOfLines={2}
                maxLength={200}
              />
              <Text style={styles.observacaoCounter}>
                {observacao.length}/200
              </Text>
            </View>
          )}

          <View style={styles.pedidoInfo}>
            <Text style={styles.pedidoTotal}>
              Total: R$ {getTotalPedido().toFixed(2)}
            </Text>
            <Text style={styles.pedidoItens}>
              {pedido.reduce((total, item) => total + item.quantity, 0)} itens
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.finalizarButton} 
            onPress={finalizarPedido}
            disabled={loadingPedido}
          >
            {loadingPedido ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                {!mostrarObservacao && <MessageSquare size={20} color="#FFF" />}
                <Text style={styles.finalizarButtonText}>
                  {mostrarObservacao ? 'Confirmar Pedido' : 'Adicionar Observação'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {mostrarObservacao && (
            <TouchableOpacity 
              style={styles.pularObservacaoButton} 
              onPress={() => {
                Alert.alert(
                  'Confirmar Pedido',
                  `Total: R$ ${getTotalPedido().toFixed(2)}\n\nPara ${mesaOcupada.label}`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Confirmar', onPress: () => enviarPedido() },
                  ]
                );
              }}
            >
              <Text style={styles.pularObservacaoText}>Pular e Finalizar</Text>
            </TouchableOpacity>
          )}
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
  ocuparMesaButton: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ocuparMesaText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mesaInfo: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    marginBottom: 16,
  },
  mesaInfoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  produtosContainer: {
    padding: 16,
  },
  categoriaSection: {
    marginBottom: 32,
  },
  categoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  categoriaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  categoriaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoriaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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
  precoEstoqueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  produtoPreco: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  produtoEstoque: {
    color: '#6B7280',
    fontSize: 12,
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
  observacaoContainer: {
    marginBottom: 12,
    backgroundColor: '#18181B',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  observacaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  observacaoLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  observacaoInput: {
    color: '#FFF',
    fontSize: 14,
    backgroundColor: '#27272A',
    borderRadius: 6,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  observacaoCounter: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
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
  pularObservacaoButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  pularObservacaoText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  errorButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 14,
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
});